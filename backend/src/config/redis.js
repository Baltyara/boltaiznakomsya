const redis = require('redis');

// Временно отключаем Redis для разработки
const mockClient = {
  connect: async () => console.log('✅ Mock Redis connected'),
  hSet: async () => console.log('✅ Mock Redis hSet'),
  hDel: async () => console.log('✅ Mock Redis hDel'),
  hGetAll: async () => ({}),
  hGet: async () => null,
  hLen: async () => 0,
  on: () => {},
  quit: async () => console.log('✅ Mock Redis quit')
};

// Используем mock клиент для разработки
const client = process.env.NODE_ENV === 'production' ? redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000,
    lazyConnect: true,
  }
}) : mockClient;

if (process.env.NODE_ENV === 'production') {
  client.on('connect', () => {
    console.log('✅ Connected to Redis');
  });

  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
  });

  client.on('ready', () => {
    console.log('✅ Redis client ready');
  });

  // Connect to Redis
  (async () => {
    try {
      await client.connect();
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
    }
  })();
} else {
  console.log('✅ Using mock Redis for development');
}

module.exports = client; 