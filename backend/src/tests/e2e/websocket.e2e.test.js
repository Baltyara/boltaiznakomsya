const io = require('socket.io-client');
const request = require('supertest');
const app = require('../../server');
const { testDbPool } = require('./setup');

describe('WebSocket E2E Tests', () => {
  let user1, user2;
  let user1Token, user2Token;
  let socket1, socket2;
  let server;

  beforeAll(async () => {
    // Получаем тестовых пользователей
    const result1 = await testDbPool.query('SELECT * FROM users WHERE email = $1', ['test1@example.com']);
    const result2 = await testDbPool.query('SELECT * FROM users WHERE email = $1', ['test2@example.com']);
    user1 = result1.rows[0];
    user2 = result2.rows[0];

    // Запускаем сервер для тестов
    server = app.listen(3002);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
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

  afterEach(async () => {
    // Отключаем сокеты после каждого теста
    if (socket1) {
      socket1.disconnect();
    }
    if (socket2) {
      socket2.disconnect();
    }
  });

  describe('Socket Connection', () => {
    it('should connect with valid token', (done) => {
      socket1 = io('http://localhost:3002', {
        auth: {
          token: user1Token
        }
      });

      socket1.on('connect', () => {
        expect(socket1.connected).toBe(true);
        done();
      });

      socket1.on('connect_error', (error) => {
        done.fail(`Connection failed: ${error.message}`);
      });
    });

    it('should reject connection with invalid token', (done) => {
      socket1 = io('http://localhost:3002', {
        auth: {
          token: 'invalid-token'
        }
      });

      socket1.on('connect_error', (error) => {
        expect(error.message).toContain('unauthorized');
        done();
      });

      socket1.on('connect', () => {
        done.fail('Should not connect with invalid token');
      });
    });

    it('should reject connection without token', (done) => {
      socket1 = io('http://localhost:3002');

      socket1.on('connect_error', (error) => {
        expect(error.message).toContain('unauthorized');
        done();
      });

      socket1.on('connect', () => {
        done.fail('Should not connect without token');
      });
    });
  });

  describe('User Online Status', () => {
    it('should mark user as online when connecting', (done) => {
      socket1 = io('http://localhost:3002', {
        auth: {
          token: user1Token
        }
      });

      socket1.on('connect', async () => {
        // Проверяем, что пользователь отмечен как онлайн в БД
        const dbResult = await testDbPool.query(
          'SELECT is_online FROM users WHERE id = $1',
          [user1.id]
        );
        expect(dbResult.rows[0].is_online).toBe(true);
        done();
      });
    });

    it('should mark user as offline when disconnecting', (done) => {
      socket1 = io('http://localhost:3002', {
        auth: {
          token: user1Token
        }
      });

      socket1.on('connect', () => {
        socket1.disconnect();
      });

      socket1.on('disconnect', async () => {
        // Проверяем, что пользователь отмечен как оффлайн в БД
        const dbResult = await testDbPool.query(
          'SELECT is_online FROM users WHERE id = $1',
          [user1.id]
        );
        expect(dbResult.rows[0].is_online).toBe(false);
        done();
      });
    });
  });

  describe('Call Signaling', () => {
    beforeEach(async () => {
      // Подключаем двух пользователей
      socket1 = io('http://localhost:3002', {
        auth: { token: user1Token }
      });
      socket2 = io('http://localhost:3002', {
        auth: { token: user2Token }
      });

      // Ждем подключения обоих
      await new Promise((resolve) => {
        let connected = 0;
        const checkConnection = () => {
          connected++;
          if (connected === 2) resolve();
        };
        socket1.on('connect', checkConnection);
        socket2.on('connect', checkConnection);
      });
    });

    it('should handle call offer', (done) => {
      const offerData = {
        targetUserId: user2.id,
        offer: {
          type: 'offer',
          sdp: 'test-sdp-offer'
        }
      };

      // Отправляем offer
      socket1.emit('call:offer', offerData);

      // Проверяем, что второй пользователь получил offer
      socket2.on('call:offer', (data) => {
        expect(data.offererId).toBe(user1.id);
        expect(data.offer).toEqual(offerData.offer);
        done();
      });
    });

    it('should handle call answer', (done) => {
      const answerData = {
        targetUserId: user1.id,
        answer: {
          type: 'answer',
          sdp: 'test-sdp-answer'
        }
      };

      // Отправляем answer
      socket2.emit('call:answer', answerData);

      // Проверяем, что первый пользователь получил answer
      socket1.on('call:answer', (data) => {
        expect(data.answererId).toBe(user2.id);
        expect(data.answer).toEqual(answerData.answer);
        done();
      });
    });

    it('should handle ICE candidates', (done) => {
      const candidateData = {
        targetUserId: user2.id,
        candidate: {
          candidate: 'test-candidate',
          sdpMLineIndex: 0,
          sdpMid: 'audio'
        }
      };

      // Отправляем ICE candidate
      socket1.emit('call:ice-candidate', candidateData);

      // Проверяем, что второй пользователь получил candidate
      socket2.on('call:ice-candidate', (data) => {
        expect(data.fromUserId).toBe(user1.id);
        expect(data.candidate).toEqual(candidateData.candidate);
        done();
      });
    });

    it('should handle call end', (done) => {
      const endData = {
        targetUserId: user2.id,
        reason: 'user-ended'
      };

      // Отправляем сигнал завершения звонка
      socket1.emit('call:end', endData);

      // Проверяем, что второй пользователь получил сигнал завершения
      socket2.on('call:end', (data) => {
        expect(data.fromUserId).toBe(user1.id);
        expect(data.reason).toBe(endData.reason);
        done();
      });
    });
  });

  describe('Chat Messages', () => {
    beforeEach(async () => {
      // Подключаем двух пользователей
      socket1 = io('http://localhost:3002', {
        auth: { token: user1Token }
      });
      socket2 = io('http://localhost:3002', {
        auth: { token: user2Token }
      });

      // Ждем подключения обоих
      await new Promise((resolve) => {
        let connected = 0;
        const checkConnection = () => {
          connected++;
          if (connected === 2) resolve();
        };
        socket1.on('connect', checkConnection);
        socket2.on('connect', checkConnection);
      });
    });

    it('should send and receive chat message', (done) => {
      const messageData = {
        targetUserId: user2.id,
        message: 'Hello, how are you?',
        timestamp: new Date().toISOString()
      };

      // Отправляем сообщение
      socket1.emit('chat:message', messageData);

      // Проверяем, что второй пользователь получил сообщение
      socket2.on('chat:message', (data) => {
        expect(data.fromUserId).toBe(user1.id);
        expect(data.message).toBe(messageData.message);
        expect(data.timestamp).toBe(messageData.timestamp);
        done();
      });
    });

    it('should handle typing indicator', (done) => {
      const typingData = {
        targetUserId: user2.id,
        isTyping: true
      };

      // Отправляем индикатор печати
      socket1.emit('chat:typing', typingData);

      // Проверяем, что второй пользователь получил индикатор
      socket2.on('chat:typing', (data) => {
        expect(data.fromUserId).toBe(user1.id);
        expect(data.isTyping).toBe(true);
        done();
      });
    });

    it('should handle message read receipt', (done) => {
      const readData = {
        targetUserId: user2.id,
        messageId: 'test-message-id',
        timestamp: new Date().toISOString()
      };

      // Отправляем подтверждение прочтения
      socket1.emit('chat:read', readData);

      // Проверяем, что второй пользователь получил подтверждение
      socket2.on('chat:read', (data) => {
        expect(data.fromUserId).toBe(user1.id);
        expect(data.messageId).toBe(readData.messageId);
        expect(data.timestamp).toBe(readData.timestamp);
        done();
      });
    });
  });

  describe('User Presence', () => {
    beforeEach(async () => {
      // Подключаем двух пользователей
      socket1 = io('http://localhost:3002', {
        auth: { token: user1Token }
      });
      socket2 = io('http://localhost:3002', {
        auth: { token: user2Token }
      });

      // Ждем подключения обоих
      await new Promise((resolve) => {
        let connected = 0;
        const checkConnection = () => {
          connected++;
          if (connected === 2) resolve();
        };
        socket1.on('connect', checkConnection);
        socket2.on('connect', checkConnection);
      });
    });

    it('should notify when user comes online', (done) => {
      // Отключаем второго пользователя
      socket2.disconnect();

      // Подключаем заново
      setTimeout(() => {
        socket2 = io('http://localhost:3002', {
          auth: { token: user2Token }
        });

        socket2.on('connect', () => {
          // Проверяем, что первый пользователь получил уведомление
          socket1.on('user:online', (data) => {
            expect(data.userId).toBe(user2.id);
            done();
          });
        });
      }, 100);
    });

    it('should notify when user goes offline', (done) => {
      // Отключаем второго пользователя
      socket2.disconnect();

      // Проверяем, что первый пользователь получил уведомление
      socket1.on('user:offline', (data) => {
        expect(data.userId).toBe(user2.id);
        done();
      });
    });

    it('should handle user status change', (done) => {
      const statusData = {
        status: 'busy',
        message: 'In a call'
      };

      // Отправляем изменение статуса
      socket1.emit('user:status', statusData);

      // Проверяем, что второй пользователь получил уведомление
      socket2.on('user:status', (data) => {
        expect(data.userId).toBe(user1.id);
        expect(data.status).toBe(statusData.status);
        expect(data.message).toBe(statusData.message);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid event data', (done) => {
      socket1 = io('http://localhost:3002', {
        auth: { token: user1Token }
      });

      socket1.on('connect', () => {
        // Отправляем неверные данные
        socket1.emit('call:offer', { invalid: 'data' });

        // Проверяем, что получили ошибку
        socket1.on('error', (error) => {
          expect(error).toHaveProperty('message');
          expect(error.message).toContain('invalid');
          done();
        });
      });
    });

    it('should handle non-existent target user', (done) => {
      socket1 = io('http://localhost:3002', {
        auth: { token: user1Token }
      });

      socket1.on('connect', () => {
        const offerData = {
          targetUserId: 99999, // Несуществующий пользователь
          offer: { type: 'offer', sdp: 'test' }
        };

        socket1.emit('call:offer', offerData);

        socket1.on('error', (error) => {
          expect(error.message).toContain('не найден');
          done();
        });
      });
    });
  });
}); 