const request = require('supertest');
const app = require('../../server');
const { testDbPool } = require('./setup');

describe('Calls E2E Tests', () => {
  let user1, user2;
  let user1Token, user2Token;
  let testCall;

  beforeAll(async () => {
    // Получаем тестовых пользователей
    const result1 = await testDbPool.query('SELECT * FROM users WHERE email = $1', ['test1@example.com']);
    const result2 = await testDbPool.query('SELECT * FROM users WHERE email = $1', ['test2@example.com']);
    user1 = result1.rows[0];
    user2 = result2.rows[0];
  });

  beforeEach(async () => {
    // Логинимся для получения токенов
    const login1Response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test1@example.com',
        password: 'password123'
      });
    user1Token = login1Response.body.token;

    const login2Response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test2@example.com',
        password: 'password123'
      });
    user2Token = login2Response.body.token;
  });

  describe('POST /api/calls', () => {
    it('should create a new call successfully', async () => {
      const callData = {
        user2_id: user2.id,
        call_type: 'video',
        duration: 0
      };

      const response = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(callData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('user1_id');
      expect(response.body).toHaveProperty('user2_id');
      expect(response.body).toHaveProperty('call_type');
      expect(response.body).toHaveProperty('status');
      expect(response.body.user1_id).toBe(user1.id);
      expect(response.body.user2_id).toBe(user2.id);
      expect(response.body.call_type).toBe(callData.call_type);
      expect(response.body.status).toBe('initiated');

      testCall = response.body;

      // Проверяем, что звонок создан в БД
      const dbResult = await testDbPool.query('SELECT * FROM calls WHERE id = $1', [testCall.id]);
      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].user1_id).toBe(user1.id);
      expect(dbResult.rows[0].user2_id).toBe(user2.id);
    });

    it('should return error for invalid user2_id', async () => {
      const callData = {
        user2_id: 99999, // Несуществующий пользователь
        call_type: 'video'
      };

      const response = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(callData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('не найден');
    });

    it('should return error for calling yourself', async () => {
      const callData = {
        user2_id: user1.id, // Пользователь звонит сам себе
        call_type: 'video'
      };

      const response = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(callData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('самого себя');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate call_type', async () => {
      const callData = {
        user2_id: user2.id,
        call_type: 'invalid_type' // Неверный тип
      };

      const response = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(callData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/calls', () => {
    beforeEach(async () => {
      // Создаем тестовый звонок
      const callData = {
        user2_id: user2.id,
        call_type: 'video'
      };
      const createResponse = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(callData);
      testCall = createResponse.body;
    });

    it('should get user calls with pagination', async () => {
      const response = await request(app)
        .get('/api/calls?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('calls');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.calls)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should return calls for authenticated user only', async () => {
      const response = await request(app)
        .get('/api/calls')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Проверяем, что возвращаются только звонки текущего пользователя
      const userCalls = response.body.calls.filter(call => 
        call.user1_id === user1.id || call.user2_id === user1.id
      );
      expect(userCalls.length).toBe(response.body.calls.length);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/calls')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/calls/:callId', () => {
    beforeEach(async () => {
      // Создаем тестовый звонок
      const callData = {
        user2_id: user2.id,
        call_type: 'video'
      };
      const createResponse = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(callData);
      testCall = createResponse.body;
    });

    it('should get specific call by ID', async () => {
      const response = await request(app)
        .get(`/api/calls/${testCall.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('user1_id');
      expect(response.body).toHaveProperty('user2_id');
      expect(response.body).toHaveProperty('call_type');
      expect(response.body).toHaveProperty('status');
      expect(response.body.id).toBe(testCall.id);
    });

    it('should return error for non-existent call', async () => {
      const response = await request(app)
        .get('/api/calls/99999')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('не найден');
    });

    it('should return error for unauthorized access', async () => {
      // Создаем третьего пользователя
      const user3Data = {
        email: 'test3@example.com',
        password: 'Password123',
        name: 'Test User 3',
        age: 25,
        gender: 'male',
        lookingFor: 'female'
      };
      await request(app).post('/api/auth/register').send(user3Data);
      
      const login3Response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test3@example.com',
          password: 'Password123'
        });
      const user3Token = login3Response.body.token;

      const response = await request(app)
        .get(`/api/calls/${testCall.id}`)
        .set('Authorization', `Bearer ${user3Token}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('доступ');
    });
  });

  describe('PUT /api/calls/:callId/rating', () => {
    beforeEach(async () => {
      // Создаем завершенный звонок
      const callData = {
        user2_id: user2.id,
        call_type: 'video'
      };
      const createResponse = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(callData);
      testCall = createResponse.body;

      // Завершаем звонок
      await testDbPool.query(
        'UPDATE calls SET status = $1, duration = $2 WHERE id = $3',
        ['completed', 300, testCall.id]
      );
    });

    it('should rate a completed call successfully', async () => {
      const ratingData = {
        rating: 5,
        feedback: 'Отличный звонок!'
      };

      const response = await request(app)
        .put(`/api/calls/${testCall.id}/rating`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(ratingData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('оценка');

      // Проверяем, что рейтинг сохранен в БД
      const dbResult = await testDbPool.query(
        'SELECT * FROM calls WHERE id = $1',
        [testCall.id]
      );
      expect(dbResult.rows[0].rating).toBe(ratingData.rating);
      expect(dbResult.rows[0].feedback).toBe(ratingData.feedback);
    });

    it('should validate rating range', async () => {
      const ratingData = {
        rating: 6, // Неверный рейтинг (должен быть 1-5)
        feedback: 'Test feedback'
      };

      const response = await request(app)
        .put(`/api/calls/${testCall.id}/rating`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(ratingData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error for non-completed call', async () => {
      // Создаем незавершенный звонок
      const callData = {
        user2_id: user2.id,
        call_type: 'video'
      };
      const createResponse = await request(app)
        .post('/api/calls')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(callData);
      const activeCall = createResponse.body;

      const ratingData = {
        rating: 5,
        feedback: 'Test feedback'
      };

      const response = await request(app)
        .put(`/api/calls/${activeCall.id}/rating`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(ratingData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('завершен');
    });
  });

  describe('GET /api/calls/stats', () => {
    beforeEach(async () => {
      // Создаем несколько звонков для статистики
      const callData = {
        user2_id: user2.id,
        call_type: 'video'
      };
      
      // Создаем и завершаем несколько звонков
      for (let i = 0; i < 3; i++) {
        const createResponse = await request(app)
          .post('/api/calls')
          .set('Authorization', `Bearer ${user1Token}`)
          .send(callData);
        
        const callId = createResponse.body.id;
        await testDbPool.query(
          'UPDATE calls SET status = $1, duration = $2, rating = $3 WHERE id = $4',
          ['completed', 300 + i * 60, 4 + i, callId]
        );
      }
    });

    it('should get user call statistics', async () => {
      const response = await request(app)
        .get('/api/calls/stats')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('total_calls');
      expect(response.body).toHaveProperty('completed_calls');
      expect(response.body).toHaveProperty('total_duration');
      expect(response.body).toHaveProperty('average_rating');
      expect(response.body).toHaveProperty('call_types');

      expect(typeof response.body.total_calls).toBe('number');
      expect(typeof response.body.completed_calls).toBe('number');
      expect(typeof response.body.total_duration).toBe('number');
      expect(typeof response.body.average_rating).toBe('number');
      expect(Array.isArray(response.body.call_types)).toBe(true);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/calls/stats')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/calls/recent-matches', () => {
    beforeEach(async () => {
      // Создаем несколько завершенных звонков
      const callData = {
        user2_id: user2.id,
        call_type: 'video'
      };
      
      for (let i = 0; i < 2; i++) {
        const createResponse = await request(app)
          .post('/api/calls')
          .set('Authorization', `Bearer ${user1Token}`)
          .send(callData);
        
        const callId = createResponse.body.id;
        await testDbPool.query(
          'UPDATE calls SET status = $1, duration = $2 WHERE id = $3',
          ['completed', 300, callId]
        );
      }
    });

    it('should get recent matches with pagination', async () => {
      const response = await request(app)
        .get('/api/calls/recent-matches?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('matches');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.matches)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should return only completed calls as matches', async () => {
      const response = await request(app)
        .get('/api/calls/recent-matches')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Проверяем, что все возвращенные звонки завершены
      const allCompleted = response.body.matches.every(match => match.status === 'completed');
      expect(allCompleted).toBe(true);
    });
  });
}); 