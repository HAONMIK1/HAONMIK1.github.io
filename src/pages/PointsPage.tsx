import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { ChevronRight, Coins, Gift, Star } from "lucide-react";

interface PointsPageProps {
  onNavigate?: (id: string) => void;
}

interface WalletData {
  totalScore: number;
  pointBalance: number;
}

export default function PointsPage({ onNavigate }: PointsPageProps = {}) {
  const [, setLocation] = useLocation();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["me", "wallet"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/me/wallet");
      const json = await res.json();
      return json.data as WalletData;
    },
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />

      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10">
            <Gift className="w-6 h-6 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">혜택</h1>
        </div>

        {/* 지갑 요약 카드 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 text-center" data-testid="wallet-total-score">
            <Star className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? "-" : wallet?.totalScore ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">누적 점수</p>
          </Card>
          <Card className="p-4 text-center" data-testid="wallet-point-balance">
            <Coins className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? "-" : wallet?.pointBalance ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">보유 포인트</p>
          </Card>
        </div>

        {/* 포인트 얻는 방법 안내 */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">포인트 얻는 방법</h2>
          <div className="space-y-2">
            <Card className="p-3 flex items-center justify-between">
              <p className="text-sm text-foreground">후기 작성하기</p>
              <p className="text-sm font-semibold text-primary">+10</p>
            </Card>
            <Card className="p-3 flex items-center justify-between">
              <p className="text-sm text-foreground">후기에 사진 첨부하기</p>
              <p className="text-sm font-semibold text-primary">+5</p>
            </Card>
            <Card className="p-3 flex items-center justify-between">
              <p className="text-sm text-foreground">내 초대코드로 지인 가입시키기</p>
              <p className="text-sm font-semibold text-primary">+20</p>
            </Card>
          </div>
        </section>

        {/* 복권 응모 */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">포인트로 응모하기</h2>
          <Card
            className="p-5 flex items-center gap-3 cursor-pointer hover-elevate"
            onClick={() => setLocation("/raffles")}
            data-testid="button-go-raffles"
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 shrink-0">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">복권 보러가기</p>
              <p className="text-xs text-muted-foreground">모은 포인트로 상품권 복권에 응모해보세요</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </Card>
        </section>
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
