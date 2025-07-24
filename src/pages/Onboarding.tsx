import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = [
    "Музыка", "Спорт", "Путешествия", "Кино", "Книги", 
    "Кулинария", "Технологии", "Искусство", "Танцы", "Фотография"
  ];

  const steps = [
    {
      title: "Добро пожаловать!",
      description: "Давайте настроим ваш профиль для лучших знакомств",
      content: (
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-4xl">
            🎤
          </div>
          <p className="text-muted-foreground">
            Болтай и Знакомься - это уникальная платформа для знакомств через голосовое общение
          </p>
        </div>
      )
    },
    {
      title: "Ваши интересы",
      description: "Выберите то, что вам нравится",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Выберите хотя бы 3 интереса:</p>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Badge
                key={interest}
                variant={selectedInterests.includes(interest) ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  if (selectedInterests.includes(interest)) {
                    setSelectedInterests(selectedInterests.filter(i => i !== interest));
                  } else {
                    setSelectedInterests([...selectedInterests, interest]);
                  }
                }}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Все готово!",
      description: "Теперь вы можете начать знакомиться",
      content: (
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-4xl animate-pulse">
            ✨
          </div>
          <p className="text-muted-foreground">
            Ваш профиль настроен! Готовы к первому голосовому знакомству?
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/call");
    }
  };

  const handleSkip = () => {
    navigate("/call");
  };

  const canProceed = currentStep !== 1 || selectedInterests.length >= 3;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full mx-1 ${
                  index <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-2xl font-display bg-gradient-voice bg-clip-text text-transparent">
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            {steps[currentStep].content}
          </div>
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
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1"
            >
              {currentStep === steps.length - 1 ? "Начать" : "Далее"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;