import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMobile, useTouchGestures, useMobileOptimization } from '../useMobile';

// Мокируем window.matchMedia
const mockMatchMedia = (query: string) => {
  const matches = 
    query.includes('(max-width: 768px)') ? true :
    query.includes('(max-width: 1024px)') ? false :
    query.includes('(display-mode: standalone)') ? false :
    query.includes('(orientation: landscape)') ? false :
    false;
  
  return {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  };
};

// Мокируем window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(mockMatchMedia)
});

// Мокируем navigator.maxTouchPoints
Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  value: 0,
});

// Мокируем document.body.classList
Object.defineProperty(document.body, 'classList', {
  writable: true,
  value: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
  },
});

describe('useMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia('(max-width: 768px)');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect mobile device', () => {
    // Мокируем мобильное устройство
    mockMatchMedia('(max-width: 768px)');

    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 5,
    });

    const { result } = renderHook(() => useMobile());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouchDevice).toBe(true);
  });

  it('should detect tablet device', () => {
    // Мокируем планшет
    mockMatchMedia('(max-width: 1024px)');

    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 5,
    });

    const { result } = renderHook(() => useMobile());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouchDevice).toBe(true);
  });

  it('should detect desktop device', () => {
    // Мокируем десктоп
    mockMatchMedia('(max-width: 1024px)');

    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 0,
    });

    const { result } = renderHook(() => useMobile());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTouchDevice).toBe(false);
  });

  it('should detect touch device', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 5,
    });

    const { result } = renderHook(() => useMobile());

    expect(result.current.isTouchDevice).toBe(true);
  });

  it('should update on window resize', () => {
    const { result } = renderHook(() => useMobile());

    const initialWidth = result.current.screenWidth;

    // Симулируем изменение размера окна
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.screenWidth).toBe(800);
  });

  it('should update on orientation change', () => {
    const { result } = renderHook(() => useMobile());

    // Симулируем изменение ориентации
    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 800,
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 600,
      });
      window.dispatchEvent(new Event('orientationchange'));
    });

    expect(result.current.orientation).toBe('landscape');
  });
});

describe('useTouchGestures', () => {
  it('should detect touch gestures', () => {
    const { result } = renderHook(() => useTouchGestures());

    expect(result.current.swipeLeft).toBeDefined();
    expect(result.current.swipeRight).toBeDefined();
    expect(result.current.swipeUp).toBeDefined();
    expect(result.current.swipeDown).toBeDefined();
    expect(result.current.pinch).toBeDefined();
    expect(result.current.longPress).toBeDefined();
  });
});

describe('useMobileOptimization', () => {
  it('should return mobile optimization settings', () => {
    const { result } = renderHook(() => useMobileOptimization());

    expect(result.current.reducedMotion).toBeDefined();
    expect(result.current.disableEffects).toBeDefined();
    expect(result.current.optimizeImages).toBeDefined();
    expect(result.current.reducedUpdates).toBeDefined();
  });

  it('should add touch-device class for touch devices', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 5,
    });

    renderHook(() => useMobileOptimization());

    expect(document.body.classList.add).toHaveBeenCalledWith('touch-device');
  });

  it('should remove touch-device class for non-touch devices', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 0,
    });

    renderHook(() => useMobileOptimization());

    expect(document.body.classList.remove).toHaveBeenCalledWith('touch-device');
  });
}); 