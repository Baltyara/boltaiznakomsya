import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mic, Users, Heart, Shield, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Регистрация",
      description: "Быстрая регистрация без фото. Укажите только основные данные и начните общение.",
      color: "text-voice-primary"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Поиск собеседника",
      description: "Наш алгоритм подберет вам интересного собеседника на основе ваших интересов.",
      color: "text-voice-secondary"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "5-минутный звонок",
      description: "Короткий звонок позволяет быстро понять, есть ли химия между вами.",
      color: "text-voice-accent"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Взаимная симпатия",
      description: "Если понравились друг другу, можете продолжить общение или обменяться контактами.",
      color: "text-pink-500"
    }
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Безопасность",
      description: "Все звонки защищены, личные данные не передаются"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Качество",
      description: "Только проверенные пользователи с рейтингом"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Быстро",
      description: "Найдите собеседника за 30 секунд"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-voice-subtle">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Как это работает</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <span className="bg-gradient-voice bg-clip-text text-transparent">
              Как работает Болтай и Знакомься
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Простой и эффективный способ найти интересных собеседников через голосовое общение
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-4 p-3 rounded-full bg-gradient-voice ${step.color} text-white`}>
                  {step.icon}
                </div>
                <CardTitle className="text-lg font-semibold">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gradient-voice"></div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-voice-primary/10 text-voice-primary w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Готовы попробовать?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам пользователей, которые уже нашли интересных собеседников
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="voice" 
              size="lg" 
              onClick={() => navigate('/register')}
              className="group"
            >
              <Mic className="mr-2 h-5 w-5 group-hover:animate-voice-pulse" />
              Начать знакомства
            </Button>
            <Button 
              variant="voice-outline" 
              size="lg"
              onClick={() => navigate('/login')}
            >
              Уже есть аккаунт
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks; 