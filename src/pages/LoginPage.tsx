import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { NakNakLogo } from "@/components/NakNakLogo";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        login: (settings: {
          success: (authObj: { access_token: string }) => void;
          fail: (err: unknown) => void;
          scope?: string;
        }) => void;
      };
    };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

interface LoginPageProps {
  onNavigate?: (page: string) => void;
  inviteCode?: string;
}

export default function LoginPage({ onNavigate, inviteCode: propInviteCode }: LoginPageProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLoginSuccess = async (kakaoAccessToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kakaoAccessToken }),
      });

      const result = await response.json();

      // 기존 회원 로그인 성공
      if (result.success && result.data?.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("refreshToken", result.data.refreshToken);
        onNavigate ? onNavigate("home") : setLocation("/");
        return;
      }

      // 신규 회원 → 닉네임 설정으로 이동
      if (!result.success) {
        sessionStorage.setItem("kakaoAccessToken", kakaoAccessToken);
        if (inviteCode) sessionStorage.setItem("inviteCode", inviteCode);
        setLocation("/set-nickname");
        return;
      }

      throw new Error(result.message || "로그인 실패");
    } catch (err) {
      const message = err instanceof Error ? err.message : "잠시 후 다시 시도해주세요.";
      toast({ title: "로그인 실패", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    if (!window.Kakao?.Auth) {
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

    setIsLoading(true);

    window.Kakao.Auth.login({
      success: (authObj) => {
        handleLoginSuccess(authObj.access_token);
      },
      fail: () => {
        setIsLoading(false);
        toast({ title: "카카오 로그인 취소", description: "로그인을 취소했습니다." });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <NakNakLogo size={80} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">낙낙</h1>
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
            disabled={isLoading}
            className="w-full h-14 text-base font-semibold hover-elevate active-elevate-2"
            style={{ backgroundColor: "#FEE500", color: "#000000" }}
            data-testid="button-kakao-login"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
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
            )}
            {isLoading ? "로그인 중..." : "카카오로 시작하기"}
          </Button>

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
