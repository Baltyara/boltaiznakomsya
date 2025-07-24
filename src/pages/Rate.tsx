import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const Rate = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    // Handle rating submission
    console.log("Rating:", rating, "Feedback:", feedback);
    navigate("/call");
  };

  const handleSkip = () => {
    navigate("/call");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display bg-gradient-voice bg-clip-text text-transparent">
            Оценка разговора
          </CardTitle>
          <CardDescription>
            Помогите нам улучшить сервис, оценив ваше общение
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success Icon */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-4xl mb-4">
              ✨
            </div>
            <p className="text-muted-foreground">
              Разговор завершен! Как вам понравилось общение с Анной?
            </p>
          </div>

          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-medium mb-3">Оцените разговор</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Комментарий (необязательно)
            </label>
            <Textarea
              placeholder="Поделитесь впечатлениями о разговоре..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Пропустить
            </Button>
            <Button
              variant="voice"
              onClick={handleSubmit}
              disabled={rating === 0}
              className="flex-1"
            >
              Отправить
            </Button>
          </div>

          {/* Continue Button */}
          <Button
            variant="secondary"
            onClick={() => navigate("/call")}
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