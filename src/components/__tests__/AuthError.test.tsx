import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthError from '../AuthError';

describe('AuthError', () => {
  it('should not render when no error', () => {
    render(<AuthError error={null} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render error message', () => {
    const errorMessage = 'Test error message';
    render(<AuthError error={errorMessage} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render close button when onClear is provided', () => {
    const onClear = vi.fn();
    render(<AuthError error="Test error" onClear={onClear} />);
    
    const closeButton = screen.getByText('Закрыть');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClear when close button is clicked', () => {
    const onClear = vi.fn();
    render(<AuthError error="Test error" onClear={onClear} />);
    
    const closeButton = screen.getByText('Закрыть');
    closeButton.click();
    
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('should not render close button when onClear is not provided', () => {
    render(<AuthError error="Test error" />);
    
    expect(screen.queryByText('Закрыть')).not.toBeInTheDocument();
  });
}); 