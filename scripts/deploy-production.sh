#!/bin/bash

# Скрипт развертывания проекта "Болтай и Знакомься" на продакшн сервере
# Использование: ./scripts/deploy-production.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация сервера
SERVER_IP="188.225.45.8"
SERVER_USER="root"
SERVER_PASS="gZXARohbyD4P-c"
DOMAIN="boltaiznakomsya.ru"
PROJECT_NAME="boltaiznakomsya"

echo -e "${BLUE}🚀 Начинаем развертывание проекта ${PROJECT_NAME} на сервере${NC}"

# Функция для выполнения команд на сервере
run_remote() {
    echo -e "${YELLOW}📡 Выполняем: $1${NC}"
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Функция для копирования файлов на сервер
copy_to_server() {
    echo -e "${YELLOW}📤 Копируем: $1 -> $2${NC}"
    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -r "$1" "$SERVER_USER@$SERVER_IP:$2"
}

# 1. Проверка подключения к серверу
echo -e "${BLUE}1. Проверяем подключение к серверу...${NC}"
if sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "echo 'Подключение успешно'"; then
    echo -e "${GREEN}✅ Подключение к серверу установлено${NC}"
else
    echo -e "${RED}❌ Ошибка подключения к серверу${NC}"
    exit 1
fi

# 2. Обновление системы и установка зависимостей
echo -e "${BLUE}2. Обновляем систему и устанавливаем зависимости...${NC}"
run_remote "apt update && apt upgrade -y"
run_remote "apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git curl"
run_remote "systemctl enable docker && systemctl start docker"
run_remote "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt install -y nodejs"

# 3. Настройка файрвола
echo -e "${BLUE}3. Настраиваем файрвол...${NC}"
run_remote "ufw allow 22/tcp"  # SSH
run_remote "ufw allow 80/tcp"  # HTTP
run_remote "ufw allow 443/tcp" # HTTPS
run_remote "ufw --force enable"

# 4. Создание рабочей директории
echo -e "${BLUE}4. Создаем рабочую директорию...${NC}"
run_remote "mkdir -p /var/www/$PROJECT_NAME"
run_remote "cd /var/www/$PROJECT_NAME && rm -rf *"

# 5. Копирование файлов проекта
echo -e "${BLUE}5. Копируем файлы проекта...${NC}"
copy_to_server "." "/var/www/$PROJECT_NAME/"

# 6. Создание production файлов окружения
echo -e "${BLUE}6. Создаем production конфигурацию...${NC}"
run_remote "cd /var/www/$PROJECT_NAME && cat > .env.production << 'EOF'
# Frontend
VITE_API_BASE_URL=https://api.$DOMAIN
VITE_WEBSOCKET_URL=wss://api.$DOMAIN
VITE_DOMAIN=$DOMAIN

# Backend
NODE_ENV=production
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=${PROJECT_NAME}_prod
DB_USER=${PROJECT_NAME}_user
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_URL=redis://redis:6379
JWT_SECRET=$(openssl rand -base64 64)
CORS_ORIGIN=https://$DOMAIN,https://app.$DOMAIN

# Database
POSTGRES_DB=${PROJECT_NAME}_prod
POSTGRES_USER=${PROJECT_NAME}_user
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)
EOF"

# 7. Создание production docker-compose
echo -e "${BLUE}7. Создаем production docker-compose...${NC}"
run_remote "cd /var/www/$PROJECT_NAME && cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ${PROJECT_NAME}_postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=\${POSTGRES_DB}
      - POSTGRES_USER=\${POSTGRES_USER}
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: ${PROJECT_NAME}_redis
    restart: unless-stopped
    command: redis-server --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - app-network

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: ${PROJECT_NAME}_backend
    restart: unless-stopped
    env_file:
      - .env.production
    ports:
      - \"3001:3001\"
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - VITE_API_BASE_URL=https://api.$DOMAIN
        - VITE_WEBSOCKET_URL=wss://api.$DOMAIN
    container_name: ${PROJECT_NAME}_frontend
    restart: unless-stopped
    ports:
      - \"3000:80\"
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
EOF"

# 8. Настройка Nginx
echo -e "${BLUE}8. Настраиваем Nginx...${NC}"
run_remote "cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
# Основной домен - Frontend
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL сертификаты (будут созданы позже)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Безопасность SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Безопасность заголовков
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
    add_header Content-Security-Policy \"default-src 'self' http: https: data: blob: 'unsafe-inline'\" always;
    
    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# API поддомен - Backend
server {
    listen 80;
    listen [::]:80;
    server_name api.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Увеличиваем таймауты для WebSocket
    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket поддержка
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
    }
}
EOF"

# Включаем сайт
run_remote "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
run_remote "rm -f /etc/nginx/sites-enabled/default"
run_remote "nginx -t"

# 9. Сборка и запуск проекта
echo -e "${BLUE}9. Собираем и запускаем проект...${NC}"
run_remote "cd /var/www/$PROJECT_NAME && docker-compose -f docker-compose.prod.yml build"
run_remote "cd /var/www/$PROJECT_NAME && docker-compose -f docker-compose.prod.yml up -d"

# 10. Получение SSL сертификатов
echo -e "${BLUE}10. Получаем SSL сертификаты...${NC}"
run_remote "systemctl reload nginx"
run_remote "certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN"

# 11. Настройка автообновления сертификатов
echo -e "${BLUE}11. Настраиваем автообновление SSL сертификатов...${NC}"
run_remote "crontab -l | { cat; echo '0 12 * * * /usr/bin/certbot renew --quiet'; } | crontab -"

# 12. Настройка мониторинга
echo -e "${BLUE}12. Настраиваем мониторинг...${NC}"
run_remote "cat > /root/health-check.sh << 'EOF'
#!/bin/bash
# Проверка здоровья сервисов

echo \"=== Проверка здоровья сервисов ===\" > /var/log/health-check.log
echo \"Время: \$(date)\" >> /var/log/health-check.log

# Проверка Docker контейнеров
echo \"Docker контейнеры:\" >> /var/log/health-check.log
docker ps --format \"table {{.Names}}\t{{.Status}}\" >> /var/log/health-check.log

# Проверка доступности сайта
if curl -f -s https://$DOMAIN > /dev/null; then
    echo \"✅ Сайт $DOMAIN доступен\" >> /var/log/health-check.log
else
    echo \"❌ Сайт $DOMAIN недоступен\" >> /var/log/health-check.log
fi

# Проверка API
if curl -f -s https://api.$DOMAIN/api/health > /dev/null; then
    echo \"✅ API доступен\" >> /var/log/health-check.log
else
    echo \"❌ API недоступен\" >> /var/log/health-check.log
fi
EOF"

run_remote "chmod +x /root/health-check.sh"
run_remote "crontab -l | { cat; echo '*/5 * * * * /root/health-check.sh'; } | crontab -"

# 13. Создание скрипта обновления
echo -e "${BLUE}13. Создаем скрипт обновления...${NC}"
run_remote "cat > /root/update-app.sh << 'EOF'
#!/bin/bash
cd /var/www/$PROJECT_NAME
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
echo \"Приложение обновлено: \$(date)\" >> /var/log/app-updates.log
EOF"

run_remote "chmod +x /root/update-app.sh"

echo -e "${GREEN}🎉 Развертывание завершено успешно!${NC}"
echo -e "${GREEN}✅ Сайт доступен: https://$DOMAIN${NC}"
echo -e "${GREEN}✅ API доступен: https://api.$DOMAIN${NC}"
echo -e "${YELLOW}📝 Логи мониторинга: /var/log/health-check.log${NC}"
echo -e "${YELLOW}📝 Логи обновлений: /var/log/app-updates.log${NC}"

echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo -e "1. Настройте DNS записи для поддоменов"
echo -e "2. Проверьте работу сайта: https://$DOMAIN"
echo -e "3. Проверьте API: https://api.$DOMAIN/api/health"
echo -e "4. Настройте мониторинг и алерты" 