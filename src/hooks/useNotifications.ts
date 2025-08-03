import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'match' | 'call';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
  data?: Record<string, any>;
}

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  matchNotifications: boolean;
  callNotifications: boolean;
  systemNotifications: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: false,
    emailEnabled: false,
    matchNotifications: true,
    callNotifications: true,
    systemNotifications: true,
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Проверка поддержки уведомлений
  const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  // Запрос разрешения на уведомления
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Ошибка запроса разрешения уведомлений:', error);
      return false;
    }
  }, []);

  // Регистрация Service Worker для push уведомлений
  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker зарегистрирован:', registration);
      return true;
    } catch (error) {
      console.error('Ошибка регистрации Service Worker:', error);
      return false;
    }
  }, []);

  // Отправка push уведомления
  const sendPushNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!isSupported || permission !== 'granted' || !settings.pushEnabled) {
      return false;
    }

    try {
      const newNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: notification.id,
        requireInteraction: notification.type === 'match' || notification.type === 'call',
        actions: notification.action ? [
          {
            action: 'open',
            title: notification.action.label,
          }
        ] : undefined,
        data: notification.data,
      });

      // Обработка клика по уведомлению
      newNotification.onclick = () => {
        if (notification.action) {
          window.open(notification.action.url, '_blank');
        }
        newNotification.close();
      };

      return true;
    } catch (error) {
      console.error('Ошибка отправки push уведомления:', error);
      return false;
    }
  }, [permission, settings.pushEnabled]);

  // Добавление уведомления
  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Отправка push уведомления если разрешено
    if (notification.type === 'match' && settings.matchNotifications) {
      await sendPushNotification(notification);
    } else if (notification.type === 'call' && settings.callNotifications) {
      await sendPushNotification(notification);
    } else if (notification.type !== 'match' && notification.type !== 'call' && settings.systemNotifications) {
      await sendPushNotification(notification);
    }

    return newNotification;
  }, [sendPushNotification, settings]);

  // Отметить уведомление как прочитанное
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  // Отметить все уведомления как прочитанные
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Удалить уведомление
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Очистить все уведомления
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Обновление настроек уведомлений
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Получение непрочитанных уведомлений
  const unreadCount = notifications.filter(n => !n.read).length;

  // Инициализация при загрузке
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        requestPermission();
      }
      
      registerServiceWorker();
    }
  }, [isSupported, requestPermission, registerServiceWorker]);

  // Слушатель входящих уведомлений
  useEffect(() => {
    if (!isSupported) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION') {
        addNotification(event.data.notification);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [isSupported, addNotification]);

  return {
    notifications,
    settings,
    permission,
    isSupported,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    updateSettings,
    requestPermission,
  };
}; 