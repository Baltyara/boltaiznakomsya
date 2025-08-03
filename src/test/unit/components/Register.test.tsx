import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '@/pages/Register';

// Мокаем useAuth
const mockRegister = vi.fn();
const mockUseAuth = {
  register: mockRegister,
  login: vi.fn(),
  logout: vi.fn(),
  user: null,
  loading: false
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

// Мокаем useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  Navigate: ({ to }: { to: string }) => React.createElement('div', { 'data-testid': 'navigate', to }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
}));

// Мокаем SocialLogin компонент
vi.mock('@/components/SocialLogin', () => ({
  default: ({ mode }: { mode: string }) => <div data-testid="social-login" data-mode={mode}>Social Login</div>
}));

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form', () => {
    renderRegister();
    
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
    expect(screen.getByLabelText('Подтвердите пароль')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument();
  });

  it('shows validation errors for empty form submission', async () => {
    renderRegister();
    
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email обязателен')).toBeInTheDocument();
      expect(screen.getByText('Пароль обязателен')).toBeInTheDocument();
      expect(screen.getByText('Подтвердите пароль')).toBeInTheDocument();
      expect(screen.getByText('Необходимо согласие с условиями')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderRegister();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Пароль');
    const confirmPasswordInput = screen.getByLabelText('Подтвердите пароль');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox'));
    
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Введите корректный email')).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    renderRegister();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Пароль');
    const confirmPasswordInput = screen.getByLabelText('Подтвердите пароль');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    fireEvent.click(screen.getByRole('checkbox'));
    
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Пароль должен содержать минимум 6 символов')).toBeInTheDocument();
    });
  });

  it('shows validation error for mismatched passwords', async () => {
    renderRegister();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Пароль');
    const confirmPasswordInput = screen.getByLabelText('Подтвердите пароль');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('checkbox'));
    
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderRegister();
    
    const passwordInput = screen.getByLabelText('Пароль') as HTMLInputElement;
    const toggleButton = passwordInput.parentElement?.querySelector('button');
    
    expect(passwordInput.type).toBe('password');
    
    fireEvent.click(toggleButton!);
    expect(passwordInput.type).toBe('text');
    
    fireEvent.click(toggleButton!);
    expect(passwordInput.type).toBe('password');
  });

  it('toggles confirm password visibility', () => {
    renderRegister();
    
    const confirmPasswordInput = screen.getByLabelText('Подтвердите пароль') as HTMLInputElement;
    const toggleButton = confirmPasswordInput.parentElement?.querySelector('button');
    
    expect(confirmPasswordInput.type).toBe('password');
    
    fireEvent.click(toggleButton!);
    expect(confirmPasswordInput.type).toBe('text');
    
    fireEvent.click(toggleButton!);
    expect(confirmPasswordInput.type).toBe('password');
  });

  it('handles successful registration', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    
    renderRegister();
    
    // Заполняем форму
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Подтвердите пароль'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox'));
    
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('handles registration error', async () => {
    const errorMessage = 'Email уже используется';
    mockRegister.mockRejectedValueOnce(new Error(errorMessage));
    
    renderRegister();
    
    // Заполняем форму
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Подтвердите пароль'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox'));
    
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state during registration', async () => {
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderRegister();
    
    // Заполняем форму
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Подтвердите пароль'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox'));
    
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Регистрация...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Регистрация...' })).toBeDisabled();
    });
  });

  it('clears field errors when user starts typing', async () => {
    renderRegister();
    
    const submitButton = screen.getByRole('button', { name: 'Зарегистрироваться' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email обязателен')).toBeInTheDocument();
    });
    
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Email обязателен')).not.toBeInTheDocument();
    });
  });

  it('renders social login component', () => {
    renderRegister();
    
    const socialLogin = screen.getByTestId('social-login');
    expect(socialLogin).toBeInTheDocument();
    expect(socialLogin).toHaveAttribute('data-mode', 'register');
  });

  it('renders login link', () => {
    renderRegister();
    
    const loginLink = screen.getByText('Войти');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('renders terms and privacy links', () => {
    renderRegister();
    
    const termsLink = screen.getByText('условиями использования');
    const privacyLink = screen.getByText('политикой конфиденциальности');
    
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
  });
});