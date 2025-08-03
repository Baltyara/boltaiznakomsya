import React from 'react';

const steps = [
  {
    number: 1,
    title: 'Регистрация',
    description: 'Укажите пол, возраст и интересы — готово!'
  },
  {
    number: 2,
    title: 'Звонок',
    description: 'Мгновенный подбор и голосовой чат на 5 минут'
  },
  {
    number: 3,
    title: 'Решайте',
    description: '🔥 Ещё раз или ❌ К следующему собеседнику'
  }
];

const HowItWorksSection = () => (
  <section className="py-16 px-4">
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          Как это работает?
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-voice rounded-full flex items-center justify-center mx-auto">
                <span className="font-display text-2xl font-bold text-voice-navy">{step.number}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-32 h-0.5 bg-gradient-to-r from-voice-primary to-voice-secondary" />
              )}
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection; 