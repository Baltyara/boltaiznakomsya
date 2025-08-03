import React from 'react';

const stats = [
  { value: '1000+', label: 'Активных пользователей' },
  { value: '5000+', label: 'Звонков в день' },
  { value: '25%', label: 'Возвращаются снова' }
];

const SocialProofSection = () => (
  <section className="py-16 px-4 bg-card/50">
    <div className="container mx-auto text-center">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-12">
        Тысячи звонков каждый день
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-4xl font-display font-bold text-voice-primary mb-2">
              {stat.value}
            </div>
            <p className="text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofSection; 