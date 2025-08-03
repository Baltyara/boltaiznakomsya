# 🎤 Болтай и Знакомься - Backend API

Backend API для приложения голосовых знакомств "Болтай и Знакомься".

## 🚀 Технологии

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Основная база данных
- **Redis** - Кэширование и очереди
- **Socket.IO** - Real-time коммуникация
- **JWT** - Аутентификация
- **bcryptjs** - Хеширование паролей
- **express-validator** - Валидация данных

## 📁 Структура проекта

```
backend/
├── src/
│   ├── config/          # Конфигурация БД и Redis
│   ├── controllers/     # Контроллеры API
│   ├── middleware/      # Middleware (auth, validation)
│   ├── models/          # Модели данных
│   ├── routes/          # Маршруты API
│   ├── services/        # Бизнес-логика
│   ├── utils/           # Утилиты
│   └── server.js        # Основной сервер
├── database.sql         # SQL скрипт для создания БД
├── package.json         # Зависимости
└── README.md           # Документация
```

## 🛠 Установка и запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка базы данных
```bash
# Создайте базу данных PostgreSQL
createdb boltaiznakomsya

# Запустите SQL скрипт
psql -d boltaiznakomsya -f database.sql
```

### 3. Настройка Redis
```bash
# Установите и запустите Redis
redis-server
```

### 4. Конфигурация
```bash
# Скопируйте пример конфигурации
cp env.example .env

# Отредактируйте .env файл
```

### 5. Запуск сервера
```bash
# Режим разработки
npm run dev

# Продакшн
npm start
```

## 📡 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Получить профиль
- `PUT /api/auth/profile` - Обновить профиль
- `PUT /api/auth/preferences` - Обновить настройки
- `DELETE /api/auth/account` - Удалить аккаунт

### Звонки
- `POST /api/calls` - Создать звонок
- `GET /api/calls` - Получить звонки пользователя
- `GET /api/calls/stats` - Статистика звонков
- `PUT /api/calls/:id/rating` - Оценить звонок
- `GET /api/calls/recent-matches` - Недавние совпадения
- `GET /api/calls/liked-users` - Понравившиеся пользователи

### Матчмейкинг
- `POST /api/matchmaking/join-queue` - Войти в очередь
- `POST /api/matchmaking/leave-queue` - Покинуть очередь
- `POST /api/matchmaking/find-match` - Найти совпадение
- `GET /api/matchmaking/queue-status` - Статус очереди
- `GET /api/matchmaking/online-users` - Онлайн пользователи

## 🔐 Аутентификация

API использует JWT токены. Добавьте заголовок:
```
Authorization: Bearer <your-jwt-token>
```

## 🗄 База данных

### Таблицы

#### users
- `id` - Уникальный идентификатор
- `name` - Имя пользователя
- `email` - Email (уникальный)
- `password` - Хешированный пароль
- `age` - Возраст
- `gender` - Пол (male/female)
- `interests` - Массив интересов
- `location` - Местоположение
- `about_me` - О себе
- `looking_for` - Кого ищет (male/female/both)
- `is_online` - Онлайн статус
- `created_at` - Дата создания
- `updated_at` - Дата обновления

#### calls
- `id` - Уникальный идентификатор
- `user_id_1` - ID первого пользователя
- `user_id_2` - ID второго пользователя
- `duration` - Длительность звонка (секунды)
- `rating` - Оценка (1-5)
- `feedback` - Комментарий
- `action` - Действие (like/pass)
- `created_at` - Дата создания
- `updated_at` - Дата обновления

## 🔄 WebSocket Events

### Клиент → Сервер
- `join-queue` - Войти в очередь матчмейкинга
- `leave-queue` - Покинуть очередь
- `call-signal` - WebRTC сигналинг
- `end-call` - Завершить звонок

### Сервер → Клиент
- `match-found` - Найдено совпадение
- `call-signal` - WebRTC сигналинг
- `call-ended` - Звонок завершен

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Тесты с покрытием
npm run test:coverage
```

## 📊 Мониторинг

- Health check: `GET /health`
- Логирование: Morgan + Winston
- Метрики: Prometheus (планируется)

## 🚀 Деплой

### Docker
```bash
# Сборка образа
docker build -t boltaiznakomsya-backend .

# Запуск контейнера
docker run -p 3001:3001 boltaiznakomsya-backend
```

### Heroku
```bash
# Создание приложения
heroku create boltaiznakomsya-backend

# Настройка переменных окружения
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# Деплой
git push heroku main
```

## 📝 Лицензия

MIT License 