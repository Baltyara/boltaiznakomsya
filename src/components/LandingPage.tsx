import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Heart, Users, Shield, Timer, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartCall = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-voice-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto text-center">
          {/* Floating elements for atmosphere */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-voice-primary rounded-full opacity-20 animate-float"></div>
            <div className="absolute top-40 right-20 w-32 h-32 bg-voice-secondary rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-voice-primary rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6">
              <span className="bg-gradient-voice bg-clip-text text-transparent animate-gradient-shift bg-300%">
                Болтай и Знакомься
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Познакомься голосом за <span className="text-voice-primary font-semibold">5 минут</span>
            </p>
            
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Без фото, без профилей — только живое общение и настоящая химия
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="voice" size="lg" className="group" onClick={handleStartCall}>
                <Mic className="mr-2 h-5 w-5 group-hover:animate-voice-pulse" />
                Начать звонок
              </Button>
              <Button variant="voice-outline" size="lg">
                Как это работает?
              </Button>
            </div>

            {/* Voice Animation Visual */}
            <div className="mt-16 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-voice rounded-full animate-voice-glow flex items-center justify-center">
                  <Mic className="h-12 w-12 text-voice-navy animate-voice-pulse" />
                </div>
                <div className="absolute inset-0 w-32 h-32 bg-voice-primary rounded-full opacity-30 animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem -> Solution Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Устали от <span className="text-voice-primary">фоточек</span>?
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Бесконечные свайпы, холодные чаты, фейковые профили... 
                Время для настоящего знакомства!
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-voice-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-voice-navy">✓</span>
                  </div>
                  <span className="text-foreground">Живой голос вместо текста</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-voice-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-voice-navy">✓</span>
                  </div>
                  <span className="text-foreground">Никаких фото и фейков</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-voice-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-voice-navy">✓</span>
                  </div>
                  <span className="text-foreground">Мгновенная химия за 5 минут</span>
                </div>
              </div>
            </div>
            <div>
              <Card className="p-8 bg-card border-voice-border">
                <div className="text-center">
                  <Heart className="h-16 w-16 text-voice-primary mx-auto mb-4 animate-voice-pulse" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    Познакомьтесь по-настоящему
                  </h3>
                  <p className="text-muted-foreground">
                    Голос передаёт эмоции и характер лучше тысячи фотографий
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Почему выбирают нас?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Простое, безопасное и увлекательное знакомство голосом
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-voice transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-voice rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-voice-pulse">
                <Timer className="h-8 w-8 text-voice-navy" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Быстро
              </h3>
              <p className="text-muted-foreground">
                Всего 5 минут — этого хватит, чтобы понять, есть ли связь
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-voice transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-voice rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-voice-pulse">
                <Shield className="h-8 w-8 text-voice-navy" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Безопасно
              </h3>
              <p className="text-muted-foreground">
                Анонимные звонки, никаких записей, полная приватность
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-voice transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-voice rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-voice-pulse">
                <Zap className="h-8 w-8 text-voice-navy" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Увлекательно
              </h3>
              <p className="text-muted-foreground">
                Подбор по интересам и характеру, а не по внешности
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Как это работает?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-voice rounded-full flex items-center justify-center mx-auto">
                  <span className="font-display text-2xl font-bold text-voice-navy">1</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-32 h-0.5 bg-gradient-to-r from-voice-primary to-voice-secondary"></div>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Регистрация
              </h3>
              <p className="text-muted-foreground">
                Укажите пол, возраст и интересы — готово!
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-voice rounded-full flex items-center justify-center mx-auto">
                  <span className="font-display text-2xl font-bold text-voice-navy">2</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-32 h-0.5 bg-gradient-to-r from-voice-primary to-voice-secondary"></div>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Звонок
              </h3>
              <p className="text-muted-foreground">
                Мгновенный подбор и голосовой чат на 5 минут
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-voice rounded-full flex items-center justify-center mx-auto">
                  <span className="font-display text-2xl font-bold text-voice-navy">3</span>
                </div>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Решайте
              </h3>
              <p className="text-muted-foreground">
                🔥 Ещё раз или ❌ К следующему собеседнику
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12">
            Тысячи звонков каждый день
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-voice-primary mb-2">1000+</div>
              <p className="text-muted-foreground">Активных пользователей</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-voice-primary mb-2">5000+</div>
              <p className="text-muted-foreground">Звонков в день</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-voice-primary mb-2">25%</div>
              <p className="text-muted-foreground">Возвращаются снова</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            Готовы <span className="bg-gradient-voice bg-clip-text text-transparent">познакомиться</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Начните своё первое голосовое знакомство прямо сейчас
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="voice" size="lg" className="group" onClick={handleStartCall}>
              <Mic className="mr-2 h-5 w-5 group-hover:animate-voice-pulse" />
              Попробовать бесплатно
            </Button>
            <Button variant="voice-outline" size="lg">
              Узнать больше
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Первые 3 звонка — бесплатно
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-voice-border py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="font-display text-2xl font-bold text-voice-primary mb-4">
            Болтай и Знакомься
          </div>
          <p className="text-muted-foreground mb-6">
            Голосовые знакомства нового поколения
          </p>
          
          <div className="flex justify-center gap-8 mb-6">
            <a href="#" className="text-muted-foreground hover:text-voice-primary transition-colors">
              Правила
            </a>
            <a href="#" className="text-muted-foreground hover:text-voice-primary transition-colors">
              Приватность
            </a>
            <a href="#" className="text-muted-foreground hover:text-voice-primary transition-colors">
              Поддержка
            </a>
            <a href="#" className="text-muted-foreground hover:text-voice-primary transition-colors">
              Telegram
            </a>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © 2024 Болтай и Знакомься. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;