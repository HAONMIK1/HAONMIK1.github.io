import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Gift, Coins } from "lucide-react";

interface RafflePageProps {
  onNavigate?: (id: string) => void;
}

interface RaffleSummary {
  id: number;
  title: string;
  prizeName: string;
  prizeAmountKrw: number;
  pointCostPerEntry: number;
  revealAt: string;
  status: "OPEN" | "DRAWN";
}

export default function RafflePage({ onNavigate }: RafflePageProps = {}) {
  const [, setLocation] = useLocation();

  const { data: raffles, isLoading } = useQuery({
    queryKey: ["raffles"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/raffles");
      const json = await res.json();
      return (json.data ?? []) as RaffleSummary[];
    },
    retry: false,
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />

      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10">
            <Gift className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">복권</h1>
            <p className="text-sm text-muted-foreground">포인트로 응모하고 상품권을 받아보세요</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">불러오는 중...</div>
        ) : !raffles || raffles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Gift className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-medium mb-1">진행 중인 복권이 없어요</p>
            <p className="text-sm">새로운 이벤트가 열리면 여기서 볼 수 있어요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {raffles.map((raffle) => (
              <Card
                key={raffle.id}
                className="p-4 cursor-pointer hover-elevate"
                onClick={() => setLocation(`/raffles/${raffle.id}`)}
                data-testid={`raffle-card-${raffle.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm text-foreground">{raffle.title}</h3>
                  <Badge
                    variant={raffle.status === "OPEN" ? "default" : "secondary"}
                    className={cn("shrink-0 text-[10px]", raffle.status === "OPEN" && "bg-primary")}
                  >
                    {raffle.status === "OPEN" ? "응모 중" : "발표 완료"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {raffle.prizeName} · {raffle.prizeAmountKrw.toLocaleString()}원
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Coins className="w-3.5 h-3.5 text-yellow-500" />
                    응모 1회 {raffle.pointCostPerEntry}P
                  </div>
                  <span className="text-muted-foreground">
                    {raffle.status === "OPEN" ? `${formatDate(raffle.revealAt)} 발표` : "결과 보기"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
