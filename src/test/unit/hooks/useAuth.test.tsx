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
      .mockReturnValueOnce(mockToken) // token
      .mockReturnValueOnce(JSON.stringify(mockUser)); // user

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('регистрирует нового пользователя', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'test-token';
    
    // Mock apiService.register
    const mockApiService = {
      register: vi.fn().mockResolvedValue({
        data: { user: mockUser, token: mockToken },
        error: null,
      }),
    };
    
    vi.doMock('@/services/api', () => ({
      default: mockApiService,
    }));

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
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          age: 25,
          gender: 'male',
          lookingFor: 'female',
        });
      } catch (error) {
        expect(error).toBe(errorMessage);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('выполняет вход пользователя', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'test-token';
    
    // Mock apiService.login
    const mockApiService = {
      login: vi.fn().mockResolvedValue({
        data: { user: mockUser, token: mockToken },
        error: null,
      }),
    };
    
    vi.doMock('@/services/api', () => ({
      default: mockApiService,
    }));

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
        expect(error).toBe(errorMessage);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('выполняет выход пользователя', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    
    // Сначала устанавливаем пользователя
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Симулируем аутентифицированного пользователя
    act(() => {
      result.current.user = mockUser;
    });

    act(() => {
      result.current.logout();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('обновляет профиль пользователя', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const updatedUser = { ...mockUser, name: 'Updated Name', age: 26 };
    
    // Mock apiService.updateProfile
    const mockApiService = {
      updateProfile: vi.fn().mockResolvedValue({
        data: { user: updatedUser },
        error: null,
      }),
    };
    
    vi.doMock('@/services/api', () => ({
      default: mockApiService,
    }));

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
    // Mock apiService.login with error
    const mockApiService = {
      login: vi.fn().mockRejectedValue(new Error('Network error')),
    };
    
    vi.doMock('@/services/api', () => ({
      default: mockApiService,
    }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'password123');
      } catch (error) {
        expect(error).toBe('Network error');
      }
    });
  });

}); 