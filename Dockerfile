# Frontend Dockerfile
FROM node:18-alpine AS base

# Установка зависимостей
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копирование package файлов
COPY package.json package-lock.json* ./
RUN npm ci

# Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Сборка для продакшена
RUN npm run build

# Продакшн образ
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Удаление дефолтных файлов nginx
RUN rm -rf ./*

# Копирование собранного приложения
COPY --from=builder /app/dist .

# Копирование nginx конфигурации
COPY nginx.conf /etc/nginx/nginx.conf

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Создание директорий для nginx и установка прав
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx
RUN chown -R nextjs:nodejs /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html
RUN touch /run/nginx.pid && chown nextjs:nodejs /run/nginx.pid

# Переключение на пользователя nginx
USER nextjs

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"] 