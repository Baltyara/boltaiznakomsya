import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Интерфейсы для нативных адаптеров
export interface NativeAdapter {
  platform: 'web' | 'android' | 'ios';
  isNative: boolean;
  capabilities: {
    camera: boolean;
    microphone: boolean;
    notifications: boolean;
    contacts: boolean;
    location: boolean;
    storage: boolean;
    biometrics: boolean;
    sharing: boolean;
  };
}

export interface NativeAPI {
  // Камера и медиа
  requestCameraPermission: () => Promise<boolean>;
  requestMicrophonePermission: () => Promise<boolean>;
  capturePhoto: () => Promise<string | null>;
  recordAudio: (duration: number) => Promise<string | null>;
  
  // Уведомления
  requestNotificationPermission: () => Promise<boolean>;
  scheduleNotification: (notification: any) => Promise<void>;
  
  // Контакты
  requestContactsPermission: () => Promise<boolean>;
  getContacts: () => Promise<any[]>;
  
  // Геолокация
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<{ lat: number; lng: number } | null>;
  
  // Хранилище
  setSecureStorage: (key: string, value: string) => Promise<void>;
  getSecureStorage: (key: string) => Promise<string | null>;
  
  // Биометрия
  checkBiometricSupport: () => Promise<boolean>;
  authenticateWithBiometrics: () => Promise<boolean>;
  
  // Поделиться
  share: (content: { text?: string; url?: string; image?: string }) => Promise<void>;
  
  // Системные функции
  setStatusBarStyle: (style: 'light' | 'dark') => void;
  setNavigationBarColor: (color: string) => void;
  hapticFeedback: (type: 'light' | 'medium' | 'heavy') => void;
}

export const useNativeAdapters = (): { adapter: NativeAdapter; api: NativeAPI } => {
  const [adapter, setAdapter] = useState<NativeAdapter>({
    platform: 'web',
    isNative: false,
    capabilities: {
      camera: false,
      microphone: false,
      notifications: false,
      contacts: false,
      location: false,
      storage: false,
      biometrics: false,
      sharing: false,
    },
  });

  // Определение платформы и возможностей
  useEffect(() => {
    const detectPlatform = () => {
      // Проверка нативных мостов
      const isNativeAndroid = !!(window as any).Android;
      const isNativeIOS = !!(window as any).webkit?.messageHandlers;
      
      let platform: 'web' | 'android' | 'ios' = 'web';
      let isNative = false;

      if (isNativeAndroid) {
        platform = 'android';
        isNative = true;
      } else if (isNativeIOS) {
        platform = 'ios';
        isNative = true;
      }

      // Проверка веб-возможностей
      const capabilities = {
        camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
        notifications: 'Notification' in window,
        contacts: false, // Не поддерживается в вебе
        location: 'geolocation' in navigator,
        storage: 'localStorage' in window,
        biometrics: false, // Веб-аутентификация требует отдельной проверки
        sharing: 'share' in navigator,
      };

      setAdapter({
        platform,
        isNative,
        capabilities,
      });
    };

    detectPlatform();
  }, []);

  // Веб-реализация API
  const webAPI: NativeAPI = {
    requestCameraPermission: async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        return true;
      } catch {
        return false;
      }
    },

    requestMicrophonePermission: async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
      } catch {
        return false;
      }
    },

    capturePhoto: async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        return new Promise((resolve) => {
          video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx?.drawImage(video, 0, 0);
            stream.getTracks().forEach(track => track.stop());
            resolve(canvas.toDataURL());
          };
          video.srcObject = stream;
          video.play();
        });
      } catch {
        return null;
      }
    },

    recordAudio: async (duration: number) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        return new Promise((resolve) => {
          mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            stream.getTracks().forEach(track => track.stop());
            resolve(url);
          };

          mediaRecorder.start();
          setTimeout(() => mediaRecorder.stop(), duration);
        });
      } catch {
        return null;
      }
    },

    requestNotificationPermission: async () => {
      if (!('Notification' in window)) return false;
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    },

    scheduleNotification: async (notification: any) => {
      if ('serviceWorker' in navigator && 'Notification' in window) {
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon,
        });
      }
    },

    requestContactsPermission: async () => false, // Не поддерживается в вебе

    getContacts: async () => [], // Не поддерживается в вебе

    requestLocationPermission: async () => {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false)
        );
      });
    },

    getCurrentLocation: async () => {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
          () => resolve(null)
        );
      });
    },

    setSecureStorage: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    },

    getSecureStorage: async (key: string) => {
      return localStorage.getItem(key);
    },

    checkBiometricSupport: async () => {
      return 'credentials' in navigator && 'create' in navigator.credentials;
    },

    authenticateWithBiometrics: async () => {
      try {
        if ('credentials' in navigator) {
          const credential = await navigator.credentials.create({
            publicKey: {
              challenge: new Uint8Array(32),
              rp: { name: 'Boltaiznakomsya' },
              user: {
                id: new Uint8Array(16),
                name: 'user',
                displayName: 'User',
              },
              pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
              authenticatorSelection: {
                userVerification: 'required',
              },
            },
          });
          return !!credential;
        }
        return false;
      } catch {
        return false;
      }
    },

    share: async (content) => {
      if ('share' in navigator) {
        await navigator.share(content);
      } else {
        // Fallback для браузеров без поддержки Web Share API
        const text = content.text || content.url || '';
        await navigator.clipboard?.writeText(text);
      }
    },

    setStatusBarStyle: () => {}, // Не применимо для веба

    setNavigationBarColor: () => {}, // Не применимо для веба

    hapticFeedback: (type) => {
      // Попытка вибрации на мобильных устройствах
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [50],
          heavy: [100],
        };
        navigator.vibrate(patterns[type]);
      }
    },
  };

  // Нативная реализация API (будет вызывать нативные методы)
  const nativeAPI: NativeAPI = {
    requestCameraPermission: async () => {
      if (adapter.platform === 'android') {
        return !!(window as any).Android?.requestCameraPermission?.();
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.requestCameraPermission?.postMessage({});
          // В реальном приложении здесь был бы callback
          resolve(true);
        });
      }
      return webAPI.requestCameraPermission();
    },

    requestMicrophonePermission: async () => {
      if (adapter.platform === 'android') {
        return !!(window as any).Android?.requestMicrophonePermission?.();
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.requestMicrophonePermission?.postMessage({});
          resolve(true);
        });
      }
      return webAPI.requestMicrophonePermission();
    },

    capturePhoto: async () => {
      if (adapter.platform === 'android') {
        return (window as any).Android?.capturePhoto?.() || null;
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.capturePhoto?.postMessage({});
          // В реальном приложении результат вернется через callback
          resolve(null);
        });
      }
      return webAPI.capturePhoto();
    },

    recordAudio: async (duration: number) => {
      if (adapter.platform === 'android') {
        return (window as any).Android?.recordAudio?.(duration) || null;
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.recordAudio?.postMessage({ duration });
          resolve(null);
        });
      }
      return webAPI.recordAudio(duration);
    },

    requestNotificationPermission: async () => {
      if (adapter.platform === 'android') {
        return !!(window as any).Android?.requestNotificationPermission?.();
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.requestNotificationPermission?.postMessage({});
          resolve(true);
        });
      }
      return webAPI.requestNotificationPermission();
    },

    scheduleNotification: async (notification) => {
      if (adapter.platform === 'android') {
        (window as any).Android?.scheduleNotification?.(JSON.stringify(notification));
      } else if (adapter.platform === 'ios') {
        (window as any).webkit?.messageHandlers?.scheduleNotification?.postMessage(notification);
      } else {
        return webAPI.scheduleNotification(notification);
      }
    },

    requestContactsPermission: async () => {
      if (adapter.platform === 'android') {
        return !!(window as any).Android?.requestContactsPermission?.();
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.requestContactsPermission?.postMessage({});
          resolve(true);
        });
      }
      return false;
    },

    getContacts: async () => {
      if (adapter.platform === 'android') {
        const contacts = (window as any).Android?.getContacts?.();
        return contacts ? JSON.parse(contacts) : [];
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.getContacts?.postMessage({});
          resolve([]);
        });
      }
      return [];
    },

    requestLocationPermission: async () => {
      if (adapter.platform === 'android') {
        return !!(window as any).Android?.requestLocationPermission?.();
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.requestLocationPermission?.postMessage({});
          resolve(true);
        });
      }
      return webAPI.requestLocationPermission();
    },

    getCurrentLocation: async () => {
      if (adapter.platform === 'android') {
        const location = (window as any).Android?.getCurrentLocation?.();
        return location ? JSON.parse(location) : null;
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.getCurrentLocation?.postMessage({});
          resolve(null);
        });
      }
      return webAPI.getCurrentLocation();
    },

    setSecureStorage: async (key: string, value: string) => {
      if (adapter.platform === 'android') {
        (window as any).Android?.setSecureStorage?.(key, value);
      } else if (adapter.platform === 'ios') {
        (window as any).webkit?.messageHandlers?.setSecureStorage?.postMessage({ key, value });
      } else {
        return webAPI.setSecureStorage(key, value);
      }
    },

    getSecureStorage: async (key: string) => {
      if (adapter.platform === 'android') {
        return (window as any).Android?.getSecureStorage?.(key) || null;
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.getSecureStorage?.postMessage({ key });
          resolve(null);
        });
      }
      return webAPI.getSecureStorage(key);
    },

    checkBiometricSupport: async () => {
      if (adapter.platform === 'android') {
        return !!(window as any).Android?.checkBiometricSupport?.();
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.checkBiometricSupport?.postMessage({});
          resolve(true);
        });
      }
      return webAPI.checkBiometricSupport();
    },

    authenticateWithBiometrics: async () => {
      if (adapter.platform === 'android') {
        return !!(window as any).Android?.authenticateWithBiometrics?.();
      } else if (adapter.platform === 'ios') {
        return new Promise((resolve) => {
          (window as any).webkit?.messageHandlers?.authenticateWithBiometrics?.postMessage({});
          resolve(true);
        });
      }
      return webAPI.authenticateWithBiometrics();
    },

    share: async (content) => {
      if (adapter.platform === 'android') {
        (window as any).Android?.share?.(JSON.stringify(content));
      } else if (adapter.platform === 'ios') {
        (window as any).webkit?.messageHandlers?.share?.postMessage(content);
      } else {
        return webAPI.share(content);
      }
    },

    setStatusBarStyle: (style) => {
      if (adapter.platform === 'android') {
        (window as any).Android?.setStatusBarStyle?.(style);
      } else if (adapter.platform === 'ios') {
        (window as any).webkit?.messageHandlers?.setStatusBarStyle?.postMessage({ style });
      }
    },

    setNavigationBarColor: (color) => {
      if (adapter.platform === 'android') {
        (window as any).Android?.setNavigationBarColor?.(color);
      }
    },

    hapticFeedback: (type) => {
      if (adapter.platform === 'android') {
        (window as any).Android?.hapticFeedback?.(type);
      } else if (adapter.platform === 'ios') {
        (window as any).webkit?.messageHandlers?.hapticFeedback?.postMessage({ type });
      } else {
        webAPI.hapticFeedback(type);
      }
    },
  };

  return {
    adapter,
    api: adapter.isNative ? nativeAPI : webAPI,
  };
}; 