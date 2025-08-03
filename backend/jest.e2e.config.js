module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.e2e.test.js'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/e2e/setup.js'],
  testTimeout: 30000, // Увеличиваем timeout для E2E тестов
  verbose: true,
  collectCoverage: false, // Отключаем покрытие для E2E тестов
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/coverage/',
    '/logs/',
    '/dist/',
    '/build/'
  ],
  // Настройки для параллельного запуска тестов
  maxWorkers: 1, // E2E тесты должны запускаться последовательно
  // Настройки для логирования
  silent: false,
  // Настройки для обработки ошибок
  errorOnDeprecated: true,
  // Настройки для очистки
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Настройки для окружения
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  }
}; 