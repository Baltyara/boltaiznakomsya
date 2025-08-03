import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'ultimate';
export type PaymentProvider = 'stripe' | 'paypal' | 'apple' | 'google' | 'yandex';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing: 'monthly' | 'yearly';
  features: string[];
  limits: {
    dailyCalls: number;
    monthlyMatches: number;
    premiumFeatures: boolean;
    prioritySupport: boolean;
    adFree: boolean;
  };
  popular?: boolean;
  discount?: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
  nextBillingDate?: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'yandex_money';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'subscription' | 'one_time' | 'refund';
  description: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  requiredTier: SubscriptionTier;
  enabled: boolean;
}

export const useMonetization = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Планы подписок
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      tier: 'free',
      name: 'Бесплатный',
      description: 'Базовые функции для знакомства',
      price: 0,
      currency: 'RUB',
      billing: 'monthly',
      features: [
        '3 звонка в день',
        '10 совпадений в месяц',
        'Базовые фильтры',
        'Стандартная поддержка',
      ],
      limits: {
        dailyCalls: 3,
        monthlyMatches: 10,
        premiumFeatures: false,
        prioritySupport: false,
        adFree: false,
      },
    },
    {
      id: 'basic-monthly',
      tier: 'basic',
      name: 'Базовый',
      description: 'Больше возможностей для активного общения',
      price: 299,
      currency: 'RUB',
      billing: 'monthly',
      features: [
        '10 звонков в день',
        '50 совпадений в месяц',
        'Расширенные фильтры',
        'Без рекламы',
        'Приоритетная поддержка',
      ],
      limits: {
        dailyCalls: 10,
        monthlyMatches: 50,
        premiumFeatures: true,
        prioritySupport: true,
        adFree: true,
      },
    },
    {
      id: 'premium-monthly',
      tier: 'premium',
      name: 'Премиум',
      description: 'Максимум возможностей для серьезных знакомств',
      price: 599,
      currency: 'RUB',
      billing: 'monthly',
      features: [
        'Безлимитные звонки',
        'Безлимитные совпадения',
        'Все премиум функции',
        'Видеозвонки',
        'Супер лайки',
        'Кто меня лайкнул',
        'VIP поддержка',
      ],
      limits: {
        dailyCalls: -1, // -1 = безлимит
        monthlyMatches: -1,
        premiumFeatures: true,
        prioritySupport: true,
        adFree: true,
      },
      popular: true,
    },
    {
      id: 'ultimate-yearly',
      tier: 'ultimate',
      name: 'Ультимейт',
      description: 'Годовая подписка со скидкой 50%',
      price: 3599,
      currency: 'RUB',
      billing: 'yearly',
      features: [
        'Все функции Премиум',
        'Персональный менеджер',
        'Эксклюзивные события',
        'Ранний доступ к новинкам',
        '50% скидка на год',
      ],
      limits: {
        dailyCalls: -1,
        monthlyMatches: -1,
        premiumFeatures: true,
        prioritySupport: true,
        adFree: true,
      },
      discount: 50,
    },
  ];

  // Премиум функции
  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'unlimited_calls',
      name: 'Безлимитные звонки',
      description: 'Звоните сколько угодно без ограничений',
      requiredTier: 'premium',
      enabled: false,
    },
    {
      id: 'video_calls',
      name: 'Видеозвонки',
      description: 'Общайтесь по видеосвязи',
      requiredTier: 'premium',
      enabled: false,
    },
    {
      id: 'super_likes',
      name: 'Супер лайки',
      description: 'Выделяйтесь среди других пользователей',
      requiredTier: 'basic',
      enabled: false,
    },
    {
      id: 'who_liked_me',
      name: 'Кто меня лайкнул',
      description: 'Узнайте, кому вы понравились',
      requiredTier: 'premium',
      enabled: false,
    },
    {
      id: 'ad_free',
      name: 'Без рекламы',
      description: 'Пользуйтесь приложением без рекламы',
      requiredTier: 'basic',
      enabled: false,
    },
  ];

  // Получение текущей подписки
  const fetchSubscription = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Ошибка получения подписки:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Получение способов оплаты
  const fetchPaymentMethods = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/payment-methods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error('Ошибка получения способов оплаты:', error);
    }
  }, [user]);

  // Получение истории транзакций
  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Ошибка получения транзакций:', error);
    }
  }, [user]);

  // Создание подписки
  const createSubscription = useCallback(async (
    planId: string,
    paymentMethodId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          planId,
          paymentMethodId,
        }),
      });

      if (response.ok) {
        const newSubscription = await response.json();
        setSubscription(newSubscription);
        return true;
      }
    } catch (error) {
      console.error('Ошибка создания подписки:', error);
    } finally {
      setIsProcessing(false);
    }
    return false;
  }, [user]);

  // Отмена подписки
  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/subscription/${subscription.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const updatedSubscription = await response.json();
        setSubscription(updatedSubscription);
        return true;
      }
    } catch (error) {
      console.error('Ошибка отмены подписки:', error);
    } finally {
      setIsProcessing(false);
    }
    return false;
  }, [subscription]);

  // Возобновление подписки
  const resumeSubscription = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/subscription/${subscription.id}/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const updatedSubscription = await response.json();
        setSubscription(updatedSubscription);
        return true;
      }
    } catch (error) {
      console.error('Ошибка возобновления подписки:', error);
    } finally {
      setIsProcessing(false);
    }
    return false;
  }, [subscription]);

  // Добавление способа оплаты
  const addPaymentMethod = useCallback(async (
    paymentData: any,
    provider: PaymentProvider
  ): Promise<boolean> => {
    if (!user) return false;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...paymentData,
          provider,
        }),
      });

      if (response.ok) {
        const newPaymentMethod = await response.json();
        setPaymentMethods(prev => [...prev, newPaymentMethod]);
        return true;
      }
    } catch (error) {
      console.error('Ошибка добавления способа оплаты:', error);
    } finally {
      setIsProcessing(false);
    }
    return false;
  }, [user]);

  // Удаление способа оплаты
  const removePaymentMethod = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
        return true;
      }
    } catch (error) {
      console.error('Ошибка удаления способа оплаты:', error);
    } finally {
      setIsProcessing(false);
    }
    return false;
  }, []);

  // Проверка доступности премиум функции
  const hasFeature = useCallback((featureId: string): boolean => {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const plan = subscriptionPlans.find(p => p.id === subscription.planId);
    if (!plan) return false;

    const feature = premiumFeatures.find(f => f.id === featureId);
    if (!feature) return false;

    const tierOrder: SubscriptionTier[] = ['free', 'basic', 'premium', 'ultimate'];
    const userTierIndex = tierOrder.indexOf(plan.tier);
    const requiredTierIndex = tierOrder.indexOf(feature.requiredTier);

    return userTierIndex >= requiredTierIndex;
  }, [subscription, subscriptionPlans, premiumFeatures]);

  // Получение оставшихся лимитов
  const getRemainingLimits = useCallback(() => {
    if (!subscription || subscription.status !== 'active') {
      const freePlan = subscriptionPlans.find(p => p.tier === 'free')!;
      return freePlan.limits;
    }

    const plan = subscriptionPlans.find(p => p.id === subscription.planId);
    return plan?.limits || subscriptionPlans[0].limits;
  }, [subscription, subscriptionPlans]);

  // Инициализация
  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchPaymentMethods();
      fetchTransactions();
    }
  }, [user, fetchSubscription, fetchPaymentMethods, fetchTransactions]);

  return {
    subscription,
    paymentMethods,
    transactions,
    subscriptionPlans,
    premiumFeatures,
    isLoading,
    isProcessing,
    createSubscription,
    cancelSubscription,
    resumeSubscription,
    addPaymentMethod,
    removePaymentMethod,
    hasFeature,
    getRemainingLimits,
    fetchSubscription,
    fetchPaymentMethods,
    fetchTransactions,
  };
}; 