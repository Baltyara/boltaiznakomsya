import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuthErrorProps {
  error: string | null;
  onClear?: () => void;
}

const AuthError: React.FC<AuthErrorProps> = ({ error, onClear }) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex justify-between items-center">
        <span>{error}</span>
        {onClear && (
          <button
            onClick={onClear}
            className="text-sm underline hover:no-underline"
          >
            Закрыть
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default AuthError; 