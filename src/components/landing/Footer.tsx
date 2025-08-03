import React from 'react';

const Footer = () => (
  <footer className="border-t border-voice-border py-12 px-4">
    <div className="container mx-auto text-center">
      <div className="font-display text-2xl font-bold text-voice-primary mb-4">
        Болтай и Знакомься
      </div>
      <p className="text-muted-foreground mb-6">
        Голосовые знакомства нового поколения
      </p>
      
      <div className="flex justify-center gap-8 mb-6">
        {['Правила', 'Приватность', 'Поддержка', 'Telegram'].map((link, index) => (
          <a
            key={index}
            href="#"
            className="text-muted-foreground hover:text-voice-primary transition-colors"
          >
            {link}
          </a>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground">
        © 2024 Болтай и Знакомься. Все права защищены.
      </p>
    </div>
  </footer>
);

export default Footer; 