import React, { memo, useMemo, useCallback } from 'react';

// HOC для мемоизации компонентов
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, propsAreEqual);
};

// Компонент для мемоизации списков
interface MemoizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
}

export const MemoizedList = <T extends unknown>({
  items,
  renderItem,
  keyExtractor,
  className
}: MemoizedListProps<T>) => {
  const memoizedItems = useMemo(() => {
    return items.map((item, index) => ({
      item,
      index,
      key: keyExtractor(item, index),
      element: renderItem(item, index)
    }));
  }, [items, renderItem, keyExtractor]);

  return (
    <div className={className}>
      {memoizedItems.map(({ key, element }) => (
        <React.Fragment key={key}>
          {element}
        </React.Fragment>
      ))}
    </div>
  );
};

// Компонент для мемоизации условного рендеринга
interface MemoizedConditionalProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const MemoizedConditional: React.FC<MemoizedConditionalProps> = memo(({
  condition,
  children,
  fallback = null
}) => {
  return condition ? <>{children}</> : <>{fallback}</>;
});

// Хук для мемоизации колбэков
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

// Хук для мемоизации значений
export const useMemoizedValue = <T>(
  value: T,
  deps: React.DependencyList
): T => {
  return useMemo(() => value, deps);
};

// Компонент для мемоизации форм
interface MemoizedFormProps {
  onSubmit: (data: any) => void;
  children: React.ReactNode;
  className?: string;
}

export const MemoizedForm: React.FC<MemoizedFormProps> = memo(({
  onSubmit,
  children,
  className
}) => {
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  }, [onSubmit]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}); 