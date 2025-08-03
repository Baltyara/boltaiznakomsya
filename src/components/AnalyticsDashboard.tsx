import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Phone, 
  Heart, 
  Clock, 
  TrendingUp, 
  Users, 
  Star,
  BarChart3,
  Activity,
  Calendar,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const { metrics, userAnalytics, isLoading } = useAnalytics();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Войдите для просмотра аналитики</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  const getPeakHour = (hours: number[]) => {
    if (!hours.length) return 'Нет данных';
    const maxHour = Math.max(...hours);
    return `${maxHour}:00`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Аналитика</h2>
          <p className="text-muted-foreground">Статистика вашей активности</p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Activity className="h-3 w-3" />
          <span>Live</span>
        </Badge>
      </div>

      {/* Общие метрики */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего звонков</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Средняя длительность: {formatDuration(metrics.averageCallDuration)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Совпадения</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalMatches.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Успешность: {formatPercentage(metrics.successRate)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные пользователи</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Удержание: {formatPercentage(metrics.retentionRate)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Удовлетворенность</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.userSatisfaction.toFixed(1)}/5</div>
              <Progress value={metrics.userSatisfaction * 20} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Персональная аналитика */}
      {userAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ваша активность */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Ваша активность</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userAnalytics.callsCount}</div>
                  <p className="text-sm text-muted-foreground">Звонков</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-500">{userAnalytics.matchesCount}</div>
                  <p className="text-sm text-muted-foreground">Совпадений</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Общее время звонков</span>
                  <span className="font-medium">{formatDuration(userAnalytics.totalCallTime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Средняя длительность</span>
                  <span className="font-medium">{formatDuration(userAnalytics.averageCallDuration)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ваш рейтинг</span>
                  <span className="font-medium">{userAnalytics.rating.toFixed(1)}/5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Популярные интересы */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Популярные интересы</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.popularInterests.slice(0, 5).map((interest, index) => (
                  <div key={interest} className="flex items-center justify-between">
                    <span className="text-sm">{interest}</span>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Графики активности */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Пиковые часы */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Пиковые часы активности</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Самое активное время</span>
                <span className="font-medium">{getPeakHour(metrics?.peakHours || [])}</span>
              </div>
              <div className="h-32 bg-muted rounded-lg flex items-end justify-around p-2">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = metrics?.peakHours?.includes(i) ? 1 : 0;
                  return (
                    <div
                      key={i}
                      className="bg-primary rounded-t"
                      style={{
                        height: `${hour * 100}%`,
                        width: '8px',
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                0:00 - 23:00
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ваши активные часы */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Ваши активные часы</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ваше активное время</span>
                <span className="font-medium">{getPeakHour(userAnalytics?.activeHours || [])}</span>
              </div>
              <div className="h-32 bg-muted rounded-lg flex items-end justify-around p-2">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = userAnalytics?.activeHours?.includes(i) ? 1 : 0;
                  return (
                    <div
                      key={i}
                      className="bg-green-500 rounded-t"
                      style={{
                        height: `${hour * 100}%`,
                        width: '8px',
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                0:00 - 23:00
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Последняя активность */}
      {userAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Последняя активность</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Последний раз активны</p>
                <p className="font-medium">
                  {new Date(userAnalytics.lastActive).toLocaleString('ru-RU')}
                </p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Онлайн
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 