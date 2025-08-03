import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileNavigation from '../MobileNavigation';

// Мокируем useMobile хук
vi.mock('../../../hooks/use-mobile', () => ({
  useMobile: vi.fn()
}));

// Мокируем react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/call' })
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MobileNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Мокируем useMobile для мобильного устройства
    const { useMobile } = require('../../../hooks/useMobile');
    useMobile.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouchDevice: true,
      screenWidth: 375,
      screenHeight: 667,
      orientation: 'portrait'
    });
  });

  it('should render navigation items', () => {
    renderWithRouter(<MobileNavigation />);

    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Звонки')).toBeInTheDocument();
    expect(screen.getByText('Оценки')).toBeInTheDocument();
    expect(screen.getByText('Ещё')).toBeInTheDocument();
  });

  it('should not render when not on mobile device', () => {
    const { useMobile } = require('../../../hooks/useMobile');
    useMobile.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isTouchDevice: false,
      screenWidth: 1024,
      screenHeight: 768,
      orientation: 'landscape'
    });

    const { container } = renderWithRouter(<MobileNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it('should open menu when menu button is clicked', () => {
    renderWithRouter(<MobileNavigation />);

    // Используем getAllByText и берем первый элемент (кнопка меню)
    const menuButtons = screen.getAllByText('Ещё');
    const menuButton = menuButtons[1]; // Второй элемент - кнопка меню
    fireEvent.click(menuButton);

    // Проверяем, что меню открылось
    expect(screen.getByText('Настройки')).toBeInTheDocument();
    expect(screen.getByText('Профиль')).toBeInTheDocument();
    expect(screen.getByText('Выйти')).toBeInTheDocument();
  });

  it('should close menu when close button is clicked', () => {
    renderWithRouter(<MobileNavigation />);

    // Открываем меню
    const menuButtons = screen.getAllByText('Ещё');
    const menuButton = menuButtons[1];
    fireEvent.click(menuButton);

    // Проверяем, что меню открылось
    expect(screen.getByText('Настройки')).toBeInTheDocument();

    // Закрываем меню
    const closeButton = screen.getByRole('button', { name: /закрыть/i });
    fireEvent.click(closeButton);

    // Проверяем, что меню закрылось
    expect(screen.queryByText('Настройки')).not.toBeInTheDocument();
  });

  it('should navigate when navigation item is clicked', () => {
    renderWithRouter(<MobileNavigation />);

    const звонкиButton = screen.getByText('Звонки');
    fireEvent.click(звонкиButton);

    expect(mockNavigate).toHaveBeenCalledWith('/call');
  });

  it('should close menu when navigation item is clicked', () => {
    renderWithRouter(<MobileNavigation />);

    // Открываем меню
    const menuButtons = screen.getAllByText('Ещё');
    const menuButton = menuButtons[1];
    fireEvent.click(menuButton);

    // Проверяем, что меню открылось
    expect(screen.getByText('Настройки')).toBeInTheDocument();

    // Кликаем на элемент навигации
    const settingsButton = screen.getByText('Настройки');
    fireEvent.click(settingsButton);

    // Проверяем, что меню закрылось
    expect(screen.queryByText('Настройки')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/advanced');
  });
}); 