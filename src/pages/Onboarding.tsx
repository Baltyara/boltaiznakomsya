import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface OnboardingData {
  name: string;
  age: number;
  gender: string;
  lookingFor: string;
  interests: string[];
  location: string;
  aboutMe: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    name: "",
    age: 25,
    gender: "",
    lookingFor: "",
    interests: [],
    location: "",
    aboutMe: ""
  });

  const interests = [
    "Музыка", "Спорт", "Путешествия", "Кино", "Книги", 
    "Кулинария", "Технологии", "Искусство", "Танцы", "Фотография",
    "Игры", "Йога", "Фитнес", "Природа", "Наука", "История",
    "Психология", "Мода", "Автомобили", "Животные"
  ];

  const steps = [
    {
      title: "Добро пожаловать!",
      description: "Давайте настроим ваш профиль для лучших знакомств",
      content: (
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-4xl animate-voice-pulse">
            🎤
          </div>
          <p className="text-muted-foreground">
            Болтай и Знакомься - это уникальная платформа для знакомств через голосовое общение
          </p>
          <div className="text-sm text-muted-foreground">
            <p>• 5-минутные голосовые звонки</p>
            <p>• Подбор по интересам</p>
            <p>• Безопасно и анонимно</p>
          </div>
        </div>
      ),
      canProceed: () => true
    },
    {
      title: "Как вас зовут?",
      description: "Представьтесь, чтобы другие могли к вам обращаться",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ваше имя</Label>
            <Input
              id="name"
              placeholder="Введите ваше имя"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="text-center text-lg"
            />
          </div>
        </div>
      ),
      canProceed: () => formData.name.trim().length >= 2
    },
    {
      title: "Ваш возраст",
      description: "Укажите ваш возраст для подбора подходящих собеседников",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-voice-primary mb-2">
              {formData.age}
            </div>
            <p className="text-muted-foreground">лет</p>
          </div>
          <Slider
            value={[formData.age]}
            onValueChange={(value) => setFormData({...formData, age: value[0]})}
            max={60}
            min={18}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>18</span>
            <span>60</span>
          </div>
        </div>
      ),
      canProceed: () => formData.age >= 18 && formData.age <= 60
    },
    {
      title: "Ваш пол",
      description: "Выберите ваш пол",
      content: (
        <div className="space-y-4">
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => setFormData({...formData, gender: value})}
            className="flex gap-6 justify-center"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="text-lg">Мужской</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="text-lg">Женский</Label>
            </div>
          </RadioGroup>
        </div>
      ),
      canProceed: () => formData.gender !== ""
    },
    {
      title: "Кого ищете?",
      description: "Выберите, с кем хотите знакомиться",
      content: (
        <div className="space-y-4">
          <RadioGroup
            value={formData.lookingFor}
            onValueChange={(value) => setFormData({...formData, lookingFor: value})}
            className="flex gap-6 justify-center"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="looking-male" />
              <Label htmlFor="looking-male" className="text-lg">Мужчин</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="looking-female" />
              <Label htmlFor="looking-female" className="text-lg">Женщин</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="looking-both" />
              <Label htmlFor="looking-both" className="text-lg">Всех</Label>
            </div>
          </RadioGroup>
        </div>
      ),
      canProceed: () => formData.lookingFor !== ""
    },
    {
      title: "Ваши интересы",
      description: "Выберите то, что вам нравится (минимум 3)",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Выбрано: {formData.interests.length}/20
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {interests.map((interest) => (
              <Badge
                key={interest}
                variant={formData.interests.includes(interest) ? "default" : "outline"}
                className={`cursor-pointer hover:scale-105 transition-transform ${
                  formData.interests.includes(interest) ? "bg-voice-primary" : ""
                }`}
                onClick={() => {
                  if (formData.interests.includes(interest)) {
                    setFormData({
                      ...formData, 
                      interests: formData.interests.filter(i => i !== interest)
                    });
                  } else {
                    setFormData({
                      ...formData, 
                      interests: [...formData.interests, interest]
                    });
                  }
                }}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      ),
      canProceed: () => formData.interests.length >= 3
    },
    {
      title: "Где вы находитесь?",
      description: "Укажите ваш город для локальных знакомств",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Город</Label>
            <Input
              id="location"
              placeholder="Москва, Санкт-Петербург..."
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="text-center"
            />
          </div>
        </div>
      ),
      canProceed: () => formData.location.trim().length >= 2
    },
    {
      title: "Расскажите о себе",
      description: "Кратко опишите себя для лучшего подбора",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aboutMe">О себе</Label>
            <textarea
              id="aboutMe"
              placeholder="Расскажите немного о себе, своих увлечениях, целях..."
              value={formData.aboutMe}
              onChange={(e) => setFormData({...formData, aboutMe: e.target.value})}
              className="w-full min-h-[100px] p-3 border rounded-md bg-background resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.aboutMe.length}/200
            </p>
          </div>
        </div>
      ),
      canProceed: () => formData.aboutMe.trim().length >= 10
    },
    {
      title: "Все готово!",
      description: "Теперь вы можете начать знакомиться",
      content: (
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-voice rounded-full flex items-center justify-center text-4xl animate-voice-pulse">
            ✨
          </div>
          <p className="text-muted-foreground">
            Ваш профиль настроен! Готовы к первому голосовому знакомству?
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Имя: {formData.name}</p>
            <p>• Возраст: {formData.age} лет</p>
            <p>• Интересы: {formData.interests.slice(0, 3).join(", ")}...</p>
          </div>
        </div>
      ),
      canProceed: () => true
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
      try {
        // TODO: Save onboarding data to API
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Onboarding data:", formData);
      navigate("/call");
      } catch (error) {
        console.error("Error saving onboarding data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate("/call");
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-voice-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border-voice-border">
        <CardHeader className="text-center">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-voice h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-center mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full mx-1 transition-all duration-300 ${
                  index <= currentStep ? "bg-voice-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          
          <CardTitle className="text-2xl font-display bg-gradient-voice bg-clip-text text-transparent">
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            {steps[currentStep].content}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
              disabled={isLoading}
            >
              Пропустить
            </Button>
            <Button
              variant="voice"
              onClick={handleNext}
              disabled={!steps[currentStep].canProceed() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : currentStep === steps.length - 1 ? (
                "Начать"
              ) : (
                <>
                  Далее
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;