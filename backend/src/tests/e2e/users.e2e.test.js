const request = require('supertest');
const app = require('../../server');
const { testDbPool } = require('./setup');

describe('Users E2E Tests', () => {
  let user1, user2, user3;
  let user1Token, user2Token, user3Token;

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

  describe('GET /api/users/online', () => {
    beforeEach(async () => {
      // Убеждаемся, что пользователи онлайн
      await testDbPool.query(
        'UPDATE users SET is_online = true WHERE id IN ($1, $2)',
        [user1.id, user2.id]
      );
    });

    it('should get online users with pagination', async () => {
      const response = await request(app)
        .get('/api/users/online?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');

      // Проверяем, что все возвращенные пользователи онлайн
      const allOnline = response.body.users.every(user => user.is_online === true);
      expect(allOnline).toBe(true);
    });

    it('should not include current user in results', async () => {
      const response = await request(app)
        .get('/api/users/online')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Проверяем, что текущий пользователь не включен в результаты
      const currentUserInResults = response.body.users.some(user => user.id === user1.id);
      expect(currentUserInResults).toBe(false);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/users/online')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/:userId', () => {
    it('should get user profile by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${user2.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('age');
      expect(response.body).toHaveProperty('gender');
      expect(response.body).toHaveProperty('location');
      expect(response.body).toHaveProperty('interests');
      expect(response.body).toHaveProperty('about_me');
      expect(response.body.id).toBe(user2.id);
      expect(response.body.name).toBe('Test User 2');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('не найден');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get(`/api/users/${user2.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/users/:userId/report', () => {
    it('should report a user successfully', async () => {
      const reportData = {
        reason: 'spam',
        description: 'This user is sending spam messages'
      };

      const response = await request(app)
        .post(`/api/users/${user2.id}/report`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(reportData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('report');
      expect(response.body.message).toContain('успешно отправлена');
      expect(response.body.report).toHaveProperty('id');
      expect(response.body.report).toHaveProperty('reason');
      expect(response.body.report.reason).toBe(reportData.reason);

      // Проверяем, что жалоба сохранена в БД
      const dbResult = await testDbPool.query(
        'SELECT * FROM user_reports WHERE reporter_id = $1 AND reported_user_id = $2',
        [user1.id, user2.id]
      );
      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].reason).toBe(reportData.reason);
      expect(dbResult.rows[0].description).toBe(reportData.description);
    });

    it('should return error when reporting yourself', async () => {
      const reportData = {
        reason: 'spam',
        description: 'Test report'
      };

      const response = await request(app)
        .post(`/api/users/${user1.id}/report`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(reportData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('самого себя');
    });

    it('should return error for non-existent user', async () => {
      const reportData = {
        reason: 'spam',
        description: 'Test report'
      };

      const response = await request(app)
        .post('/api/users/99999/report')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(reportData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('не найден');
    });

    it('should return error for duplicate report', async () => {
      const reportData = {
        reason: 'spam',
        description: 'Test report'
      };

      // Первая жалоба
      await request(app)
        .post(`/api/users/${user2.id}/report`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(reportData)
        .expect(201);

      // Повторная жалоба
      const response = await request(app)
        .post(`/api/users/${user2.id}/report`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(reportData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('уже жаловались');
    });

    it('should validate report reason', async () => {
      const reportData = {
        reason: 'invalid_reason',
        description: 'Test report'
      };

      const response = await request(app)
        .post(`/api/users/${user2.id}/report`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send(reportData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error without authentication', async () => {
      const reportData = {
        reason: 'spam',
        description: 'Test report'
      };

      const response = await request(app)
        .post(`/api/users/${user2.id}/report`)
        .send(reportData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/users/preferences', () => {
    it('should update user preferences successfully', async () => {
      const preferencesData = {
        lookingFor: 'both',
        notificationSettings: {
          newMatches: true,
          messages: true,
          calls: false
        }
      };

      const response = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(preferencesData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('обновлены');

      // Проверяем, что настройки обновились в БД
      const dbResult = await testDbPool.query('SELECT * FROM users WHERE id = $1', [user1.id]);
      expect(dbResult.rows[0].looking_for).toBe(preferencesData.lookingFor);
      expect(dbResult.rows[0].notification_settings).toEqual(preferencesData.notificationSettings);
    });

    it('should validate lookingFor value', async () => {
      const preferencesData = {
        lookingFor: 'invalid_value',
        notificationSettings: {
          newMatches: true
        }
      };

      const response = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(preferencesData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return error without authentication', async () => {
      const preferencesData = {
        lookingFor: 'both'
      };

      const response = await request(app)
        .put('/api/users/preferences')
        .send(preferencesData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/search', () => {
    beforeEach(async () => {
      // Создаем дополнительных пользователей для поиска
      const additionalUsers = [
        {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2',
          age: 24,
          gender: 'female',
          interests: ['music', 'dancing'],
          location: 'Moscow',
          about_me: 'Love dancing and music',
          is_online: true
        },
        {
          name: 'Bob Smith',
          email: 'bob@example.com',
          password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2',
          age: 28,
          gender: 'male',
          interests: ['sports', 'gym'],
          location: 'St. Petersburg',
          about_me: 'Fitness enthusiast',
          is_online: true
        }
      ];

      for (const user of additionalUsers) {
        await testDbPool.query(`
          INSERT INTO users (name, email, password_hash, age, gender, interests, location, about_me, is_online)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [user.name, user.email, user.password_hash, user.age, user.gender, user.interests, user.location, user.about_me, user.is_online]);
      }
    });

    it('should search users by criteria', async () => {
      const searchParams = {
        gender: 'female',
        ageMin: 20,
        ageMax: 30,
        location: 'Moscow',
        interests: ['music']
      };

      const response = await request(app)
        .get('/api/users/search')
        .query(searchParams)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.users)).toBe(true);

      // Проверяем, что результаты соответствуют критериям поиска
      const allMatchCriteria = response.body.users.every(user => 
        user.gender === searchParams.gender &&
        user.age >= searchParams.ageMin &&
        user.age <= searchParams.ageMax &&
        user.location.toLowerCase().includes(searchParams.location.toLowerCase()) &&
        user.interests.some(interest => searchParams.interests.includes(interest))
      );
      expect(allMatchCriteria).toBe(true);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ gender: 'female' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/matches', () => {
    beforeEach(async () => {
      // Создаем несколько завершенных звонков для матчей
      const callData = {
        user2_id: user2.id,
        call_type: 'video'
      };
      
      for (let i = 0; i < 3; i++) {
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

    it('should get user matches with pagination', async () => {
      const response = await request(app)
        .get('/api/users/matches?page=1&limit=10')
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
        .get('/api/users/matches')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      // Проверяем, что все возвращенные матчи основаны на завершенных звонках
      const allCompleted = response.body.matches.every(match => match.call_status === 'completed');
      expect(allCompleted).toBe(true);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/users/matches')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/users/liked', () => {
    beforeEach(async () => {
      // Создаем несколько лайков
      const likeData = [
        { user_id: user1.id, liked_user_id: user2.id },
        { user_id: user2.id, liked_user_id: user1.id }
      ];

      for (const like of likeData) {
        await testDbPool.query(`
          INSERT INTO user_likes (user_id, liked_user_id)
          VALUES ($1, $2)
        `, [like.user_id, like.liked_user_id]);
      }
    });

    it('should get liked users with pagination', async () => {
      const response = await request(app)
        .get('/api/users/liked?page=1&limit=10')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('liked_users');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.liked_users)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/users/liked')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 