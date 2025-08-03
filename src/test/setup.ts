import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

// Mock WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  send: vi.fn(),
  close: vi.fn(),
}));

// Mock Socket.IO
global.io = vi.fn().mockImplementation(() => ({
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  connected: false,
}));

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [
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
      ],
      getAudioTracks: () => [
        {
          kind: 'audio',
          enabled: true,
          stop: vi.fn(),
          getSettings: () => ({ deviceId: 'mock-audio-device' }),
        },
      ],
      getVideoTracks: () => [
        {
          kind: 'video',
          enabled: true,
          stop: vi.fn(),
          getSettings: () => ({ deviceId: 'mock-video-device' }),
        },
      ],
      removeTrack: vi.fn(),
      addTrack: vi.fn(),
    }),
    enumerateDevices: vi.fn().mockResolvedValue([
      { deviceId: 'mock-audio-device', kind: 'audioinput', label: 'Mock Microphone' },
      { deviceId: 'mock-video-device', kind: 'videoinput', label: 'Mock Camera' },
    ]),
  },
  writable: true,
});

// Mock RTCPeerConnection
global.RTCPeerConnection = vi.fn().mockImplementation(() => ({
  addTrack: vi.fn(),
  createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
  createAnswer: vi.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-sdp' }),
  setLocalDescription: vi.fn().mockResolvedValue(undefined),
  setRemoteDescription: vi.fn().mockResolvedValue(undefined),
  addIceCandidate: vi.fn().mockResolvedValue(undefined),
  close: vi.fn(),
  getSenders: vi.fn().mockReturnValue([]),
  onicecandidate: null,
  ontrack: null,
  onconnectionstatechange: null,
  oniceconnectionstatechange: null,
  connectionState: 'new',
  iceConnectionState: 'new',
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query.includes('(max-width: 768px)') || query.includes('(max-width: 1024px)') || query.includes('(display-mode: standalone)'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.navigator.standalone
Object.defineProperty(window.navigator, 'standalone', {
  writable: true,
  value: false,
});

// Mock gtag
global.gtag = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => 
    React.createElement('a', { href: to }, children),
  Navigate: ({ to }: { to: string }) => React.createElement('div', { 'data-testid': 'navigate', to }),
})); 