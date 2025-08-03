import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Onboarding from '@/pages/Onboarding';

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

const renderOnboarding = () => {
  return render(
    <BrowserRouter>
      <Onboarding />
    </BrowserRouter>
  );
};

describe('Onboarding Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome step correctly', () => {
    renderOnboarding();
    
    expect(screen.getByText('Добро пожаловать!')).toBeInTheDocument();
    expect(screen.getByText('Давайте настроим ваш профиль для лучших знакомств')).toBeInTheDocument();
    expect(screen.getByText('Болтай и Знакомься - это уникальная платформа для знакомств через голосовое общение')).toBeInTheDocument();
    expect(screen.getByText('• 5-минутные голосовые звонки')).toBeInTheDocument();
    expect(screen.getByText('• Подбор по интересам')).toBeInTheDocument();
    expect(screen.getByText('• Безопасно и анонимно')).toBeInTheDocument();
  });

  it('shows progress indicator', () => {
    renderOnboarding();
    
    expect(screen.getByText('1 из 6')).toBeInTheDocument();
  });

  it('navigates to next step when next button is clicked', () => {
    renderOnboarding();
    
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Как вас зовут?')).toBeInTheDocument();
    expect(screen.getByText('2 из 6')).toBeInTheDocument();
  });

  it('navigates back to previous step', () => {
    renderOnboarding();
    
    // Переходим на второй шаг
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton);
    
    // Возвращаемся назад
    const backButton = screen.getByRole('button', { name: /назад/i });
    fireEvent.click(backButton);
    
    expect(screen.getByText('Добро пожаловать!')).toBeInTheDocument();
    expect(screen.getByText('1 из 6')).toBeInTheDocument();
  });

  it('handles name input correctly', () => {
    renderOnboarding();
    
    // Переходим на шаг с именем
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton);
    
    const nameInput = screen.getByPlaceholderText('Введите ваше имя');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    
    expect(nameInput).toHaveValue('John');
  });

  it('enables next button when name is valid', () => {
    renderOnboarding();
    
    // Переходим на шаг с именем
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton);
    
    const nameInput = screen.getByPlaceholderText('Введите ваше имя');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    
    const nextButtonOnNameStep = screen.getByRole('button', { name: /далее/i });
    expect(nextButtonOnNameStep).not.toBeDisabled();
  });

  it('disables next button when name is too short', () => {
    renderOnboarding();
    
    // Переходим на шаг с именем
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton);
    
    const nameInput = screen.getByPlaceholderText('Введите ваше имя');
    fireEvent.change(nameInput, { target: { value: 'J' } });
    
    const nextButtonOnNameStep = screen.getByRole('button', { name: /далее/i });
    expect(nextButtonOnNameStep).toBeDisabled();
  });

  it('handles age selection', () => {
    renderOnboarding();
    
    // Переходим на шаг с возрастом
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton); // name step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // age step
    
    expect(screen.getByText('Ваш возраст')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument(); // default age
    expect(screen.getByText('лет')).toBeInTheDocument();
  });

  it('handles gender selection', () => {
    renderOnboarding();
    
    // Переходим на шаг с полом
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton); // name step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // age step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // gender step
    
    expect(screen.getByText('Ваш пол')).toBeInTheDocument();
    
    const maleRadio = screen.getByLabelText('Мужской');
    fireEvent.click(maleRadio);
    expect(maleRadio).toBeChecked();
  });

  it('handles looking for selection', () => {
    renderOnboarding();
    
    // Переходим на шаг "кого ищете"
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton); // name step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // age step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // gender step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // looking for step
    
    expect(screen.getByText('Кого вы ищете?')).toBeInTheDocument();
    
    const womenRadio = screen.getByLabelText('Женщин');
    fireEvent.click(womenRadio);
    expect(womenRadio).toBeChecked();
  });

  it('handles interests selection', () => {
    renderOnboarding();
    
    // Переходим на шаг с интересами
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton); // name step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // age step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // gender step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // looking for step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // interests step
    
    expect(screen.getByText('Ваши интересы')).toBeInTheDocument();
    
    const musicInterest = screen.getByText('Музыка');
    fireEvent.click(musicInterest);
    expect(musicInterest).toHaveClass('bg-voice-primary');
  });

  it('handles location input', () => {
    renderOnboarding();
    
    // Переходим на шаг с местоположением
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton); // name step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // age step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // gender step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // looking for step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // interests step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // location step
    
    expect(screen.getByText('Где вы находитесь?')).toBeInTheDocument();
    
    const locationInput = screen.getByPlaceholderText('Введите ваш город');
    fireEvent.change(locationInput, { target: { value: 'Moscow' } });
    expect(locationInput).toHaveValue('Moscow');
  });

  it('handles about me input', () => {
    renderOnboarding();
    
    // Переходим на последний шаг
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton); // name step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // age step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // gender step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // looking for step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // interests step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // location step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // about me step
    
    expect(screen.getByText('Расскажите о себе')).toBeInTheDocument();
    
    const aboutMeTextarea = screen.getByPlaceholderText('Расскажите немного о себе...');
    fireEvent.change(aboutMeTextarea, { target: { value: 'I love music and travel' } });
    expect(aboutMeTextarea).toHaveValue('I love music and travel');
  });

  it('shows loading state during completion', async () => {
    renderOnboarding();
    
    // Заполняем все шаги и переходим к завершению
    const nextButton = screen.getByRole('button', { name: /далее/i });
    
    // Проходим все шаги
    for (let i = 0; i < 5; i++) {
      fireEvent.click(nextButton);
    }
    
    // На последнем шаге заполняем данные
    const nameInput = screen.getByPlaceholderText('Введите ваше имя');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    
    const completeButton = screen.getByRole('button', { name: /завершить/i });
    fireEvent.click(completeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Завершение...')).toBeInTheDocument();
    });
  });

  it('handles skip functionality', () => {
    renderOnboarding();
    
    const skipButton = screen.getByRole('button', { name: /пропустить/i });
    fireEvent.click(skipButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/call');
  });

  it('validates required fields on each step', () => {
    renderOnboarding();
    
    // Переходим на шаг с именем
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton);
    
    // Пытаемся перейти дальше без ввода имени
    const nextButtonOnNameStep = screen.getByRole('button', { name: /далее/i });
    expect(nextButtonOnNameStep).toBeDisabled();
  });

  it('shows correct step numbers', () => {
    renderOnboarding();
    
    expect(screen.getByText('1 из 6')).toBeInTheDocument();
    
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton);
    
    expect(screen.getByText('2 из 6')).toBeInTheDocument();
  });

  it('renders all available interests', () => {
    renderOnboarding();
    
    // Переходим на шаг с интересами
    const nextButton = screen.getByRole('button', { name: /далее/i });
    fireEvent.click(nextButton); // name step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // age step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // gender step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // looking for step
    fireEvent.click(screen.getByRole('button', { name: /далее/i })); // interests step
    
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
});