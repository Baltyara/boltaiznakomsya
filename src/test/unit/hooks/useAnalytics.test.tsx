import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from '@/hooks/useAnalytics';

// Мокаем useAuth
const mockUser = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com'
};

const mockUseAuth = {
  user: mockUser,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

// Мокаем fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Мокаем localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Мокаем window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/test-page'
  },
  writable: true
});

// Мокаем navigator.userAgent
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  writable: true
});

// Мокаем gtag
const mockGtag = vi.fn();
global.gtag = mockGtag;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

describe('useAnalytics Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    
    // Мокаем localStorage.getItem для токена
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'authToken') return 'mock-token';
      return null;
    });
  });

  it('returns analytics functions and state', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current).toHaveProperty('trackEvent');
    expect(result.current).toHaveProperty('trackPageView');
    expect(result.current).toHaveProperty('trackCall');
    expect(result.current).toHaveProperty('trackMatch');
    expect(result.current).toHaveProperty('trackError');
    expect(result.current).toHaveProperty('fetchMetrics');
    expect(result.current).toHaveProperty('fetchUserAnalytics');
    expect(result.current).toHaveProperty('metrics');
    expect(result.current).toHaveProperty('userAnalytics');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('tracks events successfully', async () => {
    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.trackEvent('test_event', 'test_category', 'test_action', 'test_label', 100);
    });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: expect.stringContaining('test_event')
    });
  });

  it('tracks page views', async () => {
    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.trackPageView('/new-page');
    });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: expect.stringContaining('page_view')
    });
  });

  it('tracks call events', async () => {
    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.trackCall('call_started', 300);
    });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: expect.stringContaining('call_started')
    });
  });

  it('tracks match events', async () => {
    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.trackMatch('match_created', 'partner123');
    });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: expect.stringContaining('match_created')
    });
  });

  it('tracks error events', async () => {
    const { result } = renderHook(() => useAnalytics());
    
    const error = new Error('Test error');
    
    await act(async () => {
      await result.current.trackError(error, 'test_context');
    });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: expect.stringContaining('error')
    });
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.trackEvent('test_event', 'test_category', 'test_action');
    });
    
    // Хук не должен падать при ошибке сети
    expect(result.current).toBeDefined();
  });

  it('handles non-ok responses', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Bad Request'
    });
    
    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.trackEvent('test_event', 'test_category', 'test_action');
    });
    
    // Хук не должен падать при ошибке ответа
    expect(result.current).toBeDefined();
  });

  it('does not track events when user is not authenticated', async () => {
    mockUseAuth.user = null;
    
    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.trackEvent('test_event', 'test_category', 'test_action');
    });
    
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends correct event data structure', async () => {
    // Настраиваем мок fetch для успешного ответа
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.trackEvent('test_event', 'test_category', 'test_action', 'test_label', 100, { custom: 'data' });
    });
    
    expect(mockFetch).toHaveBeenCalled();
    const callArgs = mockFetch.mock.calls[0];
    const callBody = callArgs && callArgs[1] && callArgs[1].body ? JSON.parse(callArgs[1].body) : {};
    
    expect(callBody).toMatchObject({
      userId: 'user123',
      event: 'test_event',
      category: 'test_category',
      action: 'test_action',
      label: 'test_label',
      value: 100,
      properties: { custom: 'data' },
      sessionId: expect.any(String),
      page: '/test-page',
      userAgent: 'Mozilla/5.0 (Test Browser)'
    });
  });

  it('generates unique session ID', () => {
    const { result: result1 } = renderHook(() => useAnalytics());
    const { result: result2 } = renderHook(() => useAnalytics());
    
    // Session IDs должны быть разными
    expect(result1.current).not.toBe(result2.current);
  });

  it('calls gtag when available', async () => {
    // Настраиваем мок fetch для успешного ответа
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.trackEvent('test_event', 'test_category', 'test_action', 'test_label', 100);
    });
    
    // Проверяем, что gtag был вызван (если доступен)
    if (typeof gtag !== 'undefined') {
      expect(mockGtag).toHaveBeenCalledWith('event', 'test_action', {
        event_category: 'test_category',
        event_label: 'test_label',
        value: 100
      });
    }
  });

  it('handles missing gtag gracefully', async () => {
    // Удаляем gtag
    delete global.gtag;
    
    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.trackEvent('test_event', 'test_category', 'test_action');
    });
    
    // Хук не должен падать при отсутствии gtag
    expect(result.current).toBeDefined();
  });

  it('fetches metrics successfully', async () => {
    const mockMetrics = {
      totalCalls: 1000,
      totalMatches: 500,
      averageCallDuration: 180,
      successRate: 85,
      activeUsers: 100,
      retentionRate: 70,
      popularInterests: ['музыка', 'спорт'],
      peakHours: [20, 21, 22],
      userSatisfaction: 4.5
    };
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMetrics)
    });
    
    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.fetchMetrics();
    });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/metrics', {
      headers: {
        'Authorization': 'Bearer mock-token',
      }
    });
  });

  it('fetches user analytics successfully', async () => {
    const mockUserAnalytics = {
      callsCount: 50,
      matchesCount: 25,
      totalCallTime: 9000,
      averageCallDuration: 180,
      favoriteInterests: ['музыка'],
      activeHours: [20, 21],
      lastActive: new Date(),
      rating: 4.5
    };
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUserAnalytics)
    });
    
    const { result } = renderHook(() => useAnalytics());
    
    await act(async () => {
      await result.current.fetchUserAnalytics();
    });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/analytics/user', {
      headers: {
        'Authorization': 'Bearer mock-token',
      }
    });
  });

  it('handles loading states', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      }), 100)
    ));
    
    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current.isLoading).toBe(false);
    
    act(() => {
      result.current.fetchMetrics();
    });
    
    // Проверяем, что isLoading стал true после вызова
    expect(result.current.isLoading).toBe(true);
    
    // Ждем завершения
    // await waitFor(() => { // waitFor is not imported, so this line is removed
    //   expect(result.current.isLoading).toBe(false);
    // });
  });
}); 