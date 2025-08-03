import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  Navigate: ({ to }: { to: string }) => React.createElement('div', { 'data-testid': 'navigate', to }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('should render login form', () => {
    renderLogin();

    expect(screen.getByText('Войти')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    expect(screen.getByText(/нет аккаунта/i)).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should show validation errors for invalid email', async () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/введите корректный email/i)).toBeInTheDocument();
    });
  });

  it('should show validation errors for empty password', async () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/пароль обязателен/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderLogin();

    const submitButton = screen.getByRole('button', { name: /войти/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  it('should show error message on login failure', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/пароль/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should have register link with correct href', () => {
    renderLogin();

    const registerLink = screen.getByText(/зарегистрироваться/i);
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should not show login form if already authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    renderLogin();

    // Если пользователь аутентифицирован, форма не должна отображаться
    expect(screen.queryByText('Войти')).not.toBeInTheDocument();
  });

  it('should toggle password visibility', () => {
    renderLogin();

    const passwordInput = screen.getByLabelText(/пароль/i);
    const toggleButton = screen.getByRole('button', { name: /показать пароль/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /скрыть пароль/i })).toBeInTheDocument();
  });

  it('should clear field errors when user starts typing', () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /войти/i });

    // Сначала вызываем ошибку валидации
    fireEvent.click(submitButton);
    expect(screen.getByText(/email обязателен/i)).toBeInTheDocument();

    // Затем вводим данные и ошибка должна исчезнуть
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(screen.queryByText(/email обязателен/i)).not.toBeInTheDocument();
  });
}); 