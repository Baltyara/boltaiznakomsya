import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { useNotifications } from '@/hooks/useNotifications';
import { useChat } from '@/hooks/useChat';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useModeration } from '@/hooks/useModeration';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  MessageCircle, 
  BarChart3, 
  Shield, 
  Settings,
  ChevronRight,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import NotificationCenter from '@/components/NotificationCenter';
import ChatInterface from '@/components/ChatInterface';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

const Advanced: React.FC = () => {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const { unreadCount, settings, updateSettings } = useNotifications();
  const { chatRooms } = useChat();
  const { isModerator, isAdmin } = useModeration();
  const [activeTab, setActiveTab] = useState('notifications');

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Доступ ограничен</h2>
              <p className="text-muted-foreground">
                Войдите в аккаунт для доступа к расширенным функциям
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = [
    {
      id: 'notifications',
      title: 'Уведомления',
      icon: Bell,
      description: 'Управление push-уведомлениями и настройками',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'chat',
      title: 'Чат',
      icon: MessageCircle,
      description: 'Общение с пользователями в чате',
      badge: chatRooms.length > 0 ? chatRooms.length : undefined,
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      icon: BarChart3,
      description: 'Статистика и аналитика активности',
    },
    {
      id: 'moderation',
      title: 'Модерация',
      icon: Shield,
      description: 'Система жалоб и модерации',
      restricted: !isModerator(),
    },
    {
      id: 'settings',
      title: 'Настройки',
      icon: Settings,
      description: 'Дополнительные настройки приложения',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Расширенные функции</h1>
          <p className="text-muted-foreground">
            Дополнительные возможности для улучшения вашего опыта
          </p>
        </div>

        {/* Мобильная навигация */}
        {isMobile ? (
          <div className="space-y-4">
            {features.map((feature) => {
              if (feature.restricted) return null;
              
              return (
                <Card
                  key={feature.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab(feature.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <feature.icon className="h-6 w-6 text-primary" />
                        <div>
                          <h3 className="font-semibold">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {feature.badge && (
                          <Badge variant="secondary">{feature.badge}</Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Десктопная навигация */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              {features.map((feature) => {
                if (feature.restricted) return null;
                
                return (
                  <TabsTrigger
                    key={feature.id}
                    value={feature.id}
                    className="flex items-center space-x-2"
                  >
                    <feature.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{feature.title}</span>
                    {feature.badge && (
                      <Badge variant="secondary" className="ml-1">
                        {feature.badge}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Содержимое вкладок */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <NotificationCenter />
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Настройки уведомлений</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Push уведомления</Label>
                        <Switch
                          id="push-notifications"
                          checked={settings.pushEnabled}
                          onCheckedChange={(checked) => updateSettings({ pushEnabled: checked })}
                        />
                      </div>
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
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Чат с пользователями</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96">
                    <ChatInterface />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="moderation" className="space-y-6">
              {isModerator() ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span>Жалобы</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Система модерации и обработки жалоб
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Действия модерации</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        История действий модерации
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Доступ ограничен</h3>
                      <p className="text-muted-foreground">
                        Функции модерации доступны только модераторам и администраторам
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Общие настройки</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="dark-mode">Тёмная тема</Label>
                      <Switch id="dark-mode" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications-sound">Звук уведомлений</Label>
                      <Switch id="notifications-sound" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-play">Автовоспроизведение</Label>
                      <Switch id="auto-play" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Приватность</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="profile-visible">Профиль видим</Label>
                      <Switch id="profile-visible" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="online-status">Показывать статус онлайн</Label>
                      <Switch id="online-status" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="activity-status">Показывать активность</Label>
                      <Switch id="activity-status" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Мобильное содержимое */}
        {isMobile && (
          <div className="mt-6">
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <NotificationCenter />
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки уведомлений</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-push-notifications">Push уведомления</Label>
                      <Switch
                        id="mobile-push-notifications"
                        checked={settings.pushEnabled}
                        onCheckedChange={(checked) => updateSettings({ pushEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-match-notifications">Уведомления о совпадениях</Label>
                      <Switch
                        id="mobile-match-notifications"
                        checked={settings.matchNotifications}
                        onCheckedChange={(checked) => updateSettings({ matchNotifications: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="h-96">
                <ChatInterface />
              </div>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard />
            )}

            {activeTab === 'moderation' && isModerator() && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Система модерации</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Функции модерации будут доступны в полной версии
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-dark-mode">Тёмная тема</Label>
                      <Switch id="mobile-dark-mode" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-notifications-sound">Звук уведомлений</Label>
                      <Switch id="mobile-notifications-sound" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Advanced; 