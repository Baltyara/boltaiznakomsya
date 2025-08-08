import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Введите email");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Введите корректный email");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Здесь будет вызов API для восстановления пароля
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка восстановления пароля');
      }
      
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка восстановления пароля. Попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-voice-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-voice-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-display bg-gradient-voice bg-clip-text text-transparent">
              Проверьте почту
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Мы отправили инструкции по восстановлению пароля на ваш email
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                Если аккаунт с email <strong>{email}</strong> существует, 
                вы получите письмо с инструкциями по восстановлению пароля.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Не получили письмо? Проверьте папку "Спам" или попробуйте снова.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Попробовать снова
              </Button>
            </div>
            <div className="pt-4 border-t">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-voice-primary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к входу
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-voice-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-voice-border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-display bg-gradient-voice bg-clip-text text-transparent">
            Восстановление пароля
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Введите email, указанный при регистрации
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              variant="voice"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                "Отправить инструкции"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-voice-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к входу
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword; 