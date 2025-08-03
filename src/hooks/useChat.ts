import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'voice' | 'image' | 'system';
  timestamp: Date;
  read: boolean;
  metadata?: {
    duration?: number; // для голосовых сообщений
    url?: string; // для изображений
    size?: number;
  };
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export const useChat = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Подключение к чату
  const joinChat = useCallback((roomId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('join-chat', { roomId });
    setActiveRoom(roomId);
  }, [socket, isConnected]);

  // Отключение от чата
  const leaveChat = useCallback((roomId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('leave-chat', { roomId });
    if (activeRoom === roomId) {
      setActiveRoom(null);
    }
  }, [socket, isConnected, activeRoom]);

  // Отправка текстового сообщения
  const sendMessage = useCallback((content: string, receiverId: string) => {
    if (!socket || !isConnected || !user) return;

    const message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'> = {
      senderId: user.id,
      receiverId,
      content,
      type: 'text',
    };

    socket.emit('send-message', message);
  }, [socket, isConnected, user]);

  // Отправка голосового сообщения
  const sendVoiceMessage = useCallback(async (receiverId: string) => {
    if (!socket || !isConnected || !user) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'> = {
          senderId: user.id,
          receiverId,
          content: audioUrl,
          type: 'voice',
          metadata: {
            duration: Date.now() - (mediaRecorderRef.current?.startTime || 0),
            size: audioBlob.size,
          },
        };

        socket.emit('send-message', message);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current.startTime = Date.now();
      setIsRecording(true);
    } catch (error) {
      console.error('Ошибка записи голосового сообщения:', error);
    }
  }, [socket, isConnected, user]);

  // Остановка записи голосового сообщения
  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Отправка изображения
  const sendImage = useCallback((file: File, receiverId: string) => {
    if (!socket || !isConnected || !user) return;

    const reader = new FileReader();
    reader.onload = () => {
      const message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'> = {
        senderId: user.id,
        receiverId,
        content: reader.result as string,
        type: 'image',
        metadata: {
          url: reader.result as string,
          size: file.size,
        },
      };

      socket.emit('send-message', message);
    };
    reader.readAsDataURL(file);
  }, [socket, isConnected, user]);

  // Отметить сообщения как прочитанные
  const markMessagesAsRead = useCallback((roomId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('mark-messages-read', { roomId });
  }, [socket, isConnected]);

  // Индикатор печати
  const setTypingStatus = useCallback((isTyping: boolean, receiverId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('typing', { receiverId, isTyping });
  }, [socket, isConnected]);

  // Создание нового чата
  const createChat = useCallback((participantId: string) => {
    if (!socket || !isConnected || !user) return;

    socket.emit('create-chat', { participantId });
  }, [socket, isConnected, user]);

  // Удаление чата
  const deleteChat = useCallback((roomId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('delete-chat', { roomId });
    setChatRooms(prev => prev.filter(room => room.id !== roomId));
  }, [socket, isConnected]);

  // Обработка входящих сообщений
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      
      // Обновляем последнее сообщение в чате
      setChatRooms(prev => prev.map(room => {
        if (room.participants.includes(message.senderId) && room.participants.includes(message.receiverId)) {
          return {
            ...room,
            lastMessage: message,
            unreadCount: room.unreadCount + 1,
            updatedAt: new Date(),
          };
        }
        return room;
      }));
    };

    const handleChatRooms = (rooms: ChatRoom[]) => {
      setChatRooms(rooms);
    };

    const handleMessages = (messages: ChatMessage[]) => {
      setMessages(messages);
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      setIsTyping(prev => ({
        ...prev,
        [data.userId]: data.isTyping,
      }));
    };

    const handleOnlineUsers = (users: ChatUser[]) => {
      setOnlineUsers(users);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('chat-rooms', handleChatRooms);
    socket.on('messages', handleMessages);
    socket.on('typing', handleTyping);
    socket.on('online-users', handleOnlineUsers);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('chat-rooms', handleChatRooms);
      socket.off('messages', handleMessages);
      socket.off('typing', handleTyping);
      socket.off('online-users', handleOnlineUsers);
    };
  }, [socket]);

  // Загрузка чатов при подключении
  useEffect(() => {
    if (isConnected && user) {
      socket?.emit('get-chat-rooms');
      socket?.emit('get-online-users');
    }
  }, [isConnected, user, socket]);

  // Загрузка сообщений при смене активного чата
  useEffect(() => {
    if (activeRoom && socket) {
      socket.emit('get-messages', { roomId: activeRoom });
      markMessagesAsRead(activeRoom);
    }
  }, [activeRoom, socket, markMessagesAsRead]);

  return {
    chatRooms,
    activeRoom,
    messages,
    onlineUsers,
    isTyping,
    isRecording,
    isConnected,
    joinChat,
    leaveChat,
    sendMessage,
    sendVoiceMessage,
    stopVoiceRecording,
    sendImage,
    markMessagesAsRead,
    setTypingStatus,
    createChat,
    deleteChat,
    setActiveRoom,
  };
}; 