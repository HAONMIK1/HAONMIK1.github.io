import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { NakNakLogo } from "@/components/NakNakLogo";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6">
          <NakNakLogo size={64} />
        </div>
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">페이지를 찾을 수 없어요</h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          요청하신 페이지가 존재하지 않거나<br />삭제되었을 수 있어요.
        </p>
        <Button onClick={() => setLocation("/")} className="w-full h-12">
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
