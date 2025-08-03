import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthError from './AuthError';

const GlobalAuthError: React.FC = () => {
  const { error, clearError } = useAuth();

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <AuthError error={error} onClear={clearError} />
    </div>
  );
};

export default GlobalAuthError; 