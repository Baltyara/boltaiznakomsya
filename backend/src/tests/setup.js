// Setup файл для Jest тестов
global.jest = jest;

// Мокируем console для чистого вывода тестов
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 