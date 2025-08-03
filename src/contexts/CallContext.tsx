import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import socketService from '@/services/socket';
import apiService from '@/services/api';

interface CallPartner {
  id: string;
  name: string;
  age: number;
  interests: string[];
  gender: string;
}

interface CallState {
  status: 'idle' | 'searching' | 'connecting' | 'connected' | 'ended' | 'error';
  duration: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  partner?: CallPartner;
  searchTime: number;
}

interface CallContextType {
  callState: CallState;
  startSearch: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  likePartner: () => void;
  passPartner: () => void;
  resetCall: () => void;
  joinQueue: (userData: any) => Promise<void>;
  leaveQueue: () => Promise<void>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

interface CallProviderProps {
  children: ReactNode;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    duration: 0,
    isMuted: false,
    isSpeakerOn: true,
    searchTime: 0
  });

  // WebSocket event handlers
  useEffect(() => {
    // Handle match found
    socketService.on('match-found', (matchData) => {
      console.log('Match found:', matchData);
      setCallState(prev => ({
        ...prev,
        status: 'connecting',
        partner: matchData.partner
      }));
    });

    // Handle call ended
    socketService.on('call-ended', (data) => {
      console.log('Call ended:', data);
      // Вместо вызова endCall() напрямую, обновляем состояние
      setCallState(prev => ({ ...prev, status: 'ended' }));
    });

    // Cleanup on unmount
    return () => {
      socketService.off('match-found');
      socketService.off('call-ended');
    };
  }, []);

  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const searchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock partner data
  const getMockPartner = (): CallPartner => {
    const mockPartners = [
      { id: '1', name: "Анна", age: 24, interests: ["Музыка", "Путешествия", "Кино"], gender: "female" },
      { id: '2', name: "Мария", age: 26, interests: ["Книги", "Искусство", "Йога"], gender: "female" },
      { id: '3', name: "Елена", age: 23, interests: ["Спорт", "Кулинария", "Фотография"], gender: "female" },
      { id: '4', name: "Александр", age: 25, interests: ["Технологии", "Игры", "Спорт"], gender: "male" },
      { id: '5', name: "Дмитрий", age: 27, interests: ["Музыка", "Наука", "История"], gender: "male" }
    ];
    return mockPartners[Math.floor(Math.random() * mockPartners.length)];
  };

  const initializeWebRTC = async (): Promise<boolean> => {
    try {
      // Check if WebRTC is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('WebRTC is not supported in this browser');
        return false;
      }

      // Check if we're on HTTPS (required for WebRTC)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.error('WebRTC requires HTTPS connection');
        return false;
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      streamRef.current = stream;

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = peerConnection;

      // Add local stream
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle incoming stream (mock)
      peerConnection.ontrack = (event) => {
        console.log('Received remote stream:', event.streams[0]);
      };

      return true;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          console.error('Microphone access denied by user');
        } else if (error.name === 'NotFoundError') {
          console.error('No microphone found');
        } else if (error.name === 'NotSupportedError') {
          console.error('WebRTC not supported');
        }
      }
      
      return false;
    }
  };

  const startSearch = async () => {
    setCallState(prev => ({ 
      ...prev, 
      status: 'searching',
      searchTime: 0,
      duration: 0
    }));

    // Start search timer
    searchIntervalRef.current = setInterval(() => {
      setCallState(prev => ({ ...prev, searchTime: prev.searchTime + 1 }));
    }, 1000);

    // Simulate search time
    setTimeout(async () => {
      const success = await initializeWebRTC();
      if (success) {
        setCallState(prev => ({ 
          ...prev, 
          status: 'connecting',
          partner: getMockPartner()
        }));
        
        // Simulate connection time
        setTimeout(() => {
          setCallState(prev => ({ ...prev, status: 'connected' }));
          startDurationTimer();
        }, 2000);
      } else {
        // Fallback: simulate call without WebRTC
        console.log('WebRTC not available, using fallback mode');
        setCallState(prev => ({ 
          ...prev, 
          status: 'connecting',
          partner: getMockPartner()
        }));
        
        // Simulate connection time
        setTimeout(() => {
          setCallState(prev => ({ ...prev, status: 'connected' }));
          startDurationTimer();
        }, 2000);
      }
      
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current);
      }
    }, 3000 + Math.random() * 2000); // 3-5 seconds
  };

  const startDurationTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
  };

  const endCall = () => {
    // Cleanup WebRTC
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear timers
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (searchIntervalRef.current) {
      clearInterval(searchIntervalRef.current);
    }

    setCallState(prev => ({ ...prev, status: 'ended' }));
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
      }
    }
  };

  const toggleSpeaker = () => {
    setCallState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
  };

  const likePartner = () => {
    // TODO: Send like to backend
    console.log('Liked partner:', callState.partner);
    endCall();
  };

  const passPartner = () => {
    // TODO: Send pass to backend
    console.log('Passed partner:', callState.partner);
    endCall();
  };

  const resetCall = () => {
    // Clear timers
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (searchIntervalRef.current) {
      clearInterval(searchIntervalRef.current);
    }

    setCallState({
      status: 'idle',
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
      searchTime: 0
    });
  };

  const joinQueue = async (userData: any) => {
    try {
      // Join queue via API
      await apiService.joinQueue(userData);
      // Join queue via WebSocket
      socketService.joinQueue(userData);
    } catch (error) {
      console.error('Error joining queue:', error);
    }
  };

  const leaveQueue = async () => {
    try {
      // Leave queue via API
      await apiService.leaveQueue();
      // Leave queue via WebSocket
      socketService.leaveQueue();
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  const value: CallContextType = {
    callState,
    startSearch,
    endCall,
    toggleMute,
    toggleSpeaker,
    likePartner,
    passPartner,
    resetCall,
    joinQueue,
    leaveQueue
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
}; 