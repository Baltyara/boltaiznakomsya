import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  children, 
  fallback = <DefaultFallback /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Lazy loaded components
export const LazyCall = lazy(() => import('../pages/Call'));
export const LazyRate = lazy(() => import('../pages/Rate'));
export const LazySettings = lazy(() => import('../pages/Settings'));
export const LazyOnboarding = lazy(() => import('../pages/Onboarding'));

export default LazyLoader; 