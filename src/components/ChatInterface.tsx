import React, { useState, useRef, useEffect } from 'react';
import { useChat, ChatMessage, ChatRoom } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { 
  Send, 
  Mic, 
  MicOff, 
  Image, 
  MoreVertical,
  ArrowLeft,
  Phone,
  Video,
  Search,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const {
    chatRooms,
    activeRoom,
    messages,
    isTyping,
    isRecording,
    joinChat,
    leaveChat,
    sendMessage,
    sendVoiceMessage,
    stopVoiceRecording,
    sendImage,
    deleteChat,
    setActiveRoom,
  } = useChat();

  const [message, setMessage] = useState('');
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Обработка отправки сообщения
  const handleSendMessage = () => {
    if (!message.trim() || !activeRoom) return;

    const room = chatRooms.find(r => r.id === activeRoom);
    if (!room) return;

    const receiverId = room.participants.find(id => id !== user?.id);
    if (!receiverId) return;

    sendMessage(message, receiverId);
    setMessage('');
  };

  // Обработка отправки изображения
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeRoom) return;

    const room = chatRooms.find(r => r.id === activeRoom);
    if (!room) return;

    const receiverId = room.participants.find(id => id !== user?.id);
    if (!receiverId) return;

    sendImage(file, receiverId);
    event.target.value = '';
  };

  // Обработка голосового сообщения
  const handleVoiceMessage = () => {
    if (!activeRoom) return;

    const room = chatRooms.find(r => r.id === activeRoom);
    if (!room) return;

    const receiverId = room.participants.find(id => id !== user?.id);
    if (!receiverId) return;

    if (isRecording) {
      stopVoiceRecording();
    } else {
      sendVoiceMessage(receiverId);
    }
  };

  // Форматирование времени
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Получение имени собеседника
  const getChatPartnerName = (room: ChatRoom) => {
    const partnerId = room.participants.find(id => id !== user?.id);
    // В реальном приложении здесь был бы запрос к API для получения имени
    return `Пользователь ${partnerId?.slice(-4)}`;
  };

  // Рендер сообщения
  const renderMessage = (msg: ChatMessage) => {
    const isOwn = msg.senderId === user?.id;

    return (
      <div
        key={msg.id}
        className={cn(
          "flex mb-4",
          isOwn ? "justify-end" : "justify-start"
        )}
      >
        <div className={cn(
          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}>
          {msg.type === 'text' && (
            <p className="text-sm">{msg.content}</p>
          )}
          
          {msg.type === 'voice' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const audio = new Audio(msg.content);
                  audio.play();
                }}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <span className="text-xs">
                {Math.round((msg.metadata?.duration || 0) / 1000)}с
              </span>
            </div>
          )}
          
          {msg.type === 'image' && (
            <img
              src={msg.content}
              alt="Изображение"
              className="max-w-full h-auto rounded"
              loading="lazy"
            />
          )}
          
          <div className={cn(
            "text-xs mt-1",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {formatTime(msg.timestamp)}
            {isOwn && (
              <span className="ml-2">
                {msg.read ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isMobile && !showChatList && !activeRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Выберите чат для начала общения</p>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex", className)}>
      {/* Список чатов */}
      {(!isMobile || showChatList) && (
        <Card className={cn(
          "w-80 border-r-0 rounded-r-none",
          isMobile && "w-full"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Чаты</CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="space-y-1">
              {chatRooms.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>Нет активных чатов</p>
                </div>
              ) : (
                chatRooms.map((room) => (
                  <div
                    key={room.id}
                    className={cn(
                      "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                      activeRoom === room.id && "bg-muted"
                    )}
                    onClick={() => {
                      joinChat(room.id);
                      if (isMobile) setShowChatList(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {getChatPartnerName(room).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {getChatPartnerName(room)}
                          </p>
                          {room.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                              {room.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        {room.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {room.lastMessage.type === 'voice' ? '🎤 Голосовое сообщение' : room.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Окно чата */}
      {activeRoom && (!isMobile || !showChatList) && (
        <Card className="flex-1 flex flex-col border-l-0 rounded-l-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowChatList(true)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {getChatPartnerName(chatRooms.find(r => r.id === activeRoom)!)?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <p className="font-medium">
                    {getChatPartnerName(chatRooms.find(r => r.id === activeRoom)!)}
                  </p>
                  {isTyping[activeRoom] && (
                    <p className="text-xs text-muted-foreground">печатает...</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => deleteChat(activeRoom)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить чат
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col">
            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Начните общение</p>
                </div>
              ) : (
                messages.map(renderMessage)
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Поле ввода */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Введите сообщение..."
                  className="flex-1"
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVoiceMessage}
                  className={cn(isRecording && "text-red-500")}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatInterface; 