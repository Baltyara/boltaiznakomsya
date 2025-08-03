const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Sanitization helpers
const sanitizeString = (value) => {
  if (typeof value === 'string') {
    return value.trim().replace(/[<>]/g, ''); // Basic XSS protection
  }
  return value;
};

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .customSanitizer(sanitizeString)
    .withMessage('Введите корректный email'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Пароль должен содержать минимум 6 символов, включая заглавные, строчные буквы и цифры'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .customSanitizer(sanitizeString)
    .withMessage('Имя должно содержать от 2 до 50 символов'),
  body('age')
    .isInt({ min: 18, max: 100 })
    .withMessage('Возраст должен быть от 18 до 100 лет'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Пол должен быть male, female или other'),
  body('lookingFor')
    .isIn(['male', 'female', 'both'])
    .withMessage('Предпочтения должны быть male, female или both'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .customSanitizer(sanitizeString)
    .withMessage('Введите корректный email'),
  body('password')
    .notEmpty()
    .isLength({ min: 1, max: 128 })
    .withMessage('Пароль обязателен'),
  handleValidationErrors
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .customSanitizer(sanitizeString)
    .withMessage('Имя должно содержать от 2 до 50 символов'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .customSanitizer(sanitizeString)
    .withMessage('Введите корректный email'),
  body('age')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Возраст должен быть от 18 до 100 лет'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Пол должен быть male, female или other'),
  body('interests')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Выберите от 1 до 10 интересов'),
  body('interests.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .customSanitizer(sanitizeString)
    .withMessage('Интерес должен быть строкой от 1 до 50 символов'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .customSanitizer(sanitizeString)
    .withMessage('Город должен содержать от 2 до 100 символов'),
  body('aboutMe')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .customSanitizer(sanitizeString)
    .withMessage('Описание не должно превышать 500 символов'),
  body('photos')
    .optional()
    .isArray({ max: 6 })
    .withMessage('Максимум 6 фотографий'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Фотография должна быть валидным URL'),
  handleValidationErrors
];

const callRatingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Оценка должна быть от 1 до 5'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .customSanitizer(sanitizeString)
    .withMessage('Комментарий не должен превышать 200 символов'),
  body('action')
    .isIn(['like', 'pass'])
    .withMessage('Действие должно быть like или pass'),
  handleValidationErrors
];

const matchmakingValidation = [
  body('lookingFor')
    .isIn(['male', 'female', 'both'])
    .withMessage('Предпочтения должны быть male, female или both'),
  body('ageRange')
    .optional()
    .isObject()
    .withMessage('Диапазон возраста должен быть объектом'),
  body('ageRange.min')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Минимальный возраст должен быть от 18 до 100'),
  body('ageRange.max')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Максимальный возраст должен быть от 18 до 100'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .customSanitizer(sanitizeString)
    .withMessage('Город должен содержать от 2 до 100 символов'),
  handleValidationErrors
];

// New validations for missing endpoints
const callIdValidation = [
  param('callId')
    .isUUID()
    .withMessage('ID звонка должен быть валидным UUID'),
  handleValidationErrors
];

const userIdValidation = [
  param('userId')
    .isUUID()
    .withMessage('ID пользователя должен быть валидным UUID'),
  handleValidationErrors
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Номер страницы должен быть положительным числом'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),
  handleValidationErrors
];

const preferencesValidation = [
  body('notifications')
    .optional()
    .isObject()
    .withMessage('Настройки уведомлений должны быть объектом'),
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email уведомления должны быть boolean'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push уведомления должны быть boolean'),
  body('privacy')
    .optional()
    .isObject()
    .withMessage('Настройки приватности должны быть объектом'),
  body('privacy.profileVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Видимость профиля должна быть public, friends или private'),
  handleValidationErrors
];

const reportUserValidation = [
  body('reason')
    .isIn(['spam', 'inappropriate', 'fake', 'harassment', 'other'])
    .withMessage('Причина жалобы должна быть одной из: spam, inappropriate, fake, harassment, other'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .customSanitizer(sanitizeString)
    .withMessage('Описание не должно превышать 500 символов'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  callRatingValidation,
  matchmakingValidation,
  callIdValidation,
  userIdValidation,
  paginationValidation,
  preferencesValidation,
  reportUserValidation,
  handleValidationErrors
}; 