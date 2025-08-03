import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Call from '@/pages/Call';

// Мокаем useAuth
const mockUseAuth = {
  user: { id: 1, name: 'Test User', email: 'test@example.com' },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

// Мокаем useCall
const mockStartSearch = vi.fn();
const mockEndCall = vi.fn();
const mockToggleMute = vi.fn();
const mockToggleSpeaker = vi.fn();
const mockLikePartner = vi.fn();
const mockPassPartner = vi.fn();

const mockUseCall = {
  callState: {
    status: 'idle',
    searchTime: 0,
    duration: 0,
    isMuted: false,
    isSpeakerOn: false,
    partner: null
  },
  startSearch: mockStartSearch,
  endCall: mockEndCall,
  toggleMute: mockToggleMute,
  toggleSpeaker: mockToggleSpeaker,
  likePartner: mockLikePartner,
  passPartner: mockPassPartner
};

// Мокаем useMobile
const mockUseMobile = {
  isMobile: false
};

// Мокаем useNavigate
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

vi.mock('@/contexts/CallContext', () => ({
  useCall: () => mockUseCall
}));

vi.mock('@/hooks/useMobile', () => ({
  useMobile: () => mockUseMobile
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Мокаем MobileCallInterface
vi.mock('@/components/MobileCallInterface', () => ({
  default: () => <div data-testid="mobile-call-interface">Mobile Call Interface</div>
}));

const renderCall = () => {
  return render(
    <BrowserRouter>
      <Call />
    </BrowserRouter>
  );
};

describe('Call Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Сбрасываем состояние к idle
    mockUseCall.callState = {
      status: 'idle',
      searchTime: 0,
      duration: 0,
      isMuted: false,
      isSpeakerOn: false,
      partner: null
    };
  });

  describe('Idle State', () => {
    it('renders idle state correctly', () => {
      renderCall();
      
      expect(screen.getByText('Готовы к звонку?')).toBeInTheDocument();
      expect(screen.getByText('Нажмите кнопку, чтобы найти собеседника для 5-минутного разговора')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /начать поиск/i })).toBeInTheDocument();
    });

    it('calls startSearch when start button is clicked', () => {
      renderCall();
      
      const startButton = screen.getByRole('button', { name: /начать поиск/i });
      fireEvent.click(startButton);
      
      expect(mockStartSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Searching State', () => {
    beforeEach(() => {
      mockUseCall.callState = {
        ...mockUseCall.callState,
        status: 'searching',
        searchTime: 45
      };
    });

    it('renders searching state correctly', () => {
      renderCall();
      
      expect(screen.getByText('Поиск собеседника')).toBeInTheDocument();
      expect(screen.getByText('Подбираем для вас идеального партнера для разговора...')).toBeInTheDocument();
      expect(screen.getByText('Время поиска: 00:45')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /отменить поиск/i })).toBeInTheDocument();
    });

    it('navigates to settings when cancel button is clicked', () => {
      renderCall();
      
      const cancelButton = screen.getByRole('button', { name: /отменить поиск/i });
      fireEvent.click(cancelButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
  });

  describe('Connecting State', () => {
    beforeEach(() => {
      mockUseCall.callState = {
        ...mockUseCall.callState,
        status: 'connecting',
        partner: {
          id: 2,
          name: 'Jane',
          age: 25,
          gender: 'female',
          interests: ['музыка', 'путешествия']
        }
      };
    });

    it('renders connecting state correctly', () => {
      renderCall();
      
      expect(screen.getByText('Подключение...')).toBeInTheDocument();
      expect(screen.getByText('Устанавливаем соединение с Jane')).toBeInTheDocument();
    });

    it('shows correct partner emoji for female', () => {
      renderCall();
      
      const emojiElement = screen.getByText('👩');
      expect(emojiElement).toBeInTheDocument();
    });

    it('shows correct partner emoji for male', () => {
      mockUseCall.callState.partner = {
        ...mockUseCall.callState.partner!,
        gender: 'male'
      };
      
      renderCall();
      
      const emojiElement = screen.getByText('👨');
      expect(emojiElement).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      mockUseCall.callState = {
        ...mockUseCall.callState,
        status: 'error'
      };
    });

    it('renders error state correctly', () => {
      renderCall();
      
      expect(screen.getByText('Ошибка подключения')).toBeInTheDocument();
      expect(screen.getByText('Не удалось установить соединение. Попробуйте еще раз.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /настройки/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /попробовать снова/i })).toBeInTheDocument();
    });

    it('navigates to settings when settings button is clicked', () => {
      renderCall();
      
      const settingsButton = screen.getByRole('button', { name: /настройки/i });
      fireEvent.click(settingsButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    it('calls startSearch when try again button is clicked', () => {
      renderCall();
      
      const tryAgainButton = screen.getByRole('button', { name: /попробовать снова/i });
      fireEvent.click(tryAgainButton);
      
      expect(mockStartSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Connected State', () => {
    beforeEach(() => {
      mockUseCall.callState = {
        ...mockUseCall.callState,
        status: 'connected',
        duration: 125,
        partner: {
          id: 2,
          name: 'Jane',
          age: 25,
          gender: 'female',
          interests: ['музыка', 'путешествия', 'спорт']
        }
      };
    });

    it('renders connected state correctly', () => {
      renderCall();
      
      expect(screen.getByText('Jane, 25')).toBeInTheDocument();
      expect(screen.getByText('02:05')).toBeInTheDocument(); // duration
      expect(screen.getByText('музыка')).toBeInTheDocument();
      expect(screen.getByText('путешествия')).toBeInTheDocument();
      expect(screen.getByText('спорт')).toBeInTheDocument();
    });

    it('handles mute toggle', () => {
      renderCall();
      
      const muteButton = screen.getByRole('button', { name: /отключить микрофон/i });
      fireEvent.click(muteButton);
      
      expect(mockToggleMute).toHaveBeenCalledTimes(1);
    });

    it('handles speaker toggle', () => {
      renderCall();
      
      const speakerButton = screen.getByRole('button', { name: /включить динамик/i });
      fireEvent.click(speakerButton);
      
      expect(mockToggleSpeaker).toHaveBeenCalledTimes(1);
    });

    it('handles end call', () => {
      renderCall();
      
      const endCallButton = screen.getByRole('button', { name: /завершить звонок/i });
      fireEvent.click(endCallButton);
      
      expect(mockEndCall).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/rate');
    });

    it('handles like partner', () => {
      renderCall();
      
      const likeButton = screen.getByRole('button', { name: /нравится/i });
      fireEvent.click(likeButton);
      
      expect(mockLikePartner).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/rate');
    });

    it('handles pass partner', () => {
      renderCall();
      
      const passButton = screen.getByRole('button', { name: /пропустить/i });
      fireEvent.click(passButton);
      
      expect(mockPassPartner).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/rate');
    });

    it('shows muted state correctly', () => {
      mockUseCall.callState.isMuted = true;
      
      renderCall();
      
      const muteButton = screen.getByRole('button', { name: /включить микрофон/i });
      expect(muteButton).toHaveClass('bg-destructive');
    });

    it('shows speaker on state correctly', () => {
      mockUseCall.callState.isSpeakerOn = true;
      
      renderCall();
      
      const speakerButton = screen.getByRole('button', { name: /отключить динамик/i });
      expect(speakerButton).toHaveClass('bg-secondary');
    });
  });

  describe('Mobile Interface', () => {
    beforeEach(() => {
      mockUseMobile.isMobile = true;
    });

    it('renders mobile interface on mobile devices', () => {
      renderCall();
      
      expect(screen.getByTestId('mobile-call-interface')).toBeInTheDocument();
    });

    it('does not render desktop interface on mobile', () => {
      renderCall();
      
      expect(screen.queryByText('Готовы к звонку?')).not.toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    it('formats time correctly for different durations', () => {
      // Тестируем функцию formatTime через различные состояния
      mockUseCall.callState = {
        ...mockUseCall.callState,
        status: 'searching',
        searchTime: 65 // 1:05
      };
      
      renderCall();
      expect(screen.getByText('01:05')).toBeInTheDocument();
      
      mockUseCall.callState = {
        ...mockUseCall.callState,
        status: 'connected',
        duration: 3661 // 1:01:01
      };
      
      renderCall();
      expect(screen.getByText('01:01:01')).toBeInTheDocument();
    });
  });
}); 