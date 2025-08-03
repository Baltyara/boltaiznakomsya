import React, { useState, useEffect } from 'react';
import { useCall } from '@/contexts/CallContext';
import { useMobile, useTouchGestures } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Heart,
  X,
  RotateCcw,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileCallInterfaceProps {
  className?: string;
}

const MobileCallInterface: React.FC<MobileCallInterfaceProps> = ({ className }) => {
  const { isMobile, orientation } = useMobile();
  const gestures = useTouchGestures();
  const { 
    callState, 
    startSearch, 
    endCall, 
    toggleMute, 
    toggleSpeaker,
    likePartner,
    passPartner,
    resetCall
  } = useCall();

  const [isExpanded, setIsExpanded] = useState(false);

  // Если не мобильное устройство, не показываем
  if (!isMobile) return null;

  // Обработка жестов
  useEffect(() => {
    if (gestures.swipeLeft) {
      passPartner();
    }
    if (gestures.swipeRight) {
      likePartner();
    }
    if (gestures.swipeUp) {
      setIsExpanded(true);
    }
    if (gestures.swipeDown) {
      setIsExpanded(false);
    }
  }, [gestures]); // Убрал зависимости likePartner и passPartner

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (callState.status) {
      case 'idle':
        return 'Готов к звонку';
      case 'searching':
        return 'Поиск собеседника...';
      case 'connecting':
        return 'Подключение...';
      case 'connected':
        return 'Разговор';
      case 'ended':
        return 'Звонок завершен';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-40 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
      className
    )}>
      {/* Статус бар */}
      <div className="absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-sm p-4">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-lg font-semibold">Болтай</h1>
            <p className="text-sm opacity-80">{getStatusText()}</p>
          </div>
          {callState.status === 'connected' && (
            <div className="text-white text-right">
              <div className="text-2xl font-mono">{formatTime(callState.searchTime)}</div>
              <div className="text-xs opacity-80">Время разговора</div>
            </div>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex flex-col justify-center items-center h-full px-6">
        {/* Аватар собеседника */}
        <div className="relative mb-8">
          <div className={cn(
            "w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center",
            callState.status === 'connected' && "animate-pulse"
          )}>
            <Phone className="h-12 w-12 text-white" />
          </div>
          
          {/* Индикатор статуса */}
          <div className={cn(
            "absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-background",
            callState.status === 'searching' && "bg-yellow-500 animate-pulse",
            callState.status === 'connecting' && "bg-blue-500 animate-pulse",
            callState.status === 'connected' && "bg-green-500",
            callState.status === 'ended' && "bg-red-500"
          )} />
        </div>

        {/* Информация о собеседнике */}
        {callState.partner && (
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">
              {callState.partner.name}
            </h2>
            <p className="text-white/80">
              {callState.partner.age} лет • {callState.partner.interests.slice(0, 2).join(', ')}
            </p>
          </div>
        )}

        {/* Кнопки управления */}
        <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
          {/* Основные кнопки */}
          <div className="flex justify-center space-x-8">
            {/* Кнопка микрофона */}
            <Button
              onClick={toggleMute}
              size="lg"
              variant={callState.isMuted ? "destructive" : "default"}
              className="w-16 h-16 rounded-full"
            >
              {callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {/* Кнопка завершения */}
            <Button
              onClick={endCall}
              size="lg"
              variant="destructive"
              className="w-16 h-16 rounded-full"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            {/* Кнопка динамика */}
            <Button
              onClick={toggleSpeaker}
              size="lg"
              variant={callState.isSpeakerOn ? "default" : "secondary"}
              className="w-16 h-16 rounded-full"
            >
              {callState.isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </Button>
          </div>

          {/* Кнопки действий */}
          {callState.status === 'connected' && (
            <div className="flex justify-center space-x-6">
              <Button
                onClick={passPartner}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Пропустить</span>
              </Button>
              
              <Button
                onClick={likePartner}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Heart className="h-4 w-4" />
                <span>Нравится</span>
              </Button>
            </div>
          )}

          {/* Кнопка поиска */}
          {(callState.status === 'idle' || callState.status === 'ended' || callState.status === 'error') && (
            <Button
              onClick={startSearch}
              size="lg"
              className="w-full h-14 text-lg font-semibold"
            >
              <Phone className="h-5 w-5 mr-2" />
              Начать поиск
            </Button>
          )}

          {/* Кнопка сброса */}
          {callState.status === 'ended' && (
            <Button
              onClick={resetCall}
              size="lg"
              className="w-full h-14 text-lg font-semibold"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Новый звонок
            </Button>
          )}
        </div>
      </div>

      {/* Расширенное меню */}
      {isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm rounded-t-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Дополнительно</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12">
              <Settings className="h-4 w-4 mr-2" />
              Настройки
            </Button>
            <Button variant="outline" className="h-12">
              <Heart className="h-4 w-4 mr-2" />
              Избранное
            </Button>
          </div>
        </div>
      )}

      {/* Индикатор жестов */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-xs">
        Свайп влево/вправо для действий
      </div>
    </div>
  );
};

export default MobileCallInterface; 