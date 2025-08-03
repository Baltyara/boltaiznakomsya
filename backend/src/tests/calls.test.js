const request = require('supertest');
const jwt = require('jsonwebtoken');

// Мокируем модули
jest.mock('../models/User');
jest.mock('../models/Call');
jest.mock('../config/database');

const User = require('../models/User');
const Call = require('../models/Call');

describe('Calls API', () => {
  let testUser1, testUser2, testCall;
  let mockToken1, mockToken2;

  beforeAll(() => {
    // Создаем тестовых пользователей
    testUser1 = {
      id: 1,
      email: 'user1@example.com',
      password: 'password123',
      name: 'User 1',
      age: 25,
      gender: 'other',
      location: 'Moscow',
      interests: ['music', 'sports']
    };
    
    testUser2 = {
      id: 2,
      email: 'user2@example.com',
      password: 'password123',
      name: 'User 2',
      age: 28,
      gender: 'other',
      location: 'Moscow',
      interests: ['music', 'travel']
    };

    testCall = {
      id: 1,
      user1_id: testUser1.id,
      user2_id: testUser2.id,
      duration: 300,
      status: 'completed',
      started_at: new Date(),
      ended_at: new Date()
    };

    mockToken1 = jwt.sign({ userId: testUser1.id }, 'test-secret');
    mockToken2 = jwt.sign({ userId: testUser2.id }, 'test-secret');
  });

  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('POST /api/calls', () => {
    it('should create a call successfully', async () => {
      const callData = {
        user2_id: testUser2.id,
        duration: 300
      };

      // Мокируем поиск пользователей и создание звонка
      User.findById.mockResolvedValueOnce(testUser1);
      User.findById.mockResolvedValueOnce(testUser2);
      Call.create.mockResolvedValue({
        ...testCall,
        status: 'active'
      });

      const response = await request('http://localhost:3001')
        .post('/api/calls')
        .set('Authorization', `Bearer ${mockToken1}`)
        .send(callData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.user1_id).toBe(testUser1.id);
      expect(response.body.user2_id).toBe(testUser2.id);
      expect(response.body.status).toBe('active');
      expect(Call.create).toHaveBeenCalledWith({
        user1_id: testUser1.id,
        user2_id: testUser2.id,
        duration: callData.duration
      });
    });

    it('should return error for non-existent users', async () => {
      const callData = {
        user2_id: 99999, // Несуществующий пользователь
        duration: 300
      };

      // Мокируем поиск первого пользователя и отсутствие второго
      User.findById.mockResolvedValueOnce(testUser1);
      User.findById.mockResolvedValueOnce(null);

      const response = await request('http://localhost:3001')
        .post('/api/calls')
        .set('Authorization', `Bearer ${mockToken1}`)
        .send(callData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('User not found');
    });
  });

  describe('GET /api/calls', () => {
    it('should get user calls', async () => {
      // Мокируем поиск пользователя и получение звонков
      User.findById.mockResolvedValue(testUser1);
      Call.findByUserId.mockResolvedValue([testCall]);

      const response = await request('http://localhost:3001')
        .get('/api/calls')
        .set('Authorization', `Bearer ${mockToken1}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('user1_id');
      expect(response.body[0]).toHaveProperty('user2_id');
      expect(Call.findByUserId).toHaveBeenCalledWith(testUser1.id);
    });

    it('should return 401 without token', async () => {
      const response = await request('http://localhost:3001')
        .get('/api/calls')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/calls/stats', () => {
    it('should get call statistics', async () => {
      const mockStats = {
        total_calls: 10,
        total_duration: 3000,
        average_duration: 300,
        completed_calls: 8,
        active_calls: 2
      };

      // Мокируем поиск пользователя и получение статистики
      User.findById.mockResolvedValue(testUser1);
      Call.getStatsByUserId.mockResolvedValue(mockStats);

      const response = await request('http://localhost:3001')
        .get('/api/calls/stats')
        .set('Authorization', `Bearer ${mockToken1}`)
        .expect(200);

      expect(response.body).toHaveProperty('total_calls');
      expect(response.body).toHaveProperty('total_duration');
      expect(response.body).toHaveProperty('average_duration');
      expect(response.body.total_calls).toBeGreaterThan(0);
      expect(Call.getStatsByUserId).toHaveBeenCalledWith(testUser1.id);
    });
  });

  describe('PUT /api/calls/:id/rating', () => {
    it('should update call rating', async () => {
      const ratingData = {
        rating: 5,
        comment: 'Great conversation!'
      };

      const mockRating = {
        id: 1,
        call_id: testCall.id,
        user_id: testUser1.id,
        rating: ratingData.rating,
        comment: ratingData.comment,
        created_at: new Date()
      };

      // Мокируем поиск пользователя, звонка и создание рейтинга
      User.findById.mockResolvedValue(testUser1);
      Call.findById.mockResolvedValue(testCall);
      Call.createRating.mockResolvedValue(mockRating);

      const response = await request('http://localhost:3001')
        .put(`/api/calls/${testCall.id}/rating`)
        .set('Authorization', `Bearer ${mockToken1}`)
        .send(ratingData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.rating).toBe(ratingData.rating);
      expect(response.body.comment).toBe(ratingData.comment);
      expect(Call.createRating).toHaveBeenCalledWith({
        call_id: testCall.id,
        user_id: testUser1.id,
        rating: ratingData.rating,
        comment: ratingData.comment
      });
    });

    it('should return 404 for non-existent call', async () => {
      const ratingData = {
        rating: 5,
        comment: 'Great conversation!'
      };

      // Мокируем поиск пользователя и отсутствие звонка
      User.findById.mockResolvedValue(testUser1);
      Call.findById.mockResolvedValue(null);

      const response = await request('http://localhost:3001')
        .put('/api/calls/99999/rating')
        .set('Authorization', `Bearer ${mockToken1}`)
        .send(ratingData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Call not found');
    });
  });
}); 