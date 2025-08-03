import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  const handleStartCall = () => navigate('/register');

  return (
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
  );
};

export default CTASection; 