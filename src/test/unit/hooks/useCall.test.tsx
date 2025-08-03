import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCall } from '@/contexts/CallContext';

// Мокаем CallContext
const mockStartSearch = vi.fn();
const mockEndCall = vi.fn();
const mockToggleMute = vi.fn();
const mockToggleSpeaker = vi.fn();
const mockLikePartner = vi.fn();
const mockPassPartner = vi.fn();
const mockResetCall = vi.fn();
const mockJoinQueue = vi.fn();
const mockLeaveQueue = vi.fn();

const mockCallState = {
  status: 'idle' as const,
  searchTime: 0,
  duration: 0,
  isMuted: false,
  isSpeakerOn: false,
  partner: null
};

const mockCallContext = {
  callState: mockCallState,
  startSearch: mockStartSearch,
  endCall: mockEndCall,
  toggleMute: mockToggleMute,
  toggleSpeaker: mockToggleSpeaker,
  likePartner: mockLikePartner,
  passPartner: mockPassPartner,
  resetCall: mockResetCall,
  joinQueue: mockJoinQueue,
  leaveQueue: mockLeaveQueue
};

vi.mock('@/contexts/CallContext', () => ({
  useCall: () => mockCallContext
}));

describe('useCall Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Сбрасываем состояние
    mockCallState.status = 'idle';
    mockCallState.searchTime = 0;
    mockCallState.duration = 0;
    mockCallState.isMuted = false;
    mockCallState.isSpeakerOn = false;
    mockCallState.partner = null;
  });

  it('returns call state and functions', () => {
    const { result } = renderHook(() => useCall());
    
    expect(result.current).toHaveProperty('callState');
    expect(result.current).toHaveProperty('startSearch');
    expect(result.current).toHaveProperty('endCall');
    expect(result.current).toHaveProperty('toggleMute');
    expect(result.current).toHaveProperty('toggleSpeaker');
    expect(result.current).toHaveProperty('likePartner');
    expect(result.current).toHaveProperty('passPartner');
    expect(result.current).toHaveProperty('resetCall');
    expect(result.current).toHaveProperty('joinQueue');
    expect(result.current).toHaveProperty('leaveQueue');
  });

  it('returns initial idle state', () => {
    const { result } = renderHook(() => useCall());
    
    expect(result.current.callState.status).toBe('idle');
    expect(result.current.callState.searchTime).toBe(0);
    expect(result.current.callState.duration).toBe(0);
    expect(result.current.callState.isMuted).toBe(false);
    expect(result.current.callState.isSpeakerOn).toBe(false);
    expect(result.current.callState.partner).toBe(null);
  });

  it('calls startSearch function', () => {
    const { result } = renderHook(() => useCall());
    
    act(() => {
      result.current.startSearch();
    });
    
    expect(mockStartSearch).toHaveBeenCalledTimes(1);
  });

  it('calls endCall function', () => {
    const { result } = renderHook(() => useCall());
    
    act(() => {
      result.current.endCall();
    });
    
    expect(mockEndCall).toHaveBeenCalledTimes(1);
  });

  it('calls toggleMute function', () => {
    const { result } = renderHook(() => useCall());
    
    act(() => {
      result.current.toggleMute();
    });
    
    expect(mockToggleMute).toHaveBeenCalledTimes(1);
  });

  it('calls toggleSpeaker function', () => {
    const { result } = renderHook(() => useCall());
    
    act(() => {
      result.current.toggleSpeaker();
    });
    
    expect(mockToggleSpeaker).toHaveBeenCalledTimes(1);
  });

  it('calls likePartner function', () => {
    const { result } = renderHook(() => useCall());
    
    act(() => {
      result.current.likePartner();
    });
    
    expect(mockLikePartner).toHaveBeenCalledTimes(1);
  });

  it('calls passPartner function', () => {
    const { result } = renderHook(() => useCall());
    
    act(() => {
      result.current.passPartner();
    });
    
    expect(mockPassPartner).toHaveBeenCalledTimes(1);
  });

  it('calls resetCall function', () => {
    const { result } = renderHook(() => useCall());
    
    act(() => {
      result.current.resetCall();
    });
    
    expect(mockResetCall).toHaveBeenCalledTimes(1);
  });

  it('calls joinQueue function', async () => {
    const { result } = renderHook(() => useCall());
    const userData = { id: '1', name: 'Test User' };
    
    await act(async () => {
      await result.current.joinQueue(userData);
    });
    
    expect(mockJoinQueue).toHaveBeenCalledWith(userData);
  });

  it('calls leaveQueue function', async () => {
    const { result } = renderHook(() => useCall());
    
    await act(async () => {
      await result.current.leaveQueue();
    });
    
    expect(mockLeaveQueue).toHaveBeenCalledTimes(1);
  });

  it('reflects searching state', () => {
    mockCallState.status = 'searching';
    mockCallState.searchTime = 45;
    
    const { result } = renderHook(() => useCall());
    
    expect(result.current.callState.status).toBe('searching');
    expect(result.current.callState.searchTime).toBe(45);
  });

  it('reflects connecting state with partner', () => {
    const mockPartner = {
      id: 2,
      name: 'Jane',
      age: 25,
      gender: 'female',
      interests: ['музыка', 'путешествия']
    };
    
    mockCallState.status = 'connecting';
    mockCallState.partner = mockPartner;
    
    const { result } = renderHook(() => useCall());
    
    expect(result.current.callState.status).toBe('connecting');
    expect(result.current.callState.partner).toEqual(mockPartner);
  });

  it('reflects connected state with duration', () => {
    mockCallState.status = 'connected';
    mockCallState.duration = 125;
    mockCallState.isMuted = true;
    mockCallState.isSpeakerOn = true;
    
    const { result } = renderHook(() => useCall());
    
    expect(result.current.callState.status).toBe('connected');
    expect(result.current.callState.duration).toBe(125);
    expect(result.current.callState.isMuted).toBe(true);
    expect(result.current.callState.isSpeakerOn).toBe(true);
  });

  it('reflects error state', () => {
    mockCallState.status = 'error';
    
    const { result } = renderHook(() => useCall());
    
    expect(result.current.callState.status).toBe('error');
  });

  it('handles multiple function calls', () => {
    const { result } = renderHook(() => useCall());
    
    act(() => {
      result.current.startSearch();
      result.current.toggleMute();
      result.current.toggleSpeaker();
    });
    
    expect(mockStartSearch).toHaveBeenCalledTimes(1);
    expect(mockToggleMute).toHaveBeenCalledTimes(1);
    expect(mockToggleSpeaker).toHaveBeenCalledTimes(1);
  });

  it('maintains function references between renders', () => {
    const { result, rerender } = renderHook(() => useCall());
    
    const firstStartSearch = result.current.startSearch;
    const firstEndCall = result.current.endCall;
    
    rerender();
    
    expect(result.current.startSearch).toBe(firstStartSearch);
    expect(result.current.endCall).toBe(firstEndCall);
  });

  it('handles partner data updates', () => {
    const initialPartner = {
      id: 2,
      name: 'Jane',
      age: 25,
      gender: 'female',
      interests: ['музыка']
    };
    
    mockCallState.status = 'connected';
    mockCallState.partner = initialPartner;
    
    const { result } = renderHook(() => useCall());
    
    expect(result.current.callState.partner).toEqual(initialPartner);
    
    // Обновляем партнера
    const updatedPartner = {
      ...initialPartner,
      interests: ['музыка', 'спорт']
    };
    
    mockCallState.partner = updatedPartner;
    
    // Перерендериваем хук
    const { result: result2 } = renderHook(() => useCall());
    
    expect(result2.current.callState.partner).toEqual(updatedPartner);
  });

  it('handles state transitions', () => {
    const { result } = renderHook(() => useCall());
    
    // Начинаем с idle
    expect(result.current.callState.status).toBe('idle');
    
    // Переходим в searching
    mockCallState.status = 'searching';
    const { result: result2 } = renderHook(() => useCall());
    expect(result2.current.callState.status).toBe('searching');
    
    // Переходим в connecting
    mockCallState.status = 'connecting';
    const { result: result3 } = renderHook(() => useCall());
    expect(result3.current.callState.status).toBe('connecting');
    
    // Переходим в connected
    mockCallState.status = 'connected';
    const { result: result4 } = renderHook(() => useCall());
    expect(result4.current.callState.status).toBe('connected');
  });

  it('handles mute and speaker state changes', () => {
    const { result } = renderHook(() => useCall());
    
    // Начальное состояние
    expect(result.current.callState.isMuted).toBe(false);
    expect(result.current.callState.isSpeakerOn).toBe(false);
    
    // Включаем mute
    mockCallState.isMuted = true;
    const { result: result2 } = renderHook(() => useCall());
    expect(result2.current.callState.isMuted).toBe(true);
    
    // Включаем speaker
    mockCallState.isSpeakerOn = true;
    const { result: result3 } = renderHook(() => useCall());
    expect(result3.current.callState.isSpeakerOn).toBe(true);
  });
}); 