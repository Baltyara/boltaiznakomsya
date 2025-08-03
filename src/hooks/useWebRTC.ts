import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';

interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

interface UseWebRTCReturn extends WebRTCState {
  startCall: (partnerId: string) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  switchCamera: () => void;
  setAudioInput: (deviceId: string) => Promise<void>;
  setVideoInput: (deviceId: string) => Promise<void>;
}

export const useWebRTC = (): UseWebRTCReturn => {
  const { socket, emit, on, off } = useSocket();
  const [state, setState] = useState<WebRTCState>({
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  });

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const isMutedRef = useRef(false);
  const isVideoEnabledRef = useRef(true);

  const createPeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emit('ice-candidate', {
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setState(prev => ({
        ...prev,
        remoteStream: event.streams[0],
      }));
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setState(prev => ({
        ...prev,
        isConnected: pc.connectionState === 'connected',
        isConnecting: pc.connectionState === 'connecting',
      }));
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        setState(prev => ({
          ...prev,
          error: 'ICE connection failed',
        }));
      }
    };

    return pc;
  }, [emit]);

  const getMediaStream = useCallback(async (constraints: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      console.error('Failed to get media stream:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }, []);

  const startCall = useCallback(async (partnerId: string) => {
    try {
      setState(prev => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));

      // Get local media stream
      const stream = await getMediaStream({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      localStreamRef.current = stream;
      setState(prev => ({ ...prev, localStream: stream }));

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      setState(prev => ({ ...prev, peerConnection: pc }));

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      emit('call-offer', {
        partnerId,
        offer,
      });

    } catch (error) {
      console.error('Failed to start call:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to start call',
      }));
    }
  }, [getMediaStream, createPeerConnection, emit]);

  const endCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setState(prev => ({
      ...prev,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isConnecting: false,
      isConnected: false,
    }));

    emit('end-call');
  }, [emit]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        isMutedRef.current = !audioTrack.enabled;
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        isVideoEnabledRef.current = videoTrack.enabled;
      }
    }
  }, []);

  const switchCamera = useCallback(async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length > 1) {
          const currentDeviceId = videoTrack.getSettings().deviceId;
          const nextDevice = videoDevices.find(device => device.deviceId !== currentDeviceId) || videoDevices[0];
          
          const newStream = await getMediaStream({
            audio: true,
            video: {
              deviceId: { exact: nextDevice.deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });

          // Replace video track
          const newVideoTrack = newStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
          if (sender && newVideoTrack) {
            sender.replaceTrack(newVideoTrack);
          }

          // Update local stream
          const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
          localStreamRef.current.removeTrack(oldVideoTrack);
          localStreamRef.current.addTrack(newVideoTrack);
          oldVideoTrack.stop();

          setState(prev => ({ ...prev, localStream: localStreamRef.current }));
        }
      }
    }
  }, [getMediaStream]);

  const setAudioInput = useCallback(async (deviceId: string) => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const newStream = await getMediaStream({
          audio: { deviceId: { exact: deviceId } },
          video: false,
        });

        const newAudioTrack = newStream.getAudioTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'audio');
        if (sender && newAudioTrack) {
          sender.replaceTrack(newAudioTrack);
        }

        localStreamRef.current.removeTrack(audioTrack);
        localStreamRef.current.addTrack(newAudioTrack);
        audioTrack.stop();
        newStream.getVideoTracks().forEach(track => track.stop());

        setState(prev => ({ ...prev, localStream: localStreamRef.current }));
      }
    }
  }, [getMediaStream]);

  const setVideoInput = useCallback(async (deviceId: string) => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const newStream = await getMediaStream({
          audio: false,
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        const newVideoTrack = newStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
        if (sender && newVideoTrack) {
          sender.replaceTrack(newVideoTrack);
        }

        localStreamRef.current.removeTrack(videoTrack);
        localStreamRef.current.addTrack(newVideoTrack);
        videoTrack.stop();
        newStream.getAudioTracks().forEach(track => track.stop());

        setState(prev => ({ ...prev, localStream: localStreamRef.current }));
      }
    }
  }, [getMediaStream]);

  // Handle WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    const handleCallOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
      try {
        const pc = createPeerConnection();
        peerConnectionRef.current = pc;
        setState(prev => ({ ...prev, peerConnection: pc }));

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        emit('call-answer', { answer });
      } catch (error) {
        console.error('Failed to handle call offer:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to accept call',
        }));
      }
    };

    const handleCallAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      } catch (error) {
        console.error('Failed to handle call answer:', error);
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (error) {
        console.error('Failed to add ICE candidate:', error);
      }
    };

    on('call-offer', handleCallOffer);
    on('call-answer', handleCallAnswer);
    on('ice-candidate', handleIceCandidate);

    return () => {
      off('call-offer');
      off('call-answer');
      off('ice-candidate');
    };
  }, [socket, createPeerConnection, emit, on, off]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    ...state,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    setAudioInput,
    setVideoInput,
  };
}; 