const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { 
  logger, 
  requestLogger, 
  errorLogger, 
  requestIdMiddleware 
} = require('./utils/logger');
const { metricsMiddleware, updatePerformanceMetrics } = require('./utils/metrics');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const callRoutes = require('./routes/calls');
const matchmakingRoutes = require('./routes/matchmaking');
const metricsRoutes = require('./routes/metrics');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3001"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(compression());

// Логирование и метрики
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use(metricsMiddleware);

// Morgan для дополнительного логирования HTTP запросов
app.use(morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Болтай и Знакомься API Documentation'
}));

// Health check
app.get('/health', (req, res) => {
  logger.info('Health check requested', { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.use('/metrics', metricsRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('User connected', { 
    socketId: socket.id, 
    ip: socket.handshake.address 
  });

  // Join matchmaking queue
  socket.on('join-queue', (userData) => {
    logger.info('User joined queue', { 
      socketId: socket.id, 
      userId: userData.userId 
    });
    // TODO: Implement matchmaking logic
    socket.join('matchmaking');
  });

  // Leave queue
  socket.on('leave-queue', () => {
    logger.info('User left queue', { socketId: socket.id });
    socket.leave('matchmaking');
  });

  // Handle call signaling
  socket.on('call-signal', (data) => {
    logger.debug('Call signal received', { 
      socketId: socket.id, 
      targetId: data.targetId,
      signalType: data.type 
    });
    // TODO: Implement WebRTC signaling
    socket.to(data.targetId).emit('call-signal', {
      ...data,
      fromId: socket.id
    });
  });

  // Handle call end
  socket.on('end-call', (data) => {
    logger.info('Call ended', { 
      socketId: socket.id, 
      callId: data.callId,
      duration: data.duration 
    });
    // TODO: Implement call cleanup
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected', { socketId: socket.id });
    // TODO: Clean up user from queues
  });
});

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error('Unhandled error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id || 'anonymous'
  });
  
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    requestId: req.requestId
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', { 
    path: req.originalUrl, 
    method: req.method,
    ip: req.ip 
  });
  
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    requestId: req.requestId
  });
});

// Запускаем сервер только если файл запущен напрямую (не импортирован)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;

  server.listen(PORT, () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });
    
    // Запускаем обновление метрик производительности каждые 30 секунд
    setInterval(updatePerformanceMetrics, 30000);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

module.exports = { app, server, io }; 