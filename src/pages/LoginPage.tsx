import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NakNakLogo } from "@/components/NakNakLogo";
import { useLocation } from "wouter";

interface LoginPageProps {
  onNavigate?: (page: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [, setLocation] = useLocation();
  
  // URL에서 초대코드 추출
  const urlParams = new URLSearchParams(window.location.search);
  const inviteCode = urlParams.get("inviteCode");
  
  const handleKakaoLogin = () => {
    const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
    
    // TODO: Redirect URI 변경 필요 시 .env 파일의 VITE_KAKAO_REDIRECT_URI 수정
    // 카카오 개발자 콘솔(https://developers.kakao.com)에서 동일한 URI 등록 필요
    const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI || "http://localhost:5173/auth/kakao/callback";
    
    if (!KAKAO_REST_API_KEY) {
      alert("카카오 REST API 키가 설정되지 않았습니다. Replit Secrets에서 VITE_KAKAO_REST_API_KEY를 설정해주세요.");
      return;
    }
    
    // 초대코드가 있으면 state 파라미터로 전달 (카카오가 콜백 시 그대로 반환)
    let kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    
    if (inviteCode) {
      // state 파라미터에 초대코드를 base64로 인코딩하여 전달
      const state = btoa(JSON.stringify({ inviteCode }));
      kakaoAuthUrl += `&state=${encodeURIComponent(state)}`;
    }
    
    // 카카오 로그인 페이지로 리다이렉트
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <NakNakLogo size={80} />
          </div>
          <CardTitle className="text-3xl font-bold">낙낙</CardTitle>
          <CardDescription className="text-base">
            맛있는 음식점을 노크해서 알려드립니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              친구들과 함께 맛집을 발견하고 공유하세요
            </p>
            
            <Button
              onClick={handleKakaoLogin}
              className="w-full h-14 text-base font-semibold hover-elevate active-elevate-2"
              style={{
                backgroundColor: "#FEE500",
                color: "#000000",
              }}
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
          </div>

          <p className="text-xs text-center text-muted-foreground px-4 pt-4">
            계속 진행하면 낙낙의 <span className="underline cursor-pointer hover:text-foreground transition-colors">서비스 약관</span> 및{" "}
            <span className="underline cursor-pointer hover:text-foreground transition-colors">개인정보 처리방침</span>에 동의하는 것으로 간주됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
