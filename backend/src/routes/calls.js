const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  callRatingValidation, 
  callIdValidation, 
  paginationValidation 
} = require('../middleware/validation');
const {
  createCall,
  getUserCalls,
  getCallStats,
  updateCallRating,
  getRecentMatches,
  getLikedUsers,
  getCallById
} = require('../controllers/callController');

/**
 * @swagger
 * /api/calls:
 *   post:
 *     summary: Создать новый звонок
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Звонок создан
 *       401:
 *         description: Не авторизован
 */
router.post('/', createCall);

/**
 * @swagger
 * /api/calls:
 *   get:
 *     summary: Получить список звонков пользователя
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Количество записей на странице
 *     responses:
 *       200:
 *         description: Список звонков
 *       401:
 *         description: Не авторизован
 */
router.get('/', paginationValidation, getUserCalls);

/**
 * @swagger
 * /api/calls/stats:
 *   get:
 *     summary: Получить статистику звонков
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика звонков
 *       401:
 *         description: Не авторизован
 */
router.get('/stats', getCallStats);

/**
 * @swagger
 * /api/calls/recent-matches:
 *   get:
 *     summary: Получить недавние совпадения
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Количество записей на странице
 *     responses:
 *       200:
 *         description: Недавние совпадения
 *       401:
 *         description: Не авторизован
 */
router.get('/recent-matches', paginationValidation, getRecentMatches);

/**
 * @swagger
 * /api/calls/liked-users:
 *   get:
 *     summary: Получить понравившихся пользователей
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Количество записей на странице
 *     responses:
 *       200:
 *         description: Понравившиеся пользователи
 *       401:
 *         description: Не авторизован
 */
router.get('/liked-users', paginationValidation, getLikedUsers);

/**
 * @swagger
 * /api/calls/{callId}:
 *   get:
 *     summary: Получить информацию о звонке
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID звонка
 *     responses:
 *       200:
 *         description: Информация о звонке
 *       400:
 *         description: Неверный ID звонка
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Звонок не найден
 */
router.get('/:callId', callIdValidation, getCallById);

/**
 * @swagger
 * /api/calls/{callId}/rating:
 *   put:
 *     summary: Оценить звонок
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID звонка
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - action
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Оценка звонка
 *               feedback:
 *                 type: string
 *                 maxLength: 200
 *                 description: Комментарий к звонку
 *               action:
 *                 type: string
 *                 enum: [like, pass]
 *                 description: Действие после звонка
 *     responses:
 *       200:
 *         description: Оценка сохранена
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Звонок не найден
 */
router.put('/:callId/rating', callIdValidation, callRatingValidation, updateCallRating);

module.exports = router; 