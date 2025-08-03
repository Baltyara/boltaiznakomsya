# 🎤 Болтай и Знакомься

Голосовое приложение для знакомств с 5-минутными звонками.

## 🚀 Быстрый старт

### Вариант 1: Автоматический запуск (Windows)
```bash
start-dev.bat
```

### Вариант 2: Ручной запуск

#### 1. Установка зависимостей
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

#### 2. Настройка базы данных
```bash
# Установите PostgreSQL и Redis
# Создайте базу данных
createdb boltaiznakomsya

# Запустите SQL скрипт
psql -d boltaiznakomsya -f backend/database.sql
```

#### 3. Настройка переменных окружения
```bash
# Frontend
cp env.example .env

# Backend
cd backend
cp env.example .env
cd ..
```

#### 4. Запуск приложения
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### 🌐 Доступные URL
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📁 Структура проекта

```
boltaiznakomsya/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # UI компоненты
│   ├── contexts/          # React Context
│   ├── pages/             # Страницы приложения
│   └── services/          # API и WebSocket сервисы
├── backend/               # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/   # Контроллеры API
│   │   ├── models/        # Модели базы данных
│   │   ├── routes/        # Маршруты API
│   │   └── middleware/    # Middleware
│   └── database.sql       # SQL скрипты
└── README.md
```

## 🛠 Технологии

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- React Router DOM
- Socket.io Client

### Backend
- Node.js + Express
- PostgreSQL
- Redis
- Socket.io
- JWT Authentication
- bcryptjs

## 📚 Документация

- [API Documentation](backend/README.md)
- [Architecture](ARCHITECTURE.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Functions](FUNCTIONS.md)
- [Changelog](CHANGELOG.md)

## 🎯 Основные функции

- ✅ Регистрация и аутентификация пользователей
- ✅ Создание и редактирование профиля
- ✅ Система матчмейкинга по интересам
- ✅ Голосовые звонки с WebRTC
- ✅ Система оценок и обратной связи
- ✅ Real-time коммуникация через WebSocket
- ✅ Полноценный REST API

## 🔧 Разработка

### Требования
- Node.js 18+
- PostgreSQL 12+
- Redis 6+

### Команды разработки
```bash
# Frontend
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run lint         # Проверка кода

# Backend
cd backend
npm run dev          # Запуск в режиме разработки
npm run start        # Запуск в продакшене
npm run test         # Запуск тестов
```

## 🌐 Продакшн развертывание

**Сервер**: 188.225.45.8  
**Домен**: boltaiznakomsya.ru

### Быстрый запуск:
```bash
# В WSL Ubuntu
cd /mnt/c/Users/balty/Desktop/111/boltaiznakomsya
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

📋 **Подробные инструкции**: [DEPLOY-NOW.md](./DEPLOY-NOW.md)

### Поддомены:
- `boltaiznakomsya.ru` - Основное приложение
- `api.boltaiznakomsya.ru` - Backend API  
- `admin.boltaiznakomsya.ru` - Админ панель
- `static.boltaiznakomsya.ru` - Статические файлы
- `monitor.boltaiznakomsya.ru` - Мониторинг

## 📊 Статус проекта

- **Frontend**: ✅ Готов
- **Backend API**: ✅ Готов
- **Интеграция**: ✅ Готов
- **Тестирование**: ✅ 48% тестов проходят
- **Продакшн**: 🚀 Готов к развертыванию!

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License
