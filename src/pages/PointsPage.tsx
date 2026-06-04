import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import PointsDisplay from "@/components/PointsDisplay";
import PointTransactionItem from "@/components/PointTransactionItem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface PointsPageProps {
  onNavigate?: (id: string) => void;
}

const FALLBACK_TRANSACTIONS = [
  { id: "txn1", type: "earn" as const, description: "맛집 등록 (사진 포함)", amount: 1500, timestamp: "2시간 전", icon: "restaurant" as const },
  { id: "txn2", type: "earn" as const, description: "후기 작성", amount: 500, timestamp: "5시간 전", icon: "review" as const },
  { id: "txn3", type: "earn" as const, description: "영수증 인증", amount: 5000, timestamp: "1일 전", icon: "receipt" as const },
  { id: "txn4", type: "earn" as const, description: "친구 초대", amount: 1000, timestamp: "2일 전", icon: "referral" as const },
  { id: "txn5", type: "earn" as const, description: "맛집 등록", amount: 500, timestamp: "3일 전", icon: "restaurant" as const },
  { id: "txn6", type: "earn" as const, description: "주간 랭킹 보너스", amount: 3000, timestamp: "5일 전", icon: "referral" as const },
];

export default function PointsPage({ onNavigate }: PointsPageProps = {}) {
  const [, setLocation] = useLocation();

  const { data: userInfo } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error("사용자 정보 조회 실패");
      return response.json();
    },
    retry: false,
  });

  const { data: transactionsData, isLoading: isLoadingTxn } = useQuery({
    queryKey: ["user", "me", "points", "history"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me/points`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error("포인트 내역 조회 실패");
      return response.json();
    },
    retry: false,
  });

  const transactions = transactionsData?.history ?? FALLBACK_TRANSACTIONS;
  const totalPoints = userInfo?.score ?? transactions.reduce(
    (sum: number, txn: any) => txn.type === "earn" ? sum + txn.amount : sum - txn.amount, 0
  );
  const weeklyPoints = transactionsData?.weeklyPoints ?? 0;
  const monthlyPoints = transactionsData?.monthlyPoints ?? 0;
  const myRank = transactionsData?.rank ?? userInfo?.rank ?? "-";

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader
        onSearchClick={() => setLocation("/search")}
      />

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10">
            <Coins className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">포인트</h1>
            <p className="text-sm text-muted-foreground">내 포인트 관리</p>
          </div>
        </div>

        {/* 보유 포인트 */}
        <Card className="p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">보유 포인트</p>
            <PointsDisplay points={totalPoints} size="lg" className="justify-center mb-4" />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setLocation("/rankings")}
              data-testid="button-earn-more"
            >
              <TrendingUp className="w-4 h-4" />
              랭킹 보기
            </Button>
          </div>
        </Card>

        {/* 통계 */}
        <div className="grid gap-4 grid-cols-3 mb-6">
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">이번 주 획득</p>
            <p className="text-xl font-bold text-green-600">
              {weeklyPoints > 0 ? `+${weeklyPoints.toLocaleString()}P` : "0P"}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">이번 달 획득</p>
            <p className="text-xl font-bold text-green-600">
              {monthlyPoints > 0 ? `+${monthlyPoints.toLocaleString()}P` : "0P"}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">내 랭킹</p>
            <p className="text-xl font-bold text-primary">
              {myRank !== "-" ? `#${myRank}` : "-"}
            </p>
          </Card>
        </div>

        {/* 포인트 적립 가이드 */}
        <Card className="p-4 mb-6 bg-accent/30">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            포인트 적립 가이드
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• 맛집 등록: <span className="font-medium text-foreground">500P</span> (사진 포함 시 +1,000P)</li>
            <li>• 후기 작성: <span className="font-medium text-foreground">500P</span></li>
            <li>• 영수증 인증: <span className="font-medium text-foreground">5,000P</span></li>
            <li>• 친구 초대: 가입 시 <span className="font-medium text-foreground">1,000P</span></li>
            <li>• 랭킹 보상: 주간/월간 순위권 진입 시</li>
          </ul>
        </Card>

        {/* 포인트 내역 */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">포인트 내역</h2>
          {isLoadingTxn ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card className="divide-y">
              {transactions.map((transaction: any) => (
                <PointTransactionItem key={transaction.id} {...transaction} />
              ))}
            </Card>
          )}
        </div>
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
