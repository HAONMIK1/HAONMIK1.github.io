import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { NakNakLogo } from "@/components/NakNakLogo";
import { useToast } from "@/hooks/use-toast";
import { Lock, Users, UtensilsCrossed } from "lucide-react";

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        authorize: (settings: {
          redirectUri: string;
          scope?: string;
          state?: string;
        }) => void;
      };
    };
  }
}

interface LoginPageProps {
  onNavigate?: (page: string) => void;
  inviteCode?: string;
}

export default function LoginPage({ onNavigate, inviteCode: propInviteCode }: LoginPageProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const inviteCode = propInviteCode || urlParams.get("inviteCode");

  const initKakao = () => {
    const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
    if (!KAKAO_JS_KEY) return false;
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
    }
    return true;
  };

  const handleDevLogin = () => {
    localStorage.setItem("accessToken", "dev-mock-token");
    localStorage.setItem("refreshToken", "dev-mock-refresh");
    onNavigate ? onNavigate("home") : setLocation("/");
  };

  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      toast({
        title: "설정 오류",
        description: "카카오 SDK를 불러오지 못했습니다. 페이지를 새로고침 해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!initKakao()) {
      toast({
        title: "설정 오류",
        description: "카카오 앱 키가 설정되지 않았습니다. 관리자에게 문의해주세요.",
        variant: "destructive",
      });
      return;
    }

    const redirectUri = `${window.location.origin}/kakao/callback`;

    if (inviteCode) {
      window.Kakao.Auth.authorize({ redirectUri, state: btoa(JSON.stringify({ inviteCode })) });
    } else {
      window.Kakao.Auth.authorize({ redirectUri });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 py-10">
      <div className="w-full max-w-md text-center mb-6">
        <div className="flex justify-center mb-3">
          <NakNakLogo size={72} />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">낙낙</h1>
        <p className="text-base text-muted-foreground">
          모르는 사람 말고, 아는 사람이 인정한 맛집
        </p>
      </div>

      <div className="w-full max-w-md grid grid-cols-3 gap-2 mb-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground leading-tight">초대받은<br />사람만 가입</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground leading-tight">1촌·2촌·3촌<br />지인 네트워크</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground leading-tight">직접 가본<br />진짜 후기</span>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <CardDescription className="text-base">
            친구들과 함께 맛집을 발견하고 공유하세요
          </CardDescription>
          {inviteCode && (
            <div className="bg-primary/10 rounded-lg px-4 py-2 text-sm text-primary font-medium">
              🎉 초대 코드로 가입하면 보너스 포인트를 받아요!
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <Button
            onClick={handleKakaoLogin}
            className="w-full h-14 text-base font-semibold hover-elevate active-elevate-2"
            style={{ backgroundColor: "#FEE500", color: "#000000" }}
            data-testid="button-kakao-login"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M10 0C4.477 0 0 3.517 0 7.857c0 2.813 1.88 5.28 4.7 6.63-.194.712-.73 2.738-.841 3.165-.132.513.188.507.396.368.164-.11 2.635-1.744 3.057-2.023C7.766 15.982 8.874 16 10 16c5.523 0 10-3.517 10-7.857S15.523 0 10 0z"
                fill="currentColor"
              />
            </svg>
            카카오로 시작하기
          </Button>

          {import.meta.env.VITE_DEV_MODE === "true" && (
            <Button
              variant="outline"
              onClick={handleDevLogin}
              className="w-full"
              data-testid="button-dev-login"
            >
              🛠 개발자 로그인 (백엔드 없이 화면 보기)
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground px-4">
            계속 진행하면 낙낙의{" "}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">
              서비스 약관
            </span>{" "}
            및{" "}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">
              개인정보 처리방침
            </span>
            에 동의하는 것으로 간주됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
