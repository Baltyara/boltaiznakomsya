import { useEffect, useState } from 'react';

interface PWAStatus {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  deferredPrompt: any;
}

export const usePWA = () => {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    deferredPrompt: null
  });

  useEffect(() => {
    // Проверяем, установлено ли приложение
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    // Проверяем, запущено ли в standalone режиме
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    setPwaStatus(prev => ({
      ...prev,
      isInstalled,
      isStandalone
    }));

    // Регистрируем Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Обработчик события beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaStatus(prev => ({
        ...prev,
        canInstall: true,
        deferredPrompt: e
      }));
    };

    // Обработчик события appinstalled
    const handleAppInstalled = () => {
      setPwaStatus(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        deferredPrompt: null
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (pwaStatus.deferredPrompt) {
      pwaStatus.deferredPrompt.prompt();
      const { outcome } = await pwaStatus.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPwaStatus(prev => ({
          ...prev,
          canInstall: false,
          deferredPrompt: null
        }));
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  return {
    ...pwaStatus,
    installApp,
    requestNotificationPermission,
    sendNotification
  };
}; 