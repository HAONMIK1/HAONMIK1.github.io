import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
import { NakNakLogo } from "@/components/NakNakLogo";
import { useToast } from "@/hooks/use-toast";

interface SetNicknamePageProps {
  onNavigate?: (page: string) => void;
}

export default function SetNicknamePage({ onNavigate }: SetNicknamePageProps) {
  const [, setLocation] = useLocation();
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedNickname = nickname.trim();
    
    if (!trimmedNickname) {
      toast({
        title: "닉네임을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      toast({
        title: "닉네임은 2-10자로 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // sessionStorage에서 카카오 Access Token과 초대코드 가져오기
      const kakaoAccessToken = sessionStorage.getItem("kakaoAccessToken");
      const savedInviteCode = sessionStorage.getItem("inviteCode");

      if (!kakaoAccessToken) {
        toast({
          title: "오류",
          description: "카카오 토큰을 찾을 수 없습니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        onNavigate?.("login");
        return;
      }

      // 회원가입 API 호출
      const response = await fetch(`${API_BASE_URL}/api/v1/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kakaoAccessToken,
          nickname: trimmedNickname,
          inviteCode: savedInviteCode || null,
        }),
      });

      // 400 응답도 JSON으로 파싱
      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("서버 응답을 파싱할 수 없습니다.");
      }
      
      // 에러 응답 처리
      if (!response.ok || !result.success) {
        throw new Error(result.message || "회원가입 실패");
      }

      // JWT 토큰 저장
      if (result.data?.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("refreshToken", result.data.refreshToken);
      }

      // sessionStorage 정리
      sessionStorage.removeItem("kakaoAccessToken");
      sessionStorage.removeItem("inviteCode");
      
      toast({
        title: "환영합니다!",
        description: `${trimmedNickname}님, 낙낙에 오신 것을 환영합니다.`,
      });
      
      // 가입 직후 친구 연결 온보딩으로 이동 (초대자와 1촌 연결된 상태)
      setLocation("/onboarding/friends");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.";
      toast({
        title: "닉네임 설정 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <NakNakLogo size={64} />
          </div>
          <CardTitle className="text-2xl font-bold">환영합니다!</CardTitle>
          <CardDescription className="text-base">
            낙낙에서 사용할 닉네임을 설정해주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-base font-medium">
                닉네임
              </Label>
              <Input
                id="nickname"
                type="text"
                placeholder="2-10자로 입력해주세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={10}
                className="h-12 text-base"
                autoComplete="off"
                autoFocus
                data-testid="input-nickname"
              />
              <p className="text-sm text-muted-foreground">
                닉네임은 나중에 변경할 수 있습니다
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isSubmitting}
              data-testid="button-submit-nickname"
            >
              {isSubmitting ? "설정 중..." : "시작하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
