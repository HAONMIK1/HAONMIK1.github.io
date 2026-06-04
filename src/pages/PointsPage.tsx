import { useLocation } from "wouter";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import PointsDisplay from "@/components/PointsDisplay";
import PointTransactionItem from "@/components/PointTransactionItem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Gift, TrendingUp } from "lucide-react";

interface PointsPageProps {
  onNavigate?: (id: string) => void;
}

export default function PointsPage({ onNavigate }: PointsPageProps = {}) {

  //todo: remove mock functionality
  const mockTransactions = [
    {
      id: "txn1",
      type: "earn" as const,
      description: "맛집 등록 (사진 포함)",
      amount: 1500,
      timestamp: "2시간 전",
      icon: "restaurant" as const,
    },
    {
      id: "txn2",
      type: "earn" as const,
      description: "후기 작성",
      amount: 500,
      timestamp: "5시간 전",
      icon: "review" as const,
    },
    {
      id: "txn3",
      type: "earn" as const,
      description: "영수증 인증",
      amount: 5000,
      timestamp: "1일 전",
      icon: "receipt" as const,
    },
    {
      id: "txn4",
      type: "earn" as const,
      description: "친구 초대",
      amount: 1000,
      timestamp: "2일 전",
      icon: "referral" as const,
    },
    {
      id: "txn5",
      type: "earn" as const,
      description: "맛집 등록",
      amount: 500,
      timestamp: "3일 전",
      icon: "restaurant" as const,
    },
    {
      id: "txn6",
      type: "earn" as const,
      description: "주간 랭킹 보너스",
      amount: 3000,
      timestamp: "5일 전",
      icon: "referral" as const,
    },
  ];

  const totalPoints = mockTransactions.reduce((sum, txn) => 
    txn.type === "earn" ? sum + txn.amount : sum - txn.amount, 0
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader
        location="강남구"
        notificationCount={0}
        onLocationClick={() => {}}
        onNotificationClick={() => {}}
        onSearch={() => {}}
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

        <Card className="p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">보유 포인트</p>
            <PointsDisplay points={totalPoints} size="lg" className="justify-center mb-4" />
            <div className="flex gap-2 justify-center">
              <Button variant="default" className="gap-2" data-testid="button-use-points">
                <Gift className="w-4 h-4" />
                쿠폰 구매
              </Button>
              <Button variant="outline" className="gap-2" data-testid="button-earn-more">
                <TrendingUp className="w-4 h-4" />
                더 모으기
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">이번 주 획득</p>
            <p className="text-2xl font-bold text-green-600">+2,000P</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">이번 달 획득</p>
            <p className="text-2xl font-bold text-green-600">+11,500P</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">내 랭킹</p>
            <p className="text-2xl font-bold text-primary">#12</p>
          </Card>
        </div>

        <Card className="p-4 mb-4 bg-accent/30">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            포인트 적립 가이드
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• 맛집 등록: 500P (사진 포함 시 +1,000P)</li>
            <li>• 후기 작성: 500P</li>
            <li>• 영수증 인증: 5,000P</li>
            <li>• 친구 초대: 가입 시 1,000P</li>
            <li>• 랭킹 보상: 주간/월간 순위권 진입 시</li>
          </ul>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">포인트 내역</h2>
          <Card className="divide-y">
            {mockTransactions.map((transaction) => (
              <PointTransactionItem key={transaction.id} {...transaction} />
            ))}
          </Card>
        </div>
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
