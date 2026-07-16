import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Gift, Coins, PartyPopper, Ticket } from "lucide-react";

interface RaffleDetailPageProps {
  onNavigate?: (id: string) => void;
  raffleId?: string;
}

interface RaffleDetail {
  id: number;
  title: string;
  prizeName: string;
  prizeAmountKrw: number;
  pointCostPerEntry: number;
  revealAt: string;
  status: "OPEN" | "DRAWN";
  myEntryCount: number;
  winnerNickname: string | null;
  isWinner: boolean;
  giftCode: string | null;
}

export default function RaffleDetailPage({ onNavigate, raffleId }: RaffleDetailPageProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const { data: raffle, isLoading } = useQuery({
    queryKey: ["raffles", raffleId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/v1/raffles/${raffleId}`);
      const json = await res.json();
      return json.data as RaffleDetail;
    },
    enabled: !!raffleId,
    retry: false,
  });

  const enterMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/v1/raffles/${raffleId}/entries`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raffles", raffleId] });
      queryClient.invalidateQueries({ queryKey: ["me", "wallet"] });
      toast({ title: "응모 완료!", description: "행운을 빌어요 🍀" });
    },
    onError: (error) => {
      toast({
        title: "응모에 실패했어요",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const playReveal = () => {
    setRevealing(true);
    setTimeout(() => {
      setRevealing(false);
      setRevealed(true);
    }, 1300);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (isLoading || !raffle) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopHeader />
        <div className="text-center py-20 text-muted-foreground text-sm">불러오는 중...</div>
        <BottomNavigation onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <style>{`
        @keyframes ballDrop {
          0% { transform: translateY(-160px) rotate(0deg) scale(0.85); opacity: 0; }
          55% { transform: translateY(6px) rotate(320deg) scale(1.08); opacity: 1; }
          72% { transform: translateY(-14px) rotate(340deg) scale(1); }
          86% { transform: translateY(4px) rotate(355deg) scale(1); }
          100% { transform: translateY(0) rotate(360deg) scale(1); }
        }
      `}</style>

      <TopHeader />

      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10">
            <Gift className="w-6 h-6 text-yellow-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{raffle.title}</h1>
        </div>

        <Card className="p-5 mb-4">
          <p className="text-lg font-bold text-foreground">{raffle.prizeName}</p>
          <p className="text-2xl font-extrabold text-primary mt-1">
            {raffle.prizeAmountKrw.toLocaleString()}원
          </p>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Coins className="w-4 h-4 text-yellow-500" />
              응모 1회 {raffle.pointCostPerEntry}P
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Ticket className="w-4 h-4 text-primary" />내 응모권 {raffle.myEntryCount}장
            </div>
          </div>
        </Card>

        {raffle.status === "OPEN" ? (
          <>
            <Button
              className="w-full h-12 text-base font-semibold gap-2"
              onClick={() => enterMutation.mutate()}
              disabled={enterMutation.isPending}
              data-testid="button-enter-raffle"
            >
              <Coins className="w-5 h-5" />
              {raffle.pointCostPerEntry}P로 응모하기
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              {formatDate(raffle.revealAt)}에 발표돼요. 응모권이 많을수록 당첨 확률이 올라가요.
            </p>
          </>
        ) : (
          <Card className="p-6 text-center overflow-hidden">
            {!revealed ? (
              <>
                <div className="relative h-36 flex items-end justify-center overflow-hidden rounded-xl bg-gradient-to-b from-primary/10 to-primary/5 mb-4">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 shadow-lg flex items-center justify-center text-2xl mb-2",
                      revealing && "opacity-0"
                    )}
                    style={revealing ? { animation: "ballDrop 1.3s cubic-bezier(0.34,1.56,0.64,1) forwards", opacity: 1 } : undefined}
                  >
                    🎱
                  </div>
                </div>
                <Button
                  className="gap-2"
                  onClick={playReveal}
                  disabled={revealing}
                  data-testid="button-reveal-raffle"
                >
                  <PartyPopper className="w-4 h-4" />
                  {revealing ? "추첨 중..." : "결과 확인하기"}
                </Button>
              </>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="text-5xl mb-3">🎉</div>
                {raffle.winnerNickname ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-1">당첨자</p>
                    <p className="text-2xl font-extrabold text-foreground mb-4">{raffle.winnerNickname}</p>
                  </>
                ) : (
                  <p className="text-lg font-semibold text-muted-foreground mb-4">
                    이번 회차는 응모자가 없어 당첨자가 없어요
                  </p>
                )}
                {raffle.isWinner && raffle.giftCode && (
                  <Card className="p-4 bg-primary/5 border-primary" data-testid="raffle-gift-code">
                    <p className="text-xs text-muted-foreground mb-1">축하해요! 상품권 코드예요</p>
                    <p className="text-lg font-mono font-bold text-primary">{raffle.giftCode}</p>
                  </Card>
                )}
              </div>
            )}
          </Card>
        )}
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
