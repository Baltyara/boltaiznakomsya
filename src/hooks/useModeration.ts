import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: 'inappropriate' | 'spam' | 'harassment' | 'fake' | 'other';
  description: string;
  evidence?: string; // URL к скриншоту или записи
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderatorId?: string;
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModerationAction {
  id: string;
  userId: string;
  action: 'warning' | 'suspension' | 'ban' | 'restriction';
  reason: string;
  duration?: number; // в днях, 0 = навсегда
  moderatorId: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface UserModerationStatus {
  userId: string;
  warnings: number;
  suspensions: number;
  isBanned: boolean;
  banExpiresAt?: Date;
  restrictions: string[];
  lastViolation?: Date;
}

export const useModeration = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Отправка жалобы
  const submitReport = useCallback(async (
    reportedUserId: string,
    reason: Report['reason'],
    description: string,
    evidence?: string
  ) => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const response = await fetch('/api/moderation/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          reportedUserId,
          reason,
          description,
          evidence,
        }),
      });

      if (response.ok) {
        const newReport = await response.json();
        setReports(prev => [newReport, ...prev]);
        return newReport;
      }
    } catch (error) {
      console.error('Ошибка отправки жалобы:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [user]);

  // Получение жалоб пользователя
  const fetchUserReports = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/moderation/reports/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const userReports = await response.json();
        setReports(userReports);
      }
    } catch (error) {
      console.error('Ошибка получения жалоб:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Получение статуса модерации пользователя
  const fetchUserModerationStatus = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/moderation/status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Ошибка получения статуса модерации:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Проверка контента на неприемлемость
  const checkContent = useCallback(async (content: string, type: 'text' | 'image' | 'audio') => {
    try {
      const response = await fetch('/api/moderation/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content,
          type,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Ошибка проверки контента:', error);
    }
    return { isAppropriate: true, confidence: 1 };
  }, []);

  // Фильтрация неприемлемого контента
  const filterContent = useCallback((content: string) => {
    // Простая фильтрация нецензурных слов
    const inappropriateWords = [
      'спам', 'реклама', 'мошенничество', 'обман',
      // Добавьте больше слов по необходимости
    ];

    let filteredContent = content;
    inappropriateWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filteredContent = filteredContent.replace(regex, '*'.repeat(word.length));
    });

    return filteredContent;
  }, []);

  // Проверка пользователя на подозрительную активность
  const checkUserActivity = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/moderation/activity/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Ошибка проверки активности пользователя:', error);
    }
    return { isSuspicious: false, riskScore: 0 };
  }, []);

  // Автоматическая модерация
  const autoModerate = useCallback(async (userId: string, action: string, reason: string) => {
    try {
      const response = await fetch('/api/moderation/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId,
          action,
          reason,
        }),
      });

      if (response.ok) {
        const moderationAction = await response.json();
        setModerationActions(prev => [moderationAction, ...prev]);
        return moderationAction;
      }
    } catch (error) {
      console.error('Ошибка автоматической модерации:', error);
    }
    return null;
  }, []);

  // Получение статистики модерации
  const fetchModerationStats = useCallback(async () => {
    try {
      const response = await fetch('/api/moderation/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Ошибка получения статистики модерации:', error);
    }
    return null;
  }, []);

  // Проверка прав модератора
  const isModerator = useCallback(() => {
    return user?.role === 'moderator' || user?.role === 'admin';
  }, [user]);

  // Проверка прав администратора
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  return {
    reports,
    moderationActions,
    isLoading,
    submitReport,
    fetchUserReports,
    fetchUserModerationStatus,
    checkContent,
    filterContent,
    checkUserActivity,
    autoModerate,
    fetchModerationStats,
    isModerator,
    isAdmin,
  };
}; 