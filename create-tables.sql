-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 18 AND age <= 100),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
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

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_online ON users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);
CREATE INDEX IF NOT EXISTS idx_calls_user1 ON calls(user_id_1);
CREATE INDEX IF NOT EXISTS idx_calls_user2 ON calls(user_id_2);
CREATE INDEX IF NOT EXISTS idx_calls_created ON calls(created_at);

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