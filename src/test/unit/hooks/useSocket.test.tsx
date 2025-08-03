// Mock Socket.IO
const mockSocket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  connected: false,
  id: null,
};

const mockIo = vi.fn().mockReturnValue(mockSocket);

// Mock Socket.IO client
vi.mock('socket.io-client', () => ({
  io: mockIo,
}));

// Mock AuthContext
const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
  }),
}));

import { renderHook, act } from '@testing-library/react';
import { useSocket } from '@/hooks/useSocket';

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    mockSocket.id = null;
  });

  it('возвращает socket функции и состояние', () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current).toHaveProperty('socket');
    expect(result.current).toHaveProperty('isConnected');
    expect(result.current).toHaveProperty('isConnecting');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('connect');
    expect(result.current).toHaveProperty('disconnect');
    expect(result.current).toHaveProperty('emit');
    expect(result.current).toHaveProperty('on');
    expect(result.current).toHaveProperty('off');
  });

  it('создает socket соединение с правильными параметрами', () => {
    renderHook(() => useSocket());

    expect(mockIo).toHaveBeenCalledWith(expect.any(String), {
      auth: { token: expect.any(String) },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });
  });

  it('подключается к серверу', () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.connect();
    });

    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it('отключается от сервера', () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.disconnect();
    });

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('отправляет события', () => {
    const { result } = renderHook(() => useSocket());
    const eventName = 'test_event';
    const eventData = { message: 'test' };

    act(() => {
      result.current.emit(eventName, eventData);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(eventName, eventData);
  });

  it('подписывается на события', () => {
    const { result } = renderHook(() => useSocket());
    const eventName = 'message';
    const handler = vi.fn();

    act(() => {
      result.current.on(eventName, handler);
    });

    expect(mockSocket.on).toHaveBeenCalledWith(eventName, handler);
  });

  it('отписывается от событий', () => {
    const { result } = renderHook(() => useSocket());
    const eventName = 'message';

    act(() => {
      result.current.off(eventName);
    });

    expect(mockSocket.off).toHaveBeenCalledWith(eventName);
  });

  it('отслеживает состояние подключения', () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.isConnected).toBe(false);

    // Симулируем подключение
    act(() => {
      mockSocket.connected = true;
      mockSocket.id = 'socket-123';
      mockSocket.on.mock.calls.find(([event]) => event === 'connect')?.[1]();
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('обрабатывает отключение', () => {
    const { result } = renderHook(() => useSocket());

    // Сначала подключаемся
    act(() => {
      mockSocket.connected = true;
      mockSocket.on.mock.calls.find(([event]) => event === 'connect')?.[1]();
    });

    expect(result.current.isConnected).toBe(true);

    // Симулируем отключение
    act(() => {
      mockSocket.connected = false;
      mockSocket.id = null;
      mockSocket.on.mock.calls.find(([event]) => event === 'disconnect')?.[1]();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('обрабатывает ошибки подключения', () => {
    const { result } = renderHook(() => useSocket());

    // Симулируем ошибку
    act(() => {
      mockSocket.on.mock.calls.find(([event]) => event === 'connect_error')?.[1](new Error('Connection failed'));
    });

    expect(result.current.error).toBe('Connection failed');
  });

  it('очищает все подписки при размонтировании', () => {
    const { result, unmount } = renderHook(() => useSocket());

    // Подписываемся на несколько событий
    act(() => {
      result.current.on('message', vi.fn());
      result.current.on('user_online', vi.fn());
      result.current.on('call_offer', vi.fn());
    });

    unmount();

    // Проверяем, что все подписки очищены
    expect(mockSocket.off).toHaveBeenCalledTimes(3);
  });
}); 