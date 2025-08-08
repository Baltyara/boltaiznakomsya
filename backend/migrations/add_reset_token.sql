-- Миграция для добавления полей восстановления пароля
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Создание индекса для оптимизации поиска по reset_token
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token); 