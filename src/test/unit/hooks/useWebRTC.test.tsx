import { renderHook, act } from '@testing-library/react';
import { useWebRTC } from '@/hooks/useWebRTC';

// Mock useSocket
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};
vi.mock('@/hooks/useSocket', () => ({
  useSocket: () => mockSocket,
}));

// Mock WebRTC APIs
const mockRTCPeerConnection = vi.fn();
const mockGetUserMedia = vi.fn();
const mockMediaStream = {
  getTracks: vi.fn().mockReturnValue([
    {
      kind: 'audio',
      enabled: true,
      stop: vi.fn(),
      getSettings: () => ({ deviceId: 'mock-audio-device' }),
    },
    {
      kind: 'video',
      enabled: true,
      stop: vi.fn(),
      getSettings: () => ({ deviceId: 'mock-video-device' }),
    },
  ]),
  getVideoTracks: vi.fn().mockReturnValue([
    {
      kind: 'video',
      enabled: true,
      stop: vi.fn(),
      getSettings: () => ({ deviceId: 'mock-video-device' }),
    },
  ]),
  getAudioTracks: vi.fn().mockReturnValue([
    {
      kind: 'audio',
      enabled: true,
      stop: vi.fn(),
      getSettings: () => ({ deviceId: 'mock-audio-device' }),
    },
  ]),
  removeTrack: vi.fn(),
  addTrack: vi.fn(),
};

// Mock RTCPeerConnection methods
const mockPeerConnection = {
  addTrack: vi.fn(),
  removeTrack: vi.fn(),
  createOffer: vi.fn(),
  createAnswer: vi.fn(),
  setLocalDescription: vi.fn(),
  setRemoteDescription: vi.fn(),
  addIceCandidate: vi.fn(),
  close: vi.fn(),
  onicecandidate: null,
  oniceconnectionstatechange: null,
  onconnectionstatechange: null,
  ontrack: null,
  iceConnectionState: 'new',
  connectionState: 'new',
  localDescription: null,
  remoteDescription: null,
};

mockRTCPeerConnection.mockReturnValue(mockPeerConnection);

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock RTCPeerConnection
Object.defineProperty(window, 'RTCPeerConnection', {
  value: mockRTCPeerConnection,
  writable: true,
});

describe('useWebRTC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserMedia.mockResolvedValue(mockMediaStream);
    mockPeerConnection.createOffer.mockResolvedValue({ type: 'offer', sdp: 'test-sdp' });
    mockPeerConnection.createAnswer.mockResolvedValue({ type: 'answer', sdp: 'test-sdp' });
    mockPeerConnection.setLocalDescription.mockResolvedValue();
    mockPeerConnection.setRemoteDescription.mockResolvedValue();
    mockPeerConnection.addIceCandidate.mockResolvedValue();
  });

  it('возвращает WebRTC функции и состояние', () => {
    const { result } = renderHook(() => useWebRTC());

    expect(result.current).toHaveProperty('localStream');
    expect(result.current).toHaveProperty('remoteStream');
    expect(result.current).toHaveProperty('peerConnection');
    expect(result.current).toHaveProperty('isConnecting');
    expect(result.current).toHaveProperty('isConnected');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('startCall');
    expect(result.current).toHaveProperty('endCall');
    expect(result.current).toHaveProperty('toggleMute');
    expect(result.current).toHaveProperty('toggleVideo');
    expect(result.current).toHaveProperty('switchCamera');
    expect(result.current).toHaveProperty('setAudioInput');
    expect(result.current).toHaveProperty('setVideoInput');
  });

  it('начинает звонок', async () => {
    const { result } = renderHook(() => useWebRTC());

    await act(async () => {
      await result.current.startCall('partner-123');
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    expect(mockRTCPeerConnection).toHaveBeenCalled();
    expect(mockSocket.emit).toHaveBeenCalledWith('call-offer', {
      partnerId: 'partner-123',
      offer: { type: 'offer', sdp: 'test-sdp' },
    });
  });

  it('завершает звонок', () => {
    const { result } = renderHook(() => useWebRTC());

    act(() => {
      result.current.endCall();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('end-call');
  });

  it('переключает микрофон', () => {
    const { result } = renderHook(() => useWebRTC());

    act(() => {
      result.current.toggleMute();
    });

    // Проверяем, что функция вызывается без ошибок
    expect(result.current.toggleMute).toBeDefined();
  });

  it('переключает видео', () => {
    const { result } = renderHook(() => useWebRTC());

    act(() => {
      result.current.toggleVideo();
    });

    // Проверяем, что функция вызывается без ошибок
    expect(result.current.toggleVideo).toBeDefined();
  });
}); 