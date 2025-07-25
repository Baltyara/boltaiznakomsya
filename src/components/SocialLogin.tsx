import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SocialLoginProps {
  mode?: "login" | "register";
}

const SocialLogin = ({ mode = "login" }: SocialLoginProps) => {
  const handleSocialLogin = (provider: string) => {
    console.log(`${mode} with ${provider}`);
    // Here you would integrate with your authentication provider
    // For now, just logging the action
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
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("google")}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("yandex")}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 15.5h-2.3l-2.9-4.7v4.7h-2V6.5h2.4c2.1 0 3.8 1.3 3.8 3.3 0 1.5-.8 2.5-1.9 3l3 4.7zm-4.2-9.8h-.3v3.6h.3c1.1 0 1.8-.6 1.8-1.8s-.7-1.8-1.8-1.8z"/>
          </svg>
          Yandex
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("vk")}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.915 13.028c-.388-.49-.277-.708 0-1.146.005-.005 2.842-4.004 3.138-5.36 0 0 .53-1.114-.57-1.114h-2.85s-.486.096-.626.45c0 0-1.156 2.935-2.673 4.88-.48.48-.693.203-.693-.51V6.192c0-.438-.135-.708-.945-.708h-3.86c-.31 0-.414.263-.414.51 0 .552.725.673.8 2.222v3.308c0 .726-.14.856-.44.856-.806 0-2.707-2.962-3.813-6.352-.244-.678-.486-.955-1.088-.955H3.246c-.562 0-.674.258-.674.543 0 .587.666 3.75 3.128 7.878C7.422 17.394 9.818 18.9 12.077 18.9c1.088 0 1.225-.275 1.225-.73v-1.946c0-.546.12-.654.484-.654.28 0 .742.14 1.852 1.194 1.27 1.25 1.477 1.81 2.182 1.81h2.85c.545 0 .82-.275.67-.785-.168-.51-.745-1.257-1.517-2.13-.48-.562-1.2-1.162-1.417-1.468-.28-.377-.203-.547 0-.888z"/>
          </svg>
          VK
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("mailru")}
          className="w-full"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 24c6.628 0 12-5.372 12-12S18.618 0 11.99 0C5.364 0 0 5.372 0 12s5.364 12 11.99 12zm.01-22C17.514 2 22 6.486 22 12s-4.486 10-10 10S2 17.514 2 12 6.486 2 12.01 2zm-.01 3.074c-1.45 0-2.595 1.177-2.595 2.63 0 1.451 1.144 2.627 2.595 2.627S14.6 9.155 14.6 7.704c0-1.453-1.151-2.63-2.6-2.63zm3.955 11.926c-.749-.749-2.135-1.47-3.955-1.47s-3.206.721-3.955 1.47c-.299.3-.299.785 0 1.085.299.299.784.299 1.084 0 .449-.45 1.571-.97 2.871-.97s2.422.52 2.871.97c.3.299.785.299 1.084 0 .299-.3.299-.785 0-1.085z"/>
          </svg>
          Mail.ru
        </Button>
      </div>
    </div>
  );
};

export default SocialLogin;