const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const { testDbPool } = require('./setup');

describe('Auth E2E Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Получаем тестового пользователя из БД
    const result = await testDbPool.query('SELECT * FROM users WHERE email = $1', ['test1@example.com']);
    testUser = result.rows[0];
  });

  beforeEach(async () => {
    // Очищаем токены перед каждым тестом
    authToken = null;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
        age: 25,
        gender: 'male',
        lookingFor: 'female',
        location: 'Moscow',
        interests: ['music', 'sports'],
        aboutMe: 'Test user description'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Проверяем ответ
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.age).toBe(userData.age);
      expect(response.body.user.gender).toBe(userData.gender);

      // Проверяем, что пользователь создан в БД
      const dbResult = await testDbPool.query('SELECT * FROM users WHERE email = $1', [userData.email]);
      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].email).toBe(userData.email);
      expect(dbResult.rows[0].name).toBe(userData.name);

      // Проверяем, что пароль захеширован
      const isPasswordValid = await bcrypt.compare(userData.password, dbResult.rows[0].password_hash);
      expect(isPasswordValid).toBe(true);
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'test1@example.com', // Уже существует
        password: 'Password123',
        name: 'Duplicate User',
        age: 25,
        gender: 'male',
        lookingFor: 'female'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('уже существует');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test User',
        age: 25,
        gender: 'male',
        lookingFor: 'female'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    it('should validate password strength', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak', // Слишком короткий
        name: 'Test User',
        age: 25,
        gender: 'male',
        lookingFor: 'female'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('пароль');
    });

    it('should validate age range', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
        age: 15, // Слишком молодой
        gender: 'male',
        lookingFor: 'female'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('возраст');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test1@example.com',
        password: 'password123' // Пароль из тестовых данных
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.name).toBe('Test User 1');

      // Проверяем, что токен валидный
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET || 'your-secret-key');
      expect(decoded).toHaveProperty('userId');
      expect(decoded.userId).toBe(testUser.id);

      authToken = response.body.token;
    });

    it('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('неверные');
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'test1@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('неверные');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      // Логинимся для получения токена
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test1@example.com',
          password: 'password123'
        });
      authToken = loginResponse.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('name');
      expect(response.body.email).toBe('test1@example.com');
      expect(response.body.name).toBe('Test User 1');
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('токен');
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('токен');
    });
  });

  describe('PUT /api/auth/profile', () => {
    beforeEach(async () => {
      // Логинимся для получения токена
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test1@example.com',
          password: 'password123'
        });
      authToken = loginResponse.body.token;
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        age: 26,
        location: 'Updated Location',
        aboutMe: 'Updated description',
        interests: ['new', 'interests']
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('обновлен');

      // Проверяем, что данные обновились в БД
      const dbResult = await testDbPool.query('SELECT * FROM users WHERE id = $1', [testUser.id]);
      expect(dbResult.rows[0].name).toBe(updateData.name);
      expect(dbResult.rows[0].age).toBe(updateData.age);
      expect(dbResult.rows[0].location).toBe(updateData.location);
      expect(dbResult.rows[0].about_me).toBe(updateData.aboutMe);
      expect(dbResult.rows[0].interests).toEqual(updateData.interests);
    });

    it('should validate update data', async () => {
      const invalidData = {
        age: 15, // Слишком молодой
        name: '' // Пустое имя
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/auth/account', () => {
    beforeEach(async () => {
      // Логинимся для получения токена
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test1@example.com',
          password: 'password123'
        });
      authToken = loginResponse.body.token;
    });

    it('should delete user account successfully', async () => {
      const response = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('удален');

      // Проверяем, что пользователь удален из БД
      const dbResult = await testDbPool.query('SELECT * FROM users WHERE id = $1', [testUser.id]);
      expect(dbResult.rows).toHaveLength(0);
    });
  });
}); 