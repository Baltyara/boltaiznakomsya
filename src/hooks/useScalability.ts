import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface CacheConfig {
  maxSize: number;
  ttl: number; // время жизни в миллисекундах
  strategy: 'lru' | 'fifo' | 'lfu';
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  size: number;
}

export interface LoadBalancer {
  servers: string[];
  strategy: 'round-robin' | 'least-connections' | 'random' | 'weighted';
  healthCheck: boolean;
}

export interface VirtualScrollConfig {
  itemHeight: number;
  bufferSize: number;
  overscan: number;
}

export interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  apiResponseTime: number;
  errorRate: number;
  activeConnections: number;
  cacheHitRate: number;
}

class AdvancedCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private config: CacheConfig;
  private currentSize = 0;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  set(key: string, data: T): void {
    const size = this.calculateSize(data);
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      size,
    };

    // Проверка лимита размера
    while (this.currentSize + size > this.config.maxSize && this.cache.size > 0) {
      this.evict();
    }

    if (this.cache.has(key)) {
      this.currentSize -= this.cache.get(key)!.size;
    }

    this.cache.set(key, item);
    this.currentSize += size;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Проверка TTL
    if (Date.now() - item.timestamp > this.config.ttl) {
      this.delete(key);
      return null;
    }

    // Обновление статистики доступа
    item.accessCount++;
    item.timestamp = Date.now();

    return item.data;
  }

  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    this.currentSize -= item.size;
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  private evict(): void {
    let keyToEvict: string | null = null;

    switch (this.config.strategy) {
      case 'lru':
        keyToEvict = this.findLRU();
        break;
      case 'lfu':
        keyToEvict = this.findLFU();
        break;
      case 'fifo':
        keyToEvict = this.cache.keys().next().value;
        break;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
    }
  }

  private findLRU(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private findLFU(): string | null {
    let leastUsedKey: string | null = null;
    let minAccessCount = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < minAccessCount) {
        minAccessCount = item.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  private calculateSize(data: T): number {
    return JSON.stringify(data).length;
  }

  getStats() {
    const totalRequests = Array.from(this.cache.values()).reduce(
      (sum, item) => sum + item.accessCount,
      0
    );
    const hits = totalRequests;
    
    return {
      size: this.cache.size,
      memoryUsage: this.currentSize,
      hitRate: hits / (hits + 1), // упрощенная формула
      items: this.cache.size,
    };
  }
}

export const useScalability = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    apiResponseTime: 0,
    errorRate: 0,
    activeConnections: 0,
    cacheHitRate: 0,
  });

  const cacheRef = useRef(new AdvancedCache({
    maxSize: 10 * 1024 * 1024, // 10MB
    ttl: 5 * 60 * 1000, // 5 минут
    strategy: 'lru',
  }));

  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const connectionPoolRef = useRef(new Map<string, WebSocket>());

  // Виртуальный скролл для больших списков
  const useVirtualScroll = useCallback((
    items: any[],
    config: VirtualScrollConfig
  ) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const visibleStart = Math.max(0, 
      Math.floor(scrollTop / config.itemHeight) - config.overscan
    );
    const visibleEnd = Math.min(items.length,
      Math.ceil((scrollTop + containerHeight) / config.itemHeight) + config.overscan
    );

    const visibleItems = items.slice(visibleStart, visibleEnd).map((item, index) => ({
      ...item,
      index: visibleStart + index,
      top: (visibleStart + index) * config.itemHeight,
    }));

    return {
      visibleItems,
      totalHeight: items.length * config.itemHeight,
      setScrollTop,
      setContainerHeight,
    };
  }, []);

  // Продвинутое кеширование
  const useCache = useCallback(() => {
    const cache = cacheRef.current;

    return {
      set: <T>(key: string, data: T) => cache.set(key, data),
      get: <T>(key: string): T | null => cache.get(key) as T | null,
      delete: (key: string) => cache.delete(key),
      clear: () => cache.clear(),
      stats: () => cache.getStats(),
    };
  }, []);

  // Пул соединений
  const useConnectionPool = useCallback(() => {
    const pool = connectionPoolRef.current;

    const getConnection = (url: string): WebSocket | null => {
      if (pool.has(url)) {
        const connection = pool.get(url)!;
        if (connection.readyState === WebSocket.OPEN) {
          return connection;
        } else {
          pool.delete(url);
        }
      }

      try {
        const ws = new WebSocket(url);
        pool.set(url, ws);
        
        ws.onclose = () => pool.delete(url);
        ws.onerror = () => pool.delete(url);
        
        return ws;
      } catch {
        return null;
      }
    };

    const closeAll = () => {
      for (const [url, ws] of pool.entries()) {
        ws.close();
        pool.delete(url);
      }
    };

    return { getConnection, closeAll, activeCount: pool.size };
  }, []);

  // Батчинг запросов
  const useBatchedRequests = useCallback(() => {
    const batchRef = useRef<{ requests: any[]; timer: NodeJS.Timeout | null }>({
      requests: [],
      timer: null,
    });

    const addRequest = (request: any) => {
      batchRef.current.requests.push(request);

      if (batchRef.current.timer) {
        clearTimeout(batchRef.current.timer);
      }

      batchRef.current.timer = setTimeout(async () => {
        const requests = [...batchRef.current.requests];
        batchRef.current.requests = [];

        if (requests.length > 0) {
          try {
            await fetch('/api/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ requests }),
            });
          } catch (error) {
            console.error('Batch request failed:', error);
          }
        }
      }, 100); // Батчинг каждые 100мс
    };

    return { addRequest };
  }, []);

  // Дебаунсинг для поиска
  const useDebouncedSearch = useCallback((
    searchFn: (query: string) => Promise<any>,
    delay: number = 300
  ) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (searchQuery.trim()) {
        setIsLoading(true);
        timeoutRef.current = setTimeout(async () => {
          try {
            const searchResults = await searchFn(searchQuery);
            setResults(searchResults);
          } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
          } finally {
            setIsLoading(false);
          }
        }, delay);
      } else {
        setResults([]);
        setIsLoading(false);
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [searchQuery, searchFn, delay]);

    return { searchQuery, setSearchQuery, results, isLoading };
  }, []);

  // Мониторинг производительности
  const startPerformanceMonitoring = useCallback(() => {
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          if (entry.entryType === 'measure') {
            setMetrics(prev => ({
              ...prev,
              renderTime: entry.duration,
            }));
          }
          
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              apiResponseTime: navEntry.responseEnd - navEntry.responseStart,
            }));
          }
        }
      });

      performanceObserverRef.current.observe({ 
        entryTypes: ['measure', 'navigation', 'resource'] 
      });
    }

    // Мониторинг памяти
    const memoryMonitor = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
        }));
      }
    }, 5000);

    return () => {
      clearInterval(memoryMonitor);
      performanceObserverRef.current?.disconnect();
    };
  }, []);

  // Lazy loading изображений
  const useLazyImages = useCallback(() => {
    const [imageObserver] = useState(() => {
      if ('IntersectionObserver' in window) {
        return new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;
              if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            }
          });
        });
      }
      return null;
    });

    const observeImage = (img: HTMLImageElement) => {
      imageObserver?.observe(img);
    };

    return { observeImage };
  }, []);

  // Оптимизация ререндеров
  const useOptimizedRender = useCallback((dependencies: any[]) => {
    const memoizedValue = useMemo(() => {
      return { timestamp: Date.now(), deps: dependencies };
    }, dependencies);

    return memoizedValue;
  }, []);

  // Предварительная загрузка ресурсов
  const useResourcePreloading = useCallback(() => {
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      });
    };

    const preloadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.onload = () => resolve();
        script.onerror = reject;
        script.src = src;
        document.head.appendChild(script);
      });
    };

    return { preloadImage, preloadScript };
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    const cleanup = startPerformanceMonitoring();
    
    return () => {
      cleanup();
      connectionPoolRef.current.clear();
      cacheRef.current.clear();
    };
  }, [startPerformanceMonitoring]);

  return {
    metrics,
    useVirtualScroll,
    useCache,
    useConnectionPool,
    useBatchedRequests,
    useDebouncedSearch,
    useLazyImages,
    useOptimizedRender,
    useResourcePreloading,
    startPerformanceMonitoring,
  };
}; 