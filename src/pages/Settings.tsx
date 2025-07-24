import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Bell, Shield, Heart } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "Иван",
    email: "ivan@example.com",
    age: "25",
    bio: "Люблю путешествовать и изучать новые языки"
  });

  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    callRequests: false
  });

  const [interests, setInterests] = useState([
    "Музыка", "Путешествия", "Спорт"
  ]);

  const availableInterests = [
    "Музыка", "Спорт", "Путешествия", "Кино", "Книги", 
    "Кулинария", "Технологии", "Искусство", "Танцы", "Фотография"
  ];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/call")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-display bg-gradient-voice bg-clip-text text-transparent">
            Настройки
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Профиль
            </CardTitle>
            <CardDescription>
              Управляйте информацией о себе
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Возраст</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Интересы
            </CardTitle>
            <CardDescription>
              Выберите ваши интересы для лучшего подбора собеседников
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant={interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Уведомления
            </CardTitle>
            <CardDescription>
              Настройте, какие уведомления вы хотите получать
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-matches">Новые совпадения</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомления о новых людях, которые вам понравились
                </p>
              </div>
              <Switch
                id="new-matches"
                checked={notifications.newMatches}
                onCheckedChange={(checked) =>
                  setNotifications({...notifications, newMatches: checked})
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="messages">Сообщения</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомления о новых сообщениях
                </p>
              </div>
              <Switch
                id="messages"
                checked={notifications.messages}
                onCheckedChange={(checked) =>
                  setNotifications({...notifications, messages: checked})
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="call-requests">Звонки</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомления о входящих звонках
                </p>
              </div>
              <Switch
                id="call-requests"
                checked={notifications.callRequests}
                onCheckedChange={(checked) =>
                  setNotifications({...notifications, callRequests: checked})
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Приватность
            </CardTitle>
            <CardDescription>
              Управление конфиденциальностью и безопасностью
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Заблокированные пользователи
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Сменить пароль
            </Button>
            <Button variant="destructive" className="w-full justify-start">
              Удалить аккаунт
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button variant="voice" className="w-full">
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};

export default Settings;