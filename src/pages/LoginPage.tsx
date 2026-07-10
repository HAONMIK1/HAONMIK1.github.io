import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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

const FEATURES = [
  {
    icon: Lock,
    title: "초대받은 사람만 가입",
    description: "아무나 들어올 수 없는 폐쇄형 커뮤니티예요",
  },
  {
    icon: Users,
    title: "1촌·2촌·3촌 지인 네트워크",
    description: "가까운 사람부터 지인의 지인까지 연결돼요",
  },
  {
    icon: UtensilsCrossed,
    title: "직접 가본 사람의 진짜 후기",
    description: "광고 없이, 아는 사람의 경험만 모아요",
  },
];

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* 상단 히어로 */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-primary/15 via-primary/5 to-background px-6 pt-16 pb-10 text-center">
        <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-lg shadow-primary/20 mb-3">
          <NakNakLogo size={64} />
        </div>
        <p className="text-sm font-bold text-primary tracking-tight mb-3">낙낙</p>
        <h1 className="text-[28px] leading-snug font-extrabold text-foreground mb-2 tracking-tight">
          모르는 사람 말고,<br />아는 사람이 인정한 맛집
        </h1>
        <p className="text-sm text-muted-foreground">
          지인 초대로만 시작하는 프라이빗 맛집 커뮤니티
        </p>

        <div className="w-full max-w-sm mt-10 space-y-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-2xl p-3.5 text-left shadow-sm border border-border/50"
              data-testid={`login-feature-${i}`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 로그인 영역 */}
      <div className="bg-card rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-6 pt-7 pb-8">
        <div className="max-w-sm mx-auto space-y-4">
          {inviteCode && (
            <div className="bg-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary font-medium text-center">
              🎉 초대 코드로 가입하면 보너스 포인트를 받아요!
            </div>
          )}

          <Button
            onClick={handleKakaoLogin}
            className="w-full h-14 text-base font-semibold rounded-2xl hover-elevate active-elevate-2"
            style={{ backgroundColor: "#FEE500", color: "#000000" }}
            data-testid="button-kakao-login"
          >
            <svg
              width="22"
              height="22"
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
              className="w-full rounded-2xl"
              data-testid="button-dev-login"
            >
              🛠 개발자 로그인 (백엔드 없이 화면 보기)
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground px-2 leading-relaxed">
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
        </div>
      </div>
    </div>
  );
}
