import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Phone, PhoneOff, Heart, X } from "lucide-react";

const Call = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [searchingForGender] = useState("female"); // This would come from user preferences
  const [partner] = useState({
    name: searchingForGender === "female" ? "Анна" : "Александр",
    age: 24,
    interests: ["Музыка", "Путешествия", "Кино"]
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setCallDuration(0);
    navigate("/rate");
  };

  const handleLike = () => {
    // Handle like logic
    handleEndCall();
  };

  const handlePass = () => {
    // Handle pass logic
    handleEndCall();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="w-32 h-32 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-6xl animate-pulse">
                {searchingForGender === "female" ? "👨" : "👩"}
              </div>
              <div>
                <h2 className="text-2xl font-display bg-gradient-voice bg-clip-text text-transparent mb-2">
                  Поиск собеседника
                </h2>
                <p className="text-muted-foreground">
                  Подбираем для вас идеального партнера для разговора...
                </p>
              </div>
              <Button
                variant="voice"
                size="lg"
                onClick={handleConnect}
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Partner Info */}
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-4xl">
                {searchingForGender === "female" ? "👩" : "👨"}
              </div>
              <div>
                <h2 className="text-xl font-display">{partner.name}, {partner.age}</h2>
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {partner.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Call Duration */}
            <div className="text-2xl font-mono text-primary">
              {formatTime(callDuration)}
            </div>

            {/* Call Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-16 h-16"
                onClick={handleEndCall}
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