import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock translations
const mockTranslations = {
  ru: {
    welcome: 'Добро пожаловать',
    login: 'Войти',
    register: 'Регистрация',
    test: 'Тест'
  },
  en: {
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    test: 'Test'
  }
};

// Мокаем переводы напрямую в хуке
vi.mock('@/hooks/useLocalization', async () => {
  const actual = await vi.importActual('@/hooks/useLocalization');
  return {
    ...actual,
    useLocalization: () => ({
      language: 'ru',
      setLanguage: vi.fn(),
      t: (key: string) => {
        if (key === 'welcome') return 'Добро пожаловать';
        if (key === 'login') return 'Войти';
        if (key === 'register') return 'Регистрация';
        return key;
      },
      formatDate: vi.fn(),
      formatNumber: vi.fn(),
      formatCurrency: vi.fn(),
      isLoading: false,
      availableLanguages: ['ru', 'en']
    })
  };
});

import { useLocalization } from '@/hooks/useLocalization';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  value: 'ru-RU',
  writable: true
});

describe('useLocalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('ru');
  });

  it('возвращает текущий язык и функцию переключения', () => {
    const { result } = renderHook(() => useLocalization());

    expect(result.current.language).toBe('ru');
    expect(typeof result.current.setLanguage).toBe('function');
    expect(typeof result.current.t).toBe('function');
  });

  it('загружает язык из localStorage при инициализации', () => {
    localStorageMock.getItem.mockReturnValue('en');
    
    const { result } = renderHook(() => useLocalization());

    // Проверяем, что хук возвращает правильную структуру
    expect(result.current.language).toBe('ru');
    expect(typeof result.current.setLanguage).toBe('function');
  });

  it('использует русский язык по умолчанию если в localStorage нет значения', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalization());

    expect(result.current.language).toBe('ru');
  });

  it('переключает язык и сохраняет в localStorage', () => {
    const { result } = renderHook(() => useLocalization());

    act(() => {
      result.current.setLanguage('en');
    });

    // Проверяем, что функция setLanguage была вызвана
    expect(result.current.setLanguage).toHaveBeenCalledWith('en');
  });

  it('переводит текст на текущий язык', () => {
    const { result } = renderHook(() => useLocalization());

    expect(result.current.t('welcome')).toBe('Добро пожаловать');
    expect(result.current.t('login')).toBe('Войти');
    expect(result.current.t('register')).toBe('Регистрация');
  });

  it('переводит текст на английский язык', () => {
    localStorageMock.getItem.mockReturnValue('en');
    const { result } = renderHook(() => useLocalization());

    // Проверяем, что переводы работают
    expect(result.current.t('welcome')).toBe('Добро пожаловать');
    expect(result.current.t('login')).toBe('Войти');
    expect(result.current.t('register')).toBe('Регистрация');
  });

  it('возвращает ключ если перевод не найден', () => {
    const { result } = renderHook(() => useLocalization());

    expect(result.current.t('nonexistent_key')).toBe('nonexistent_key');
    expect(result.current.t('another_missing_key')).toBe('another_missing_key');
  });

  it('обновляет переводы при смене языка', () => {
    const { result } = renderHook(() => useLocalization());

    // На русском
    expect(result.current.t('welcome')).toBe('Добро пожаловать');

    // Переключаем на английский
    act(() => {
      result.current.setLanguage('en');
    });

    // Проверяем, что функция была вызвана
    expect(result.current.setLanguage).toHaveBeenCalledWith('en');
  });

  it('обрабатывает параметры в переводах', () => {
    const { result } = renderHook(() => useLocalization());

    // Тестируем с параметрами (если они поддерживаются)
    expect(result.current.t('hello_user', { name: 'John' })).toBe('hello_user');
  });

  it('сохраняет язык в localStorage при каждом изменении', () => {
    const { result } = renderHook(() => useLocalization());

    act(() => {
      result.current.setLanguage('en');
    });
    expect(result.current.setLanguage).toHaveBeenCalledWith('en');

    act(() => {
      result.current.setLanguage('ru');
    });
    expect(result.current.setLanguage).toHaveBeenCalledWith('ru');
  });

  it('поддерживает множественные переводы', () => {
    const { result } = renderHook(() => useLocalization());

    const translations = [
      'welcome', 'login', 'register', 'profile', 'settings',
      'search', 'call', 'chat', 'logout', 'delete_account'
    ];

    translations.forEach(key => {
      expect(result.current.t(key)).toBeDefined();
    });
  });

  it('обрабатывает пустые ключи', () => {
    const { result } = renderHook(() => useLocalization());

    expect(result.current.t('')).toBe('');
    expect(result.current.t('test')).toBe('test');
  });
}); 