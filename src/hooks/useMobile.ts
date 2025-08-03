import { useState, useEffect } from 'react';

interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
  isPWA: boolean;
  isStandalone: boolean;
}

export const useMobile = (): MobileInfo => {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    isTouchDevice: false,
    isPWA: false,
    isStandalone: false
  });

  useEffect(() => {
    const updateMobileInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Определение типа устройства
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      // Определение ориентации
      const orientation = width > height ? 'landscape' : 'portrait';
      
      // Определение touch устройства
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Определение PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;
      const isStandalone = isPWA || (window.navigator as any).standalone === true;

      setMobileInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        isTouchDevice,
        isPWA,
        isStandalone
      });
    };

    // Инициализация
    updateMobileInfo();

    // Слушатели событий
    window.addEventListener('resize', updateMobileInfo);
    window.addEventListener('orientationchange', updateMobileInfo);

    return () => {
      window.removeEventListener('resize', updateMobileInfo);
      window.removeEventListener('orientationchange', updateMobileInfo);
    };
  }, []);

  return mobileInfo;
};

// Хук для определения поддержки жестов
export const useTouchGestures = () => {
  const [gestures, setGestures] = useState({
    swipeLeft: false,
    swipeRight: false,
    swipeUp: false,
    swipeDown: false,
    pinch: false,
    longPress: false
  });

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isLongPress = false;
    let longPressTimer: NodeJS.Timeout;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      
      // Long press detection
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        setGestures(prev => ({ ...prev, longPress: true }));
      }, 500);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isLongPress) {
        clearTimeout(longPressTimer);
        isLongPress = false;
        setGestures(prev => ({ ...prev, longPress: false }));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      clearTimeout(longPressTimer);
      
      if (isLongPress) {
        isLongPress = false;
        setGestures(prev => ({ ...prev, longPress: false }));
        return;
      }

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;

      // Минимальное расстояние для свайпа
      const minDistance = 50;
      const maxTime = 300;

      if (deltaTime < maxTime) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Горизонтальный свайп
          if (Math.abs(deltaX) > minDistance) {
            if (deltaX > 0) {
              setGestures(prev => ({ ...prev, swipeRight: true }));
              setTimeout(() => setGestures(prev => ({ ...prev, swipeRight: false })), 100);
            } else {
              setGestures(prev => ({ ...prev, swipeLeft: true }));
              setTimeout(() => setGestures(prev => ({ ...prev, swipeLeft: false })), 100);
            }
          }
        } else {
          // Вертикальный свайп
          if (Math.abs(deltaY) > minDistance) {
            if (deltaY > 0) {
              setGestures(prev => ({ ...prev, swipeDown: true }));
              setTimeout(() => setGestures(prev => ({ ...prev, swipeDown: false })), 100);
            } else {
              setGestures(prev => ({ ...prev, swipeUp: true }));
              setTimeout(() => setGestures(prev => ({ ...prev, swipeUp: false })), 100);
            }
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return gestures;
};

// Хук для оптимизации производительности на мобильных
export const useMobileOptimization = () => {
  const { isMobile, isTouchDevice } = useMobile();

  // Отключение hover эффектов на touch устройствах
  useEffect(() => {
    if (isTouchDevice) {
      document.body.classList.add('touch-device');
    } else {
      document.body.classList.remove('touch-device');
    }
  }, [isTouchDevice]);

  // Оптимизация для мобильных устройств
  const mobileOptimizations = {
    // Уменьшение анимаций на мобильных
    reducedMotion: isMobile,
    // Отключение некоторых эффектов
    disableEffects: isMobile,
    // Оптимизация изображений
    optimizeImages: isMobile,
    // Уменьшение частоты обновлений
    reducedUpdates: isMobile
  };

  return mobileOptimizations;
}; 