import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface UseSocketReturn extends SocketState {
  connect: (token?: string) => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string) => void;
}

export const useSocket = (): UseSocketReturn => {
  const { user } = useAuth();
  const [state, setState] = useState<SocketState>({
    socket: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback((token?: string) => {
    if (socketRef.current?.connected) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const authToken = token || localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('No authentication token available');
      }

      const socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:3001', {
        auth: {
          token: authToken,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        setState(prev => ({
          ...prev,
          socket,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        socketRef.current = socket;
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: reason === 'io server disconnect' ? 'Server disconnected' : null,
        }));
        socketRef.current = null;
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: error.message || 'Connection failed',
        }));
        socketRef.current = null;
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({
          ...prev,
          error: error.message || 'WebSocket error',
        }));
      });

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setState(prev => ({
        ...prev,
        socket: null,
        isConnected: false,
        isConnecting: false,
      }));
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  }, []);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (user && !state.isConnected && !state.isConnecting) {
      connect();
    } else if (!user && state.isConnected) {
      disconnect();
    }
  }, [user, state.isConnected, state.isConnecting, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}; 