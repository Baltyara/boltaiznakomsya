import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsEvent {
  id: string;
  userId: string;
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  page: string;
  userAgent: string;
}

export interface AnalyticsMetric {
  totalCalls: number;
  totalMatches: number;
  averageCallDuration: number;
  successRate: number;
  activeUsers: number;
  retentionRate: number;
  popularInterests: string[];
  peakHours: number[];
  userSatisfaction: number;
}

export interface UserAnalytics {
  callsCount: number;
  matchesCount: number;
  totalCallTime: number;
  averageCallDuration: number;
  favoriteInterests: string[];
  activeHours: number[];
  lastActive: Date;
  rating: number;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [metrics, setMetrics] = useState<AnalyticsMetric | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Отправка события аналитики
  const trackEvent = useCallback(async (
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    if (!user) return;

    const analyticsEvent: Omit<AnalyticsEvent, 'id' | 'timestamp'> = {
      userId: user.id,
      event,
      category,
      action,
      label,
      value,
      properties,
      sessionId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    try {
      // Отправка в backend
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(analyticsEvent),
      });

      if (!response.ok) {
        console.error('Ошибка отправки аналитики:', response.statusText);
      }
    } catch (error) {
      console.error('Ошибка отправки аналитики:', error);
    }

    // Также отправляем в Google Analytics если настроен
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...properties,
      });
    }
  }, [user, sessionId]);

  // Отслеживание просмотра страницы
  const trackPageView = useCallback((page: string) => {
    trackEvent('page_view', 'navigation', 'page_view', page);
  }, [trackEvent]);

  // Отслеживание звонка
  const trackCall = useCallback((duration: number, success: boolean, partnerId?: string) => {
    trackEvent('call', 'calls', 'call_completed', success ? 'success' : 'failed', duration, {
      duration,
      success,
      partnerId,
    });
  }, [trackEvent]);

  // Отслеживание совпадения
  const trackMatch = useCallback((partnerId: string, interests: string[]) => {
    trackEvent('match', 'matches', 'match_created', 'new_match', 1, {
      partnerId,
      interests,
    });
  }, [trackEvent]);

  // Отслеживание оценки
  const trackRating = useCallback((rating: number, partnerId?: string) => {
    trackEvent('rating', 'feedback', 'rating_submitted', `rating_${rating}`, rating, {
      rating,
      partnerId,
    });
  }, [trackEvent]);

  // Отслеживание ошибки
  const trackError = useCallback((error: string, context?: string) => {
    trackEvent('error', 'errors', 'error_occurred', error, 1, {
      error,
      context,
      stack: new Error().stack,
    });
  }, [trackEvent]);

  // Отслеживание пользовательского действия
  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    trackEvent('user_action', 'user_behavior', action, undefined, 1, properties);
  }, [trackEvent]);

  // Получение общих метрик
  const fetchMetrics = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Ошибка получения метрик:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Получение аналитики пользователя
  const fetchUserAnalytics = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserAnalytics(data);
      }
    } catch (error) {
      console.error('Ошибка получения аналитики пользователя:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Отслеживание времени на странице
  useEffect(() => {
    const startTime = Date.now();
    
    const handleBeforeUnload = () => {
      const duration = Date.now() - startTime;
      trackEvent('page_exit', 'navigation', 'page_exit', window.location.pathname, duration);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackEvent]);

  // Отслеживание изменений страницы
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, [trackPageView]);

  // Автоматическая загрузка аналитики
  useEffect(() => {
    if (user) {
      fetchMetrics();
      fetchUserAnalytics();
    }
  }, [user, fetchMetrics, fetchUserAnalytics]);

  return {
    metrics,
    userAnalytics,
    isLoading,
    trackEvent,
    trackPageView,
    trackCall,
    trackMatch,
    trackRating,
    trackError,
    trackUserAction,
    fetchMetrics,
    fetchUserAnalytics,
  };
}; 