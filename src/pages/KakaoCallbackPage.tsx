import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

interface KakaoCallbackPageProps {
  onNavigate?: (page: string) => void;
}

export default function KakaoCallbackPage({ onNavigate }: KakaoCallbackPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // URL에서 code, state 파라미터 추출
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const error = urlParams.get("error");
  const errorDescription = urlParams.get("error_description");
  
  // state에서 초대코드 추출 (카카오가 state를 그대로 반환)
  let inviteCode: string | null = null;
  if (state) {
    try {
      const decodedState = JSON.parse(atob(state));
      if (decodedState.inviteCode) {
        inviteCode = decodedState.inviteCode;
      }
    } catch (e) {
      // state 파싱 실패 시 무시
    }
  }

  // 로그인 API 호출
  const { data: loginResult, isLoading, error: loginError } = useQuery({
    queryKey: ["kakaoLogin", code],
    queryFn: async () => {
      if (!code) {
        throw new Error("인가 코드가 없습니다.");
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authCode: code,
          inviteCode: inviteCode || null,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("서버 응답을 파싱할 수 없습니다.");
      }

      if (!response.ok) {
        throw new Error(result.message || "로그인 실패");
      }

      return result;
    },
    enabled: !!code && !error, // code가 있고 error가 없을 때만 실행
    retry: false,
  });

  useEffect(() => {
    // 카카오 인증 에러 처리
    if (error) {
      toast({ title: "카카오 로그인 실패", description: errorDescription || error, variant: "destructive" });
      setLocation("/login");
      return;
    }

    // 로그인 성공
    if (loginResult?.data?.status === "AUTHENTICATED") {
      localStorage.setItem("accessToken", loginResult.data.accessToken);
      localStorage.setItem("refreshToken", loginResult.data.refreshToken);
      onNavigate ? onNavigate("home") : setLocation("/");
      return;
    }

    // 신규 회원 → 닉네임 설정
    if (loginResult?.data?.status === "NEED_SIGNUP") {
      const kakaoAccessToken = loginResult.data.kakaoAccessToken;
      if (kakaoAccessToken) {
        sessionStorage.setItem("kakaoAccessToken", kakaoAccessToken);
        if (inviteCode) sessionStorage.setItem("inviteCode", inviteCode);
        setLocation("/set-nickname");
      } else {
        setLocation("/login");
      }
      return;
    }

    // 로그인 에러 처리
    if (loginError) {
      toast({ title: "로그인 실패", description: loginError.message, variant: "destructive" });
      setLocation("/login");
      return;
    }
  }, [loginResult, loginError, error, errorDescription, code, setLocation, onNavigate]);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">카카오 로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  // 기본 로딩 화면 (useEffect가 처리하는 동안)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">처리 중...</p>
      </div>
    </div>
  );
}

