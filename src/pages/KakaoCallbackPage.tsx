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
          token: code, // 카카오 인가 코드
          inviteCode: inviteCode || null, // URL에서 받은 초대코드 (없으면 null로 백엔드에서 처리)
        }),
      });

      // 401 응답도 JSON으로 파싱 (회원가입 필요 시)
      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("서버 응답을 파싱할 수 없습니다.");
      }
      
      // 401이지만 success: false인 경우는 회원가입 필요 (에러 아님)
      if (response.status === 401 && result.success === false) {
        // 회원가입이 필요한 경우는 정상 플로우로 처리
        return result;
      }
      
      // 실제 에러인 경우만 throw
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

    // 로그인 성공 처리
    if (loginResult?.success && loginResult?.token) {
      // JWT 토큰을 localStorage에 저장
      if (loginResult.data?.accessToken) {
        localStorage.setItem("accessToken", loginResult.data.accessToken);
        localStorage.setItem("refreshToken", loginResult.data.refreshToken);
      }
      
      // 메인 페이지로 이동
      if (onNavigate) {
        onNavigate("home");
      } else {
        setLocation("/");
      }
      return;
    }

    // 회원가입 필요 (success: false)
    // 백엔드에서 Access Token을 반환하므로, 이를 사용하여 회원가입
    if (loginResult && !loginResult.success) {
      // 로그인 API에서 반환한 Access Token(또는 인가 코드)을 저장
      if (code) {
        // 백엔드에서 Access Token을 token 필드에 반환했을 수 있음
        const accessTokenOrCode = loginResult.token || code;
        sessionStorage.setItem("kakaoCode", accessTokenOrCode);
        if (inviteCode) {
          sessionStorage.setItem("inviteCode", inviteCode);
        }
        // 회원가입 페이지로 자동 이동 (에러 메시지 없이)
        setLocation("/set-nickname");
      } else {
        // code가 없으면 로그인 페이지로
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

