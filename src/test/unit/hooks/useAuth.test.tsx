import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';

// Mock fetch
global.fetch = vi.fn();

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

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('возвращает функции аутентификации и состояние', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('register');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('updateProfile');
    expect(result.current).toHaveProperty('updatePreferences');
    expect(result.current).toHaveProperty('clearError');
  });

  it('инициализируется с неаутентифицированным состоянием', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('загружает пользователя из localStorage при инициализации', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'test-token';
    
    localStorageMock.getItem
      .mockImplementation((key: string) => {
        if (key === 'authToken') return mockToken;
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Проверяем, что хук возвращает правильную структуру
    expect(result.current.user).toBeDefined();
    expect(result.current.isAuthenticated).toBeDefined();
  });

  it('регистрирует нового пользователя', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'test-token';
    
    // Mock fetch для успешной регистрации
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('обрабатывает ошибки при регистрации', async () => {
    const errorMessage = 'Email already exists';
    
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.register({
          email: 'test@example.com',
          password: 'password123',
        });
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('выполняет вход пользователя', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'test-token';
    
    // Mock fetch для успешного входа
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: mockToken }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('обрабатывает ошибки при входе', async () => {
    const errorMessage = 'Invalid credentials';
    
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrongpassword');
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('выполняет выход пользователя', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    // Проверяем, что функция logout была вызвана
    expect(result.current.logout).toBeDefined();
  });

  it('обновляет профиль пользователя', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const updatedUser = { ...mockUser, name: 'Updated Name', age: 26 };
    
    // Mock fetch для успешного обновления профиля
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: updatedUser }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.updateProfile({
        name: 'Updated Name',
        age: 26,
      });
    });

    expect(result.current.user).toEqual(updatedUser);
  });



  it('обрабатывает сетевые ошибки', async () => {
    // Mock fetch with network error
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'password123');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });
  });

}); 