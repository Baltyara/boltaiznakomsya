import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNotifications } from '../useNotifications';

// Мокируем useAuth
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User' },
    isAuthenticated: true,
  }),
}));

// Мокируем Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: {
    permission: 'granted',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  },
});

// Мокируем Service Worker API с полными методами
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    register: vi.fn().mockResolvedValue({
      pushManager: {
        subscribe: vi.fn().mockResolvedValue({
          toJSON: () => ({ endpoint: 'test-endpoint' }),
        }),
      },
    }),
  },
});

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.permission).toBe('granted');
    expect(typeof result.current.requestPermission).toBe('function');
    expect(typeof result.current.addNotification).toBe('function');
    expect(typeof result.current.markAsRead).toBe('function');
    expect(typeof result.current.removeNotification).toBe('function');
  });

  it('should add notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe('Test Notification');
    expect(result.current.unreadCount).toBe(1);
  });

  it('should mark notification as read', () => {
    const { result } = renderHook(() => useNotifications());

    // Добавляем уведомление
    act(() => {
      result.current.addNotification({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
      });
    });

    expect(result.current.unreadCount).toBe(1);

    // Отмечаем как прочитанное
    act(() => {
      result.current.markAsRead(result.current.notifications[0].id);
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].read).toBe(true);
  });

  it('should remove notification', () => {
    const { result } = renderHook(() => useNotifications());

    // Добавляем уведомление
    act(() => {
      result.current.addNotification({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info',
      });
    });

    expect(result.current.notifications).toHaveLength(1);

    // Удаляем уведомление
    act(() => {
      result.current.removeNotification(result.current.notifications[0].id);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should request permission', async () => {
    const { result } = renderHook(() => useNotifications());

    const granted = await result.current.requestPermission();

    expect(granted).toBe(true);
    expect(window.Notification.requestPermission).toHaveBeenCalled();
  });

  it('should handle different notification types', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        title: 'Match Found',
        message: 'You have a new match!',
        type: 'match',
      });

      result.current.addNotification({
        title: 'Incoming Call',
        message: 'Someone is calling you',
        type: 'call',
      });

      result.current.addNotification({
        title: 'Error',
        message: 'Something went wrong',
        type: 'error',
      });
    });

    expect(result.current.notifications).toHaveLength(3);
    expect(result.current.notifications[2].type).toBe('match');
    expect(result.current.notifications[1].type).toBe('call');
    expect(result.current.notifications[0].type).toBe('error');
  });

  it('should update settings', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.updateSettings({
        pushEnabled: true,
        emailEnabled: false,
        matchNotifications: true,
        callNotifications: false,
        systemNotifications: true,
      });
    });

    expect(result.current.settings.pushEnabled).toBe(true);
    expect(result.current.settings.emailEnabled).toBe(false);
    expect(result.current.settings.matchNotifications).toBe(true);
    expect(result.current.settings.callNotifications).toBe(false);
    expect(result.current.settings.systemNotifications).toBe(true);
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useNotifications());

    // Добавляем несколько уведомлений
    act(() => {
      result.current.addNotification({
        title: 'Test 1',
        message: 'Test message 1',
        type: 'info',
      });

      result.current.addNotification({
        title: 'Test 2',
        message: 'Test message 2',
        type: 'info',
      });
    });

    expect(result.current.notifications).toHaveLength(2);

    // Очищаем все уведомления
    act(() => {
      result.current.notifications.forEach(notification => {
        result.current.removeNotification(notification.id);
      });
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });
}); 