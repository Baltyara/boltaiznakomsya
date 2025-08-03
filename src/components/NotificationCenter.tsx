import React, { useState } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Settings,
  Heart,
  Phone,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const { isMobile } = useMobile();
  const {
    notifications,
    settings,
    permission,
    isSupported,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    updateSettings,
    requestPermission,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'match':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'call':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} дн назад`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action) {
      window.open(notification.action.url, '_blank');
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      updateSettings({ pushEnabled: true });
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Кнопка уведомлений */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Панель уведомлений */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className={cn(
            "w-80 max-h-96 overflow-hidden",
            isMobile && "w-screen max-w-sm mx-2"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Уведомления</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {showSettings ? (
                // Настройки уведомлений
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Push уведомления</Label>
                      <Switch
                        id="push-notifications"
                        checked={settings.pushEnabled}
                        onCheckedChange={(checked) => updateSettings({ pushEnabled: checked })}
                        disabled={permission !== 'granted'}
                      />
                    </div>
                    
                    {permission !== 'granted' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRequestPermission}
                        className="w-full"
                      >
                        Разрешить уведомления
                      </Button>
                    )}

                    <div className="flex items-center justify-between">
                      <Label htmlFor="match-notifications">Уведомления о совпадениях</Label>
                      <Switch
                        id="match-notifications"
                        checked={settings.matchNotifications}
                        onCheckedChange={(checked) => updateSettings({ matchNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="call-notifications">Уведомления о звонках</Label>
                      <Switch
                        id="call-notifications"
                        checked={settings.callNotifications}
                        onCheckedChange={(checked) => updateSettings({ callNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="system-notifications">Системные уведомления</Label>
                      <Switch
                        id="system-notifications"
                        checked={settings.systemNotifications}
                        onCheckedChange={(checked) => updateSettings({ systemNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Список уведомлений
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Нет уведомлений</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-3 border-b">
                        <span className="text-sm text-muted-foreground">
                          {unreadCount} непрочитанных
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllNotifications}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              "p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                              !notification.read && "bg-muted/30"
                            )}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <p className={cn(
                                    "text-sm font-medium truncate",
                                    !notification.read && "font-semibold"
                                  )}>
                                    {notification.title}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(notification.timestamp)}
                                  </span>
                                  
                                  {notification.action && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(notification.action!.url, '_blank');
                                      }}
                                    >
                                      {notification.action.label}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay для закрытия на мобильных */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter; 