import React from 'react';
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const ProblemSolutionSection = () => (
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
            {[
              'Живой голос вместо текста',
              'Никаких фото и фейков',
              'Мгновенная химия за 5 минут'
            ].map((text, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-voice-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-voice-navy">✓</span>
                </div>
                <span className="text-foreground">{text}</span>
              </div>
            ))}
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
);

export default ProblemSolutionSection; 