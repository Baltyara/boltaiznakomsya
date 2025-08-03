import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from '@/pages/Settings';

// Мокаем useAuth
const mockUpdateProfile = vi.fn();
const mockLogout = vi.fn();
const mockUseAuth = {
  user: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    age: 25,
    aboutMe: 'Test bio',
    location: 'Moscow',
    interests: ['Музыка', 'Спорт']
  },
  updateProfile: mockUpdateProfile,
  logout: mockLogout,
  login: vi.fn(),
  register: vi.fn(),
  loading: false
};

// Мокаем useNavigate
const mockNavigate = vi.fn();

// Мокаем confirm
const mockConfirm = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  Navigate: ({ to }: { to: string }) => React.createElement('div', { 'data-testid': 'navigate', to }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
}));

// Мокаем window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm
});

const renderSettings = () => {
  return render(
    <BrowserRouter>
      <Settings />
    </BrowserRouter>
  );
};

describe('Settings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings page correctly', () => {
    renderSettings();
    
    expect(screen.getByText('Настройки')).toBeInTheDocument();
    expect(screen.getByText('Профиль')).toBeInTheDocument();
    expect(screen.getByText('Уведомления')).toBeInTheDocument();
    expect(screen.getByText('Интересы')).toBeInTheDocument();
  });

  it('displays user profile data', () => {
    renderSettings();
    
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Moscow')).toBeInTheDocument();
  });

  it('handles profile field changes', () => {
    renderSettings();
    
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    
    expect(nameInput).toHaveValue('New Name');
  });

  it('handles notification toggle', () => {
    renderSettings();
    
    const newMatchesSwitch = screen.getByLabelText('Новые совпадения');
    fireEvent.click(newMatchesSwitch);
    
    expect(newMatchesSwitch).not.toBeChecked();
  });

  it('handles interest toggle', () => {
    renderSettings();
    
    // Проверяем, что текущие интересы отмечены
    const musicInterest = screen.getByText('Музыка');
    expect(musicInterest).toHaveClass('bg-voice-primary');
    
    // Убираем интерес
    fireEvent.click(musicInterest);
    expect(musicInterest).not.toHaveClass('bg-voice-primary');
    
    // Добавляем новый интерес
    const cinemaInterest = screen.getByText('Кино');
    fireEvent.click(cinemaInterest);
    expect(cinemaInterest).toHaveClass('bg-voice-primary');
  });

  it('handles successful save', async () => {
    mockUpdateProfile.mockResolvedValueOnce(undefined);
    
    renderSettings();
    
    // Сначала нужно внести изменения, чтобы кнопка стала активной
    const nameInput = screen.getByLabelText('Имя');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    const saveButton = screen.getByRole('button', { name: /сохранить изменения/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        name: 'Updated Name',
        email: 'test@example.com',
        age: 25,
        aboutMe: 'Test bio',
        location: 'Moscow',
        interests: ['Музыка', 'Спорт']
      });
    });
  });

  it('handles save error', async () => {
    const errorMessage = 'Ошибка сохранения';
    mockUpdateProfile.mockRejectedValueOnce(new Error(errorMessage));
    
    renderSettings();
    
    // Сначала нужно внести изменения, чтобы кнопка стала активной
    const nameInput = screen.getByLabelText('Имя');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    const saveButton = screen.getByRole('button', { name: /сохранить изменения/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/ошибка сохранения/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during save', async () => {
    mockUpdateProfile.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderSettings();
    
    // Сначала нужно внести изменения, чтобы кнопка стала активной
    const nameInput = screen.getByLabelText('Имя');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    const saveButton = screen.getByRole('button', { name: /сохранить изменения/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /сохранение.../i });
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveTextContent(/сохранение.../i);
    });
  });

  it('handles logout', () => {
    renderSettings();
    
    const logoutButton = screen.getByRole('button', { name: /выйти/i });
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles delete account with confirmation', () => {
    mockConfirm.mockReturnValueOnce(true);
    
    renderSettings();
    
    const deleteButton = screen.getByRole('button', { name: /удалить аккаунт/i });
    fireEvent.click(deleteButton);
    
    expect(mockConfirm).toHaveBeenCalledWith('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.');
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('does not delete account when confirmation is cancelled', () => {
    mockConfirm.mockReturnValueOnce(false);
    
    renderSettings();
    
    const deleteButton = screen.getByRole('button', { name: /удалить аккаунт/i });
    fireEvent.click(deleteButton);
    
    expect(mockConfirm).toHaveBeenCalled();
    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith('/');
  });

  it('navigates back when back button is clicked', () => {
    renderSettings();
    
    const backButton = screen.getByRole('button', { name: /назад/i });
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/call');
  });

  it('shows save button as disabled when no changes', () => {
    renderSettings();
    
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when changes are made', () => {
    renderSettings();
    
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    expect(saveButton).not.toBeDisabled();
  });

  it('validates age input', () => {
    renderSettings();
    
    const ageInput = screen.getByDisplayValue('25') as HTMLInputElement;
    expect(ageInput.min).toBe('18');
    expect(ageInput.max).toBe('100');
  });

  it('handles email validation', () => {
    renderSettings();
    
    const emailInput = screen.getByDisplayValue('test@example.com') as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  it('renders all available interests', () => {
    renderSettings();
    
    const expectedInterests = [
      'Музыка', 'Спорт', 'Путешествия', 'Кино', 'Книги', 
      'Кулинария', 'Технологии', 'Искусство', 'Танцы', 'Фотография',
      'Игры', 'Йога', 'Фитнес', 'Природа', 'Наука', 'История',
      'Психология', 'Мода', 'Автомобили', 'Животные'
    ];
    
    expectedInterests.forEach(interest => {
      expect(screen.getByText(interest)).toBeInTheDocument();
    });
  });

  it('syncs with user data changes', () => {
    const newUser = {
      ...mockUseAuth.user,
      name: 'Updated User',
      age: 30
    };
    
    // Рендерим с новыми данными пользователя
    mockUseAuth.user = newUser;
    
    renderSettings();
    
    expect(screen.getByDisplayValue('Updated User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  });

  it('handles empty user data gracefully', () => {
    mockUseAuth.user = null;
    
    renderSettings();
    
    // Проверяем, что компонент не падает с пустыми данными
    expect(screen.getByText('Настройки')).toBeInTheDocument();
  });
});