const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Болтай и Знакомься API',
      version: '1.0.0',
      description: 'API для приложения знакомств с видеозвонками',
      contact: {
        name: 'API Support',
        email: 'support@boltaiznakomsya.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.boltaiznakomsya.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор пользователя'
            },
            name: {
              type: 'string',
              description: 'Имя пользователя',
              minLength: 2,
              maxLength: 50
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя'
            },
            age: {
              type: 'integer',
              minimum: 18,
              maximum: 100,
              description: 'Возраст пользователя'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'Пол пользователя'
            },
            interests: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Интересы пользователя'
            },
            location: {
              type: 'string',
              description: 'Город пользователя'
            },
            aboutMe: {
              type: 'string',
              description: 'Описание пользователя'
            },
            lookingFor: {
              type: 'string',
              enum: ['male', 'female', 'both'],
              description: 'Кого ищет пользователь'
            },
            isOnline: {
              type: 'boolean',
              description: 'Статус онлайн'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата регистрации'
            }
          }
        },
        Call: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор звонка'
            },
            userId1: {
              type: 'integer',
              description: 'ID первого участника'
            },
            userId2: {
              type: 'integer',
              description: 'ID второго участника'
            },
            duration: {
              type: 'integer',
              description: 'Длительность звонка в секундах'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Оценка звонка'
            },
            feedback: {
              type: 'string',
              description: 'Отзыв о звонке'
            },
            action: {
              type: 'string',
              enum: ['like', 'pass'],
              description: 'Действие после звонка'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания звонка'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Сообщение об ошибке'
            },
            message: {
              type: 'string',
              description: 'Детальное описание ошибки'
            },
            requestId: {
              type: 'string',
              description: 'ID запроса для отслеживания'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 