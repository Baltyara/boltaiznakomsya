import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Globe, Zap, Search } from "lucide-react";

interface SocialLoginProps {
  mode?: "login" | "register";
}

const SocialLogin = ({ mode = "login" }: SocialLoginProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSocialLogin = async (provider: string) => {
    try {
      toast({
        title: `${mode === "login" ? "Вход" : "Регистрация"} через ${provider}`,
        description: "Перенаправление на сервис авторизации...",
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Here you would integrate with your authentication provider
      // For now, we'll simulate successful authentication
      switch (provider) {
        case "google":
          // Redirect to Google OAuth
          window.location.href = `https://accounts.google.com/oauth/authorize?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${window.location.origin}/auth/google/callback&response_type=code&scope=email profile`;
          break;
        case "yandex":
          // Redirect to Yandex OAuth
          window.location.href = `https://oauth.yandex.ru/authorize?response_type=code&client_id=YOUR_YANDEX_CLIENT_ID&redirect_uri=${window.location.origin}/auth/yandex/callback`;
          break;
        case "vk":
          // Redirect to VK OAuth
          window.location.href = `https://oauth.vk.com/authorize?client_id=YOUR_VK_CLIENT_ID&display=page&redirect_uri=${window.location.origin}/auth/vk/callback&scope=email&response_type=code&v=5.131`;
          break;
        default:
          throw new Error("Неподдерживаемый провайдер");
      }

      // For demo purposes, navigate to onboarding after a delay
      setTimeout(() => {
        navigate('/onboarding');
      }, 2000);

    } catch (error) {
      toast({
        title: "Ошибка авторизации",
        description: "Не удалось выполнить вход через социальную сеть",
        variant: "destructive",
      });
    }
  };

  const buttonText = mode === "login" ? "Войти" : "Зарегистрироваться";

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Или {buttonText.toLowerCase()} через
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("google")}
          className="w-full"
          type="button"
        >
          <Search className="mr-2 h-4 w-4" />
          Google
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("yandex")}
          className="w-full"
          type="button"
        >
          <Zap className="mr-2 h-4 w-4" />
          Yandex
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSocialLogin("vk")}
          className="w-full"
          type="button"
        >
          <Globe className="mr-2 h-4 w-4" />
          VK
        </Button>
      </div>
    </div>
  );
};

export default SocialLogin;