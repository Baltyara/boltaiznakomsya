import React, { useState } from 'react';
import { useMonetization } from '@/hooks/useMonetization';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { 
  Check, 
  Crown, 
  Star, 
  Zap, 
  Heart,
  Phone,
  Video,
  Shield,
  CreditCard,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SubscriptionPlansProps {
  className?: string;
  onSubscribe?: (planId: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ className, onSubscribe }) => {
  const { isMobile } = useMobile();
  const {
    subscription,
    subscriptionPlans,
    premiumFeatures,
    isProcessing,
    createSubscription,
    hasFeature,
    getRemainingLimits,
  } = useMonetization();

  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentLimits = getRemainingLimits();

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    
    try {
      const success = await createSubscription(planId);
      if (success) {
        onSubscribe?.(planId);
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Heart className="h-6 w-6 text-gray-500" />;
      case 'basic':
        return <Star className="h-6 w-6 text-blue-500" />;
      case 'premium':
        return <Crown className="h-6 w-6 text-purple-500" />;
      case 'ultimate':
        return <Zap className="h-6 w-6 text-yellow-500" />;
      default:
        return <Heart className="h-6 w-6" />;
    }
  };

  const getFeatureIcon = (featureText: string) => {
    if (featureText.includes('звонк')) return <Phone className="h-4 w-4" />;
    if (featureText.includes('видео')) return <Video className="h-4 w-4" />;
    if (featureText.includes('поддержк')) return <Shield className="h-4 w-4" />;
    if (featureText.includes('рекламы')) return <Zap className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
  };

  const displayPlans = isYearly 
    ? subscriptionPlans.filter(plan => plan.billing === 'yearly' || plan.tier === 'free')
    : subscriptionPlans.filter(plan => plan.billing === 'monthly');

  const isCurrentPlan = (planId: string) => {
    return subscription?.planId === planId && subscription.status === 'active';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Заголовок */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Выберите ваш план</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Получите больше возможностей для знакомств с премиум подпиской
        </p>

        {/* Переключатель месяц/год */}
        <div className="flex items-center justify-center space-x-4">
          <Label htmlFor="billing-toggle" className={cn(!isYearly && "font-semibold")}>
            Ежемесячно
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing-toggle" className={cn(isYearly && "font-semibold")}>
            Ежегодно
            <Badge variant="secondary" className="ml-2">
              -50%
            </Badge>
          </Label>
        </div>
      </div>

      {/* Текущий статус */}
      {subscription && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getPlanIcon(subscription.planId)}
                <div>
                  <h3 className="font-semibold">Текущий план</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionPlans.find(p => p.id === subscription.planId)?.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  Звонков сегодня: {currentLimits.dailyCalls === -1 ? '∞' : currentLimits.dailyCalls}
                </div>
                <div className="text-sm text-muted-foreground">
                  Совпадений в месяц: {currentLimits.monthlyMatches === -1 ? '∞' : currentLimits.monthlyMatches}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Планы подписок */}
      <div className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {displayPlans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "relative transition-all duration-200 hover:shadow-lg",
              plan.popular && "border-primary ring-2 ring-primary/20 scale-105",
              isCurrentPlan(plan.id) && "border-green-500 bg-green-50 dark:bg-green-950"
            )}
          >
            {/* Популярный значок */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary px-3 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Популярный
                </Badge>
              </div>
            )}

            {/* Скидка */}
            {plan.discount && (
              <div className="absolute -top-2 -right-2">
                <Badge variant="destructive" className="rounded-full">
                  <Gift className="h-3 w-3 mr-1" />
                  -{plan.discount}%
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {getPlanIcon(plan.tier)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  {plan.price === 0 ? 'Бесплатно' : `₽${plan.price}`}
                </div>
                {plan.price > 0 && (
                  <div className="text-sm text-muted-foreground">
                    / {plan.billing === 'monthly' ? 'месяц' : 'год'}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Функции */}
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 text-green-500">
                      {getFeatureIcon(feature)}
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Кнопка подписки */}
              <div className="pt-4">
                {isCurrentPlan(plan.id) ? (
                  <Button disabled className="w-full">
                    <Check className="h-4 w-4 mr-2" />
                    Текущий план
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isProcessing || selectedPlan === plan.id}
                    className={cn(
                      "w-full",
                      plan.popular && "bg-primary hover:bg-primary/90"
                    )}
                    variant={plan.tier === 'free' ? 'outline' : 'default'}
                  >
                    {plan.tier === 'free' ? (
                      <>
                        <Heart className="h-4 w-4 mr-2" />
                        Начать бесплатно
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Подписаться
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Премиум функции */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span>Премиум возможности</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature) => (
              <div
                key={feature.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg",
                  hasFeature(feature.id) 
                    ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                    : "bg-muted/50"
                )}
              >
                <div className={cn(
                  "flex-shrink-0",
                  hasFeature(feature.id) ? "text-green-500" : "text-muted-foreground"
                )}>
                  {hasFeature(feature.id) ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Crown className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {feature.description}
                  </div>
                  {!hasFeature(feature.id) && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Требуется {feature.requiredTier}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Гарантии */}
      <div className="text-center space-y-2 text-sm text-muted-foreground">
        <p>✅ Безопасные платежи</p>
        <p>✅ Отмена в любое время</p>
        <p>✅ 7 дней бесплатного использования</p>
        <p>✅ Возврат средств в течение 14 дней</p>
      </div>
    </div>
  );
};

export default SubscriptionPlans; 