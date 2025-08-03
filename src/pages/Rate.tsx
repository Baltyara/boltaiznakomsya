import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, X, Loader2, MessageCircle } from "lucide-react";

interface RatingData {
  rating: number;
  feedback: string;
  action: 'like' | 'pass' | 'skip';
  partnerId?: string;
}

const Rate = () => {
  const navigate = useNavigate();
  const [ratingData, setRatingData] = useState<RatingData>({
    rating: 0,
    feedback: "",
    action: 'skip'
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Mock partner data (in real app, this would come from call context)
  const partner = {
    name: "Анна",
    age: 24,
    interests: ["Музыка", "Путешествия", "Кино"],
    gender: "female"
  };

  const handleRatingChange = (newRating: number) => {
    setRatingData(prev => ({ ...prev, rating: newRating }));
  };

  const handleFeedbackChange = (feedback: string) => {
    setRatingData(prev => ({ ...prev, feedback }));
  };

  const handleAction = (action: 'like' | 'pass') => {
    setRatingData(prev => ({ ...prev, action }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Send rating to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Rating submitted:", ratingData);
      setSubmitted(true);
      
      // Navigate to next call after a short delay
      setTimeout(() => {
        navigate("/call");
      }, 2000);
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate("/call");
  };

  const handleNewCall = () => {
    navigate("/call");
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Очень плохо";
      case 2: return "Плохо";
      case 3: return "Нормально";
      case 4: return "Хорошо";
      case 5: return "Отлично!";
      default: return "Оцените разговор";
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'like': return "🔥 Ещё раз";
      case 'pass': return "❌ Пропустить";
      default: return "Пропустить";
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-voice-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-voice-border">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-4xl animate-voice-pulse">
                ✨
              </div>
              <div>
                <h2 className="text-2xl font-display bg-gradient-voice bg-clip-text text-transparent mb-2">
                  Спасибо за оценку!
                </h2>
                <p className="text-muted-foreground">
                  Ваш отзыв поможет нам улучшить сервис
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-voice-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Переходим к следующему звонку...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-voice-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-voice-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display bg-gradient-voice bg-clip-text text-transparent">
            Оценка разговора
          </CardTitle>
          <CardDescription>
            Помогите нам улучшить сервис, оценив ваше общение
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Partner Info */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-2xl">
              {partner.gender === "female" ? "👩" : "👨"}
            </div>
            <div>
              <h3 className="font-semibold">{partner.name}, {partner.age}</h3>
              <div className="flex flex-wrap gap-1 justify-center mt-1">
                {partner.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Success Icon */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-4xl mb-4 animate-voice-pulse">
              ✨
            </div>
            <p className="text-muted-foreground">
              Разговор завершен! Как вам понравилось общение с {partner.name}?
            </p>
          </div>

          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-medium mb-3">{getRatingText(ratingData.rating)}</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRatingChange(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || ratingData.rating)
                        ? "fill-voice-primary text-voice-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Что дальше?</p>
            <div className="flex gap-2">
              <Button
                variant={ratingData.action === 'pass' ? "destructive" : "outline"}
                onClick={() => handleAction('pass')}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Пропустить
              </Button>
              <Button
                variant={ratingData.action === 'like' ? "voice" : "outline"}
                onClick={() => handleAction('like')}
                className="flex-1"
              >
                <Heart className="mr-2 h-4 w-4" />
                Ещё раз
              </Button>
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Комментарий (необязательно)
            </label>
            <Textarea
              placeholder="Поделитесь впечатлениями о разговоре..."
              value={ratingData.feedback}
              onChange={(e) => handleFeedbackChange(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {ratingData.feedback.length}/200
            </p>
          </div>

          {/* Submit Button */}
          <Button
            variant="voice"
            onClick={handleSubmit}
            disabled={ratingData.rating === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                Отправить оценку
              </>
            )}
          </Button>

          {/* Skip Button */}
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full"
          >
            Пропустить оценку
          </Button>

          {/* Continue Button */}
          <Button
            variant="secondary"
            onClick={handleNewCall}
            disabled={isSubmitting}
            className="w-full"
          >
            Найти нового собеседника
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rate;