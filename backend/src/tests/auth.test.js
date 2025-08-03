const request = require('supertest');
const jwt = require('jsonwebtoken');

// Мокируем модули
vi.mock('../models/User');
vi.mock('../config/database');

const User = require('../models/User');

describe('Auth API', () => {
  let testUser;
  let mockToken;

  beforeAll(() => {
    // Создаем тестового пользователя
    testUser = {
      id: 1,
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      age: 25,
      gender: 'other',
      location: 'Moscow',
      interests: ['music', 'sports']
    };

    mockToken = jwt.sign({ userId: testUser.id }, 'test-secret');
  });

  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        age: 25,
        gender: 'other',
        location: 'Moscow',
        interests: ['music', 'sports']
      };

      // Мокируем успешное создание пользователя
      User.create.mockResolvedValue({
        id: 2,
        email: userData.email,
        name: userData.name,
        age: userData.age,
        gender: userData.gender,
        location: userData.location,
        interests: userData.interests
      });

      const response = await request('http://localhost:3001')
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(User.create).toHaveBeenCalledWith(userData);
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Duplicate User'
      };

      // Мокируем ошибку дублирования
      User.create.mockRejectedValue(new Error('User with this email already exists'));

      const response = await request('http://localhost:3001')
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request('http://localhost:3001')
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'password123'
      };

      // Мокируем поиск пользователя и проверку пароля
      User.findByEmail.mockResolvedValue({
        ...testUser,
        password_hash: '$2a$10$hashedpassword'
      });
      User.verifyPassword.mockResolvedValue(true);

      const response = await request('http://localhost:3001')
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email);
      expect(User.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(User.verifyPassword).toHaveBeenCalledWith(loginData.password, '$2a$10$hashedpassword');
    });

    it('should return error for incorrect password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      // Мокируем поиск пользователя и неправильный пароль
      User.findByEmail.mockResolvedValue({
        ...testUser,
        password_hash: '$2a$10$hashedpassword'
      });
      User.verifyPassword.mockResolvedValue(false);

      const response = await request('http://localhost:3001')
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Мокируем отсутствие пользователя
      User.findByEmail.mockResolvedValue(null);

      const response = await request('http://localhost:3001')
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      // Мокируем поиск пользователя по ID
      User.findById.mockResolvedValue({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        age: testUser.age,
        gender: testUser.gender,
        location: testUser.location,
        interests: testUser.interests
      });

      const response = await request('http://localhost:3001')
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
      expect(User.findById).toHaveBeenCalledWith(testUser.id);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request('http://localhost:3001')
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for missing token', async () => {
      const response = await request('http://localhost:3001')
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 