const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Создаем папку для логов если её нет
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Форматы для логов
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Транспорты для разных уровней логирования
const transports = [
  // Консольный вывод для разработки
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // Файл для всех логов
  new DailyRotateFile({
    filename: path.join(logsDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info'
  }),
  
  // Файл для ошибок
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error'
  }),
  
  // Файл для отладочной информации
  new DailyRotateFile({
    filename: path.join(logsDir, 'debug-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7d',
    level: 'debug'
  })
];

// Создаем логгер
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Middleware для логирования HTTP запросов
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Логируем входящий запрос
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });
  
  // Перехватываем ответ
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Логируем исходящий ответ
    logger.info('Outgoing response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous'
    });
    
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware для логирования ошибок
const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  });
  
  next(err);
};

// Функция для генерации request ID
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Middleware для добавления request ID
const requestIdMiddleware = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || generateRequestId();
  res.setHeader('x-request-id', req.requestId);
  next();
};

// Обновляем логгер для включения request ID
const createRequestLogger = (req) => {
  return {
    info: (message, meta = {}) => {
      logger.info(message, { ...meta, requestId: req.requestId });
    },
    error: (message, meta = {}) => {
      logger.error(message, { ...meta, requestId: req.requestId });
    },
    warn: (message, meta = {}) => {
      logger.warn(message, { ...meta, requestId: req.requestId });
    },
    debug: (message, meta = {}) => {
      logger.debug(message, { ...meta, requestId: req.requestId });
    }
  };
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  requestIdMiddleware,
  createRequestLogger
}; 