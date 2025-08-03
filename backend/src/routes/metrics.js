const express = require('express');
const { getMetrics } = require('../utils/metrics');

const router = express.Router();

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Получить метрики Prometheus
 *     description: Экспортирует метрики в формате Prometheus для мониторинга
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Метрики в формате Prometheus
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 # HELP http_requests_total Total number of HTTP requests
 *                 # TYPE http_requests_total counter
 *                 http_requests_total{method="GET",route="/api/auth/profile",status_code="200"} 42
 *       500:
 *         description: Ошибка при получении метрик
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const metrics = await getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Ошибка при получении метрик',
      message: error.message
    });
  }
});

module.exports = router; 