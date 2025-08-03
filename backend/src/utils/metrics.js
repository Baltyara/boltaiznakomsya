const promClient = require('prom-client');

// Создаем реестр метрик
const register = new promClient.Registry();

// Добавляем стандартные метрики
promClient.collectDefaultMetrics({ register });

// Метрики HTTP запросов
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Метрики аутентификации
const authAttemptsTotal = new promClient.Counter({
  name: 'auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['type', 'status'] // type: login/register, status: success/failure
});

const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users'
});

// Метрики звонков
const callsTotal = new promClient.Counter({
  name: 'calls_total',
  help: 'Total number of calls',
  labelNames: ['type', 'status'] // type: video/audio, status: initiated/completed/failed
});

const callDuration = new promClient.Histogram({
  name: 'call_duration_seconds',
  help: 'Duration of calls in seconds',
  labelNames: ['type'],
  buckets: [30, 60, 300, 600, 1800, 3600] // 30s, 1m, 5m, 10m, 30m, 1h
});

const activeCalls = new promClient.Gauge({
  name: 'active_calls_total',
  help: 'Number of currently active calls'
});

// Метрики WebSocket соединений
const websocketConnectionsTotal = new promClient.Counter({
  name: 'websocket_connections_total',
  help: 'Total number of WebSocket connections',
  labelNames: ['status'] // status: connected/disconnected
});

const websocketConnectionsActive = new promClient.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of currently active WebSocket connections'
});

// Метрики базы данных
const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
});

const dbConnectionsActive = new promClient.Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections'
});

// Метрики ошибок
const errorsTotal = new promClient.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity'] // type: validation/auth/db/websocket, severity: low/medium/high
});

// Метрики производительности
const memoryUsage = new promClient.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'] // type: heap/process
});

const cpuUsage = new promClient.Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage percentage'
});

// Метрики пользователей
const userRegistrationsTotal = new promClient.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['status'] // status: success/failure
});

const userReportsTotal = new promClient.Counter({
  name: 'user_reports_total',
  help: 'Total number of user reports',
  labelNames: ['reason'] // reason: spam/inappropriate/fake/harassment/other
});

// Регистрируем все метрики
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestTotal);
register.registerMetric(authAttemptsTotal);
register.registerMetric(activeUsers);
register.registerMetric(callsTotal);
register.registerMetric(callDuration);
register.registerMetric(activeCalls);
register.registerMetric(websocketConnectionsTotal);
register.registerMetric(websocketConnectionsActive);
register.registerMetric(dbQueryDuration);
register.registerMetric(dbConnectionsActive);
register.registerMetric(errorsTotal);
register.registerMetric(memoryUsage);
register.registerMetric(cpuUsage);
register.registerMetric(userRegistrationsTotal);
register.registerMetric(userReportsTotal);

// Middleware для автоматического сбора метрик HTTP запросов
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // в секундах
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

// Функция для обновления метрик производительности
const updatePerformanceMetrics = () => {
  const memUsage = process.memoryUsage();
  
  memoryUsage.labels('heap').set(memUsage.heapUsed);
  memoryUsage.labels('process').set(memUsage.rss);
  
  // CPU usage (упрощенная версия)
  const startUsage = process.cpuUsage();
  setTimeout(() => {
    const endUsage = process.cpuUsage(startUsage);
    const cpuPercent = (endUsage.user + endUsage.system) / 1000000; // в процентах
    cpuUsage.set(cpuPercent);
  }, 100);
};

// Функция для экспорта метрик
const getMetrics = async () => {
  return await register.metrics();
};

// Функция для очистки метрик (для тестов)
const clearMetrics = () => {
  register.clear();
};

module.exports = {
  register,
  metricsMiddleware,
  updatePerformanceMetrics,
  getMetrics,
  clearMetrics,
  
  // Метрики для использования в коде
  httpRequestDurationMicroseconds,
  httpRequestTotal,
  authAttemptsTotal,
  activeUsers,
  callsTotal,
  callDuration,
  activeCalls,
  websocketConnectionsTotal,
  websocketConnectionsActive,
  dbQueryDuration,
  dbConnectionsActive,
  errorsTotal,
  memoryUsage,
  cpuUsage,
  userRegistrationsTotal,
  userReportsTotal
}; 