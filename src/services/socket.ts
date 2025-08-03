import { io, Socket } from 'socket.io-client';

interface SocketEvents {
  'join-queue': (userData: any) => void;
  'leave-queue': () => void;
  'call-signal': (data: any) => void;
  'end-call': (data: any) => void;
  'match-found': (matchData: any) => void;
  'call-ended': (data: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://188.225.45.8';
    
    this.socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });
  }

  connect(token?: string) {
    if (this.socket && !this.isConnected) {
      if (token) {
        this.socket.auth = { token };
      }
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  emit<T extends keyof SocketEvents>(event: T, data?: Parameters<SocketEvents[T]>[0]) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  on<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]) {
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off<T extends keyof SocketEvents>(event: T, callback?: SocketEvents[T]) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Matchmaking methods
  joinQueue(userData: {
    lookingFor: string;
    ageRange?: { min: number; max: number };
    interests: string[];
  }) {
    this.emit('join-queue', userData);
  }

  leaveQueue() {
    this.emit('leave-queue');
  }

  // Call methods
  sendCallSignal(data: {
    targetId: string;
    type: 'offer' | 'answer' | 'ice-candidate';
    payload: any;
  }) {
    this.emit('call-signal', data);
  }

  endCall(data: {
    callId: string;
    duration: number;
    reason: 'user-ended' | 'timeout' | 'error';
  }) {
    this.emit('end-call', data);
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

export const socketService = new SocketService();
export default socketService; 