import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Phone, 
  User, 
  Settings, 
  Menu, 
  X,
  Heart,
  MessageCircle,
  LogIn
} from 'lucide-react';

interface MobileNavigationProps {
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const { isMobile, isPWA } = useMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Если не мобильное устройство, не показываем
  if (!isMobile) return null;

  const navigationItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/call', icon: Phone, label: 'Звонки' },
    { path: '/rate', icon: Heart, label: 'Оценки' },
    { path: '/advanced', icon: Settings, label: 'Ещё' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Меню</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full bg-muted hover:bg-muted/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "flex items-center w-full p-4 rounded-xl transition-colors",
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              
              {/* Кнопка входа в мобильном меню */}
              <button
                onClick={() => {
                  handleNavigation('/login');
                }}
                className="flex items-center w-full p-4 rounded-xl transition-colors bg-voice-primary/10 hover:bg-voice-primary/20 text-voice-primary"
              >
                <LogIn className="h-5 w-5 mr-3" />
                <span className="font-medium">Войти в аккаунт</span>
              </button>
              
              {/* Кнопка "Как это работает?" в мобильном меню */}
              <button
                onClick={() => {
                  handleNavigation('/how-it-works');
                }}
                className="flex items-center w-full p-4 rounded-xl transition-colors bg-muted hover:bg-muted/80"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                <span className="font-medium">Как это работает?</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Нижняя навигация */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2",
        isPWA && "pb-8", // Отступ для PWA
        className
      )}>
        <div className="flex justify-around items-center">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors min-w-0",
                isActive(item.path)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          ))}
          
          {/* Кнопка меню */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Ещё</span>
          </button>
        </div>
      </nav>

      {/* Отступ для контента */}
      <div className="h-20" />
    </>
  );
};

export default MobileNavigation; 