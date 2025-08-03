const { Pool } = require('pg');
const Redis = require('ioredis');

// Тестовая база данных
const testDbPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'boltaiznakomsya_test',
});

// Тестовый Redis
const testRedis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: 1, // Используем отдельную БД для тестов
});

// Очистка тестовой базы данных
async function cleanTestDatabase() {
  try {
    // Очищаем все таблицы
    await testDbPool.query('TRUNCATE TABLE user_reports CASCADE');
    await testDbPool.query('TRUNCATE TABLE calls CASCADE');
    await testDbPool.query('TRUNCATE TABLE users CASCADE');
    
    // Сбрасываем последовательности
    await testDbPool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await testDbPool.query('ALTER SEQUENCE calls_id_seq RESTART WITH 1');
    await testDbPool.query('ALTER SEQUENCE user_reports_id_seq RESTART WITH 1');
    
    console.log('✅ Тестовая база данных очищена');
  } catch (error) {
    console.error('❌ Ошибка очистки тестовой БД:', error);
  }
}

// Очистка тестового Redis
async function cleanTestRedis() {
  try {
    await testRedis.flushdb();
    console.log('✅ Тестовый Redis очищен');
  } catch (error) {
    console.error('❌ Ошибка очистки тестового Redis:', error);
  }
}

// Инициализация тестовых данных
async function setupTestData() {
  try {
    // Создаем тестовых пользователей
    const testUsers = [
      {
        name: 'Test User 1',
        email: 'test1@example.com',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2',
        age: 25,
        gender: 'male',
        interests: ['music', 'sports'],
        location: 'Moscow',
        about_me: 'Test user 1',
        is_online: true
      },
      {
        name: 'Test User 2',
        email: 'test2@example.com',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2',
        age: 26,
        gender: 'female',
        interests: ['books', 'art'],
        location: 'St. Petersburg',
        about_me: 'Test user 2',
        is_online: true
      }
    ];

    for (const user of testUsers) {
      await testDbPool.query(`
        INSERT INTO users (name, email, password_hash, age, gender, interests, location, about_me, is_online)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [user.name, user.email, user.password_hash, user.age, user.gender, user.interests, user.location, user.about_me, user.is_online]);
    }

    console.log('✅ Тестовые данные созданы');
  } catch (error) {
    console.error('❌ Ошибка создания тестовых данных:', error);
  }
}

// Глобальная настройка для всех E2E тестов
global.beforeAll(async () => {
  await cleanTestDatabase();
  await cleanTestRedis();
  await setupTestData();
});

global.afterAll(async () => {
  await testDbPool.end();
  await testRedis.quit();
});

// Экспортируем для использования в тестах
module.exports = {
  testDbPool,
  testRedis,
  cleanTestDatabase,
  cleanTestRedis,
  setupTestData
}; 