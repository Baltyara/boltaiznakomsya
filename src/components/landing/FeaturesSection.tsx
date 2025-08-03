import React from 'react';
import { Card } from '@/components/ui/card';
import { Timer, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Timer,
    title: 'Быстро',
    description: 'Всего 5 минут — этого хватит, чтобы понять, есть ли связь'
  },
  {
    icon: Shield,
    title: 'Безопасно',
    description: 'Анонимные звонки, никаких записей, полная приватность'
  },
  {
    icon: Zap,
    title: 'Увлекательно',
    description: 'Подбор по интересам и характеру, а не по внешности'
  }
];

const FeaturesSection = () => (
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
        {features.map((feature, index) => (
          <Card key={index} className="p-6 text-center hover:shadow-voice transition-all duration-300 group">
            <div className="w-16 h-16 bg-gradient-voice rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-voice-pulse">
              <feature.icon className="h-8 w-8 text-voice-navy" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-muted-foreground">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection; 