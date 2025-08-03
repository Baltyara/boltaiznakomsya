import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Bell, Shield, Heart, Save, Loader2, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileData {
  name: string;
  email: string;
  age: string;
  bio: string;
  location: string;
}

interface NotificationSettings {
  newMatches: boolean;
  messages: boolean;
  callRequests: boolean;
  soundEnabled: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age?.toString() || "25",
    bio: user?.aboutMe || "",
    location: user?.location || ""
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    newMatches: true,
    messages: true,
    callRequests: false,
    soundEnabled: true
  });

  const [interests, setInterests] = useState(user?.interests || [
    "Музыка", "Путешествия", "Спорт"
  ]);

  const availableInterests = [
    "Музыка", "Спорт", "Путешествия", "Кино", "Книги", 
    "Кулинария", "Технологии", "Искусство", "Танцы", "Фотография",
    "Игры", "Йога", "Фитнес", "Природа", "Наука", "История",
    "Психология", "Мода", "Автомобили", "Животные"
  ];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
    setHasChanges(true);
  };

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile({ ...profile, [field]: value });
    setHasChanges(true);
  };

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications({ ...notifications, [field]: value });
    setHasChanges(true);
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setSaveError(null);
    try {
      await updateProfile({
        name: profile.name,
        email: profile.email,
        age: parseInt(profile.age),
        aboutMe: profile.bio,
        location: profile.location,
        interests
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveError(error instanceof Error ? error.message : "Ошибка сохранения");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Sync user data when user changes
  useEffect(() => {
    console.log('Settings: user data changed:', user);
    if (user) {
      const profileData = {
        name: user.name || "",
        email: user.email || "",
        age: user.age?.toString() || "25",
        bio: user.aboutMe || "",
        location: user.location || ""
      };
      console.log('Settings: setting profile data:', profileData);
      setProfile(profileData);
      setInterests(user.interests || []);
    }
  }, [user]);

  const handleDeleteAccount = () => {
    if (confirm("Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.")) {
      // TODO: Implement account deletion
      logout();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-voice-subtle">
      {/* Header */}
      <div className="border-b border-voice-border p-4 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/call")}
            aria-label="Назад"
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
        <Card className="bg-card/80 backdrop-blur-sm border-voice-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-voice-primary" />
              Профиль
            </CardTitle>
            <CardDescription>
              Управляйте информацией о себе
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  placeholder="Ваше имя"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Возраст</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => handleProfileChange('age', e.target.value)}
                  placeholder="25"
                  min="18"
                  max="100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Город</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => handleProfileChange('location', e.target.value)}
                placeholder="Москва"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">О себе</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                placeholder="Расскажите немного о себе..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card className="bg-card/80 backdrop-blur-sm border-voice-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-voice-primary" />
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
                  className={`cursor-pointer hover:scale-105 transition-transform ${
                    interests.includes(interest) ? "bg-voice-primary" : ""
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Выбрано: {interests.length} интересов
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card/80 backdrop-blur-sm border-voice-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-voice-primary" />
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
                onCheckedChange={(checked) => handleNotificationChange('newMatches', checked)}
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
                onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
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
                onCheckedChange={(checked) => handleNotificationChange('callRequests', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound-enabled">Звуковые уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Включить звук для уведомлений
                </p>
              </div>
              <Switch
                id="sound-enabled"
                checked={notifications.soundEnabled}
                onCheckedChange={(checked) => handleNotificationChange('soundEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="bg-card/80 backdrop-blur-sm border-voice-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-voice-primary" />
              Приватность и безопасность
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
            <Button 
              variant="outline" 
              className="w-full justify-start text-orange-600 hover:text-orange-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выйти из аккаунта
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить аккаунт
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {saveError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {saveError}
          </div>
        )}

        {/* Save Button */}
        <Button 
          variant="voice" 
          className="w-full"
          onClick={handleSave}
          disabled={!hasChanges || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Сохранить изменения
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Settings;