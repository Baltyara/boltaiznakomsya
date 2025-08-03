import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleStartCall = () => navigate('/register');
  const handleLogin = () => navigate('/login');
  const handleHowItWorks = () => navigate('/how-it-works');

  return (
    <section className="relative overflow-hidden py-20 px-4">
      {/* Кнопка входа в правом верхнем углу */}
      <div className="absolute top-4 right-4 z-20">
        <Button 
          variant="voice-outline" 
          size="sm" 
          onClick={handleLogin}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-voice-primary/20"
        >
          <LogIn className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Войти</span>
          <span className="sm:hidden">Вход</span>
        </Button>
      </div>
      
      <div className="container mx-auto text-center">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-voice-primary rounded-full opacity-20 animate-float" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-voice-secondary rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-voice-primary rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }} />
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
            <Button 
              variant="voice-outline" 
              size="lg" 
              onClick={handleHowItWorks}
              className="border-voice-primary/30 hover:border-voice-primary/50"
            >
              Как это работает?
            </Button>
          </div>

          {/* Voice Animation */}
          <div className="mt-16 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-voice rounded-full animate-voice-glow flex items-center justify-center">
                <Mic className="h-12 w-12 text-voice-navy animate-voice-pulse" />
              </div>
              <div className="absolute inset-0 w-32 h-32 bg-voice-primary rounded-full opacity-30 animate-ping" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 