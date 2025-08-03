-- Создание базы данных
CREATE DATABASE IF NOT EXISTS boltaiznakomsya;

-- Использование базы данных
\c boltaiznakomsya;

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 18 AND age <= 100),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    interests TEXT[] DEFAULT '{}',
    location VARCHAR(100),
    about_me TEXT,
    looking_for VARCHAR(10) DEFAULT 'both' CHECK (looking_for IN ('male', 'female', 'both')),
    notification_settings JSONB DEFAULT '{}',
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы звонков
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    user_id_1 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    duration INTEGER DEFAULT 0, -- в секундах
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    action VARCHAR(10) CHECK (action IN ('like', 'pass')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы жалоб на пользователей
CREATE TABLE IF NOT EXISTS user_reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(20) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'fake', 'harassment', 'other')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(reporter_id, reported_user_id) -- Один пользователь может пожаловаться на другого только один раз
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);
CREATE INDEX IF NOT EXISTS idx_calls_user1 ON calls(user_id_1);
CREATE INDEX IF NOT EXISTS idx_calls_user2 ON calls(user_id_2);
CREATE INDEX IF NOT EXISTS idx_calls_created ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_created ON user_reports(created_at);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггеров для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calls_updated_at 
    BEFORE UPDATE ON calls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reports_updated_at 
    BEFORE UPDATE ON user_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных
INSERT INTO users (name, email, password_hash, age, gender, interests, location, about_me, is_online) VALUES
('Анна', 'anna@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 24, 'female', ARRAY['Музыка', 'Путешествия', 'Кино'], 'Москва', 'Люблю путешествовать и слушать музыку', true),
('Мария', 'maria@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 26, 'female', ARRAY['Книги', 'Искусство', 'Йога'], 'Санкт-Петербург', 'Увлекаюсь йогой и искусством', true),
('Елена', 'elena@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 23, 'female', ARRAY['Спорт', 'Кулинария', 'Фотография'], 'Казань', 'Люблю готовить и заниматься спортом', true),
('Александр', 'alex@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 25, 'male', ARRAY['Технологии', 'Игры', 'Спорт'], 'Новосибирск', 'Программист, увлекаюсь играми', true),
('Дмитрий', 'dmitry@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 27, 'male', ARRAY['Музыка', 'Наука', 'История'], 'Екатеринбург', 'Историк, люблю музыку и науку', true)
ON CONFLICT (email) DO NOTHING;

-- Вставка тестовых звонков
INSERT INTO calls (user_id_1, user_id_2, duration, rating, feedback, action) VALUES
(1, 4, 300, 4, 'Отличный разговор!', 'like'),
(2, 5, 240, 3, 'Нормально пообщались', 'pass'),
(3, 4, 180, 5, 'Очень понравилось!', 'like'),
(1, 5, 120, 2, 'Не очень', 'pass'),
(2, 4, 360, 4, 'Хороший собеседник', 'like')
ON CONFLICT DO NOTHING; 