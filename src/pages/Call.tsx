import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Phone, PhoneOff, Heart, X, Loader2, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCall } from "@/contexts/CallContext";
import { useMobile } from "@/hooks/useMobile";
import MobileCallInterface from "@/components/MobileCallInterface";

const Call = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const { 
    callState, 
    startSearch, 
    endCall, 
    toggleMute, 
    toggleSpeaker, 
    likePartner, 
    passPartner 
  } = useCall();

  // Показываем мобильный интерфейс на мобильных устройствах
  if (isMobile) {
    return <MobileCallInterface />;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    endCall();
    navigate("/rate");
  };

  const handleLike = () => {
    likePartner();
    navigate("/rate");
  };

  const handlePass = () => {
    passPartner();
    navigate("/rate");
  };

  // Initial state - start search
  if (callState.status === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-voice-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-voice-border">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="w-32 h-32 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-6xl animate-voice-pulse">
                🎤
              </div>
              <div>
                <h2 className="text-2xl font-display bg-gradient-voice bg-clip-text text-transparent mb-2">
                  Готовы к звонку?
                </h2>
                <p className="text-muted-foreground">
                  Нажмите кнопку, чтобы найти собеседника для 5-минутного разговора
                </p>
              </div>
              <Button
                variant="voice"
                size="lg"
                onClick={startSearch}
                className="w-full"
              >
                <Phone className="mr-2 h-4 w-4" />
                Начать поиск
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Searching state
  if (callState.status === 'searching') {
    return (
      <div className="min-h-screen bg-gradient-voice-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-voice-border">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="w-32 h-32 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-6xl animate-voice-pulse">
                🎤
              </div>
              <div>
                <h2 className="text-2xl font-display bg-gradient-voice bg-clip-text text-transparent mb-2">
                  Поиск собеседника
                </h2>
                <p className="text-muted-foreground mb-2">
                  Подбираем для вас идеального партнера для разговора...
                </p>
                <p className="text-sm text-muted-foreground">
                  Время поиска: {formatTime(callState.searchTime)}
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-voice-primary" />
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/settings")}
                className="w-full"
              >
                Отменить поиск
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connecting state
  if (callState.status === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-voice-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-voice-border">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="w-32 h-32 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-6xl animate-voice-pulse">
                {callState.partner?.gender === "female" ? "👩" : "👨"}
              </div>
              <div>
                <h2 className="text-2xl font-display bg-gradient-voice bg-clip-text text-transparent mb-2">
                  Подключение...
                </h2>
                <p className="text-muted-foreground">
                  Устанавливаем соединение с {callState.partner?.name}
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-voice-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (callState.status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-voice-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-voice-border">
          <CardContent className="pt-6">
            <div className="space-y-6 text-center">
              <div className="w-32 h-32 mx-auto bg-red-500 rounded-full flex items-center justify-center text-6xl">
                ❌
              </div>
              <div>
                <h2 className="text-2xl font-display text-red-500 mb-2">
                  Ошибка подключения
                </h2>
                <p className="text-muted-foreground">
                  Не удалось установить соединение. Попробуйте еще раз.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/settings")}
                  className="flex-1"
                >
                  Настройки
                </Button>
                <Button
                  variant="voice"
                  onClick={startSearch}
                  className="flex-1"
                >
                  Попробовать снова
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connected state
  return (
    <div className="min-h-screen bg-gradient-voice-subtle flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-voice-border">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Partner Info */}
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-4xl animate-voice-pulse">
                {callState.partner?.gender === "female" ? "👩" : "👨"}
              </div>
              <div>
                <h2 className="text-xl font-display">
                  {callState.partner?.name}, {callState.partner?.age}
                </h2>
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {callState.partner?.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Call Duration */}
            <div className="text-3xl font-mono text-voice-primary font-bold">
              {formatTime(callState.duration)}
            </div>

            {/* Call Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant={callState.isMuted ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={toggleMute}
                aria-label={callState.isMuted ? "Включить микрофон" : "Отключить микрофон"}
              >
                {callState.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={callState.isSpeakerOn ? "secondary" : "outline"}
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={toggleSpeaker}
                aria-label={callState.isSpeakerOn ? "Отключить динамик" : "Включить динамик"}
              >
                {callState.isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-16 h-16"
                onClick={handleEndCall}
                aria-label="Завершить звонок"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handlePass}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Пропустить
              </Button>
              <Button
                variant="voice"
                onClick={handleLike}
                className="flex-1"
              >
                <Heart className="mr-2 h-4 w-4" />
                Нравится
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Call;