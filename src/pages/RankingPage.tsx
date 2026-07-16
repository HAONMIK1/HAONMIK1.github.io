import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarColorClass } from "@/lib/avatarColor";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface RankingPageProps {
  onNavigate?: (id: string) => void;
}

interface RankingEntry {
  userId: number;
  nickname: string;
  totalScore: number;
  rank: number;
}

interface RankingData {
  topEntries: RankingEntry[];
  myRank: number;
}

const MEDAL_STYLE: Record<number, string> = {
  1: "bg-yellow-400 text-yellow-950",
  2: "bg-gray-300 text-gray-800",
  3: "bg-amber-600 text-amber-50",
};

export default function RankingPage({ onNavigate }: RankingPageProps = {}) {
  const [, setLocation] = useLocation();

  const { data: ranking, isLoading } = useQuery({
    queryKey: ["ranking"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/ranking");
      const json = await res.json();
      return json.data as RankingData;
    },
    retry: false,
  });

  const { data: myId } = useQuery({
    queryKey: ["user", "me", "id"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/users/me");
      const json = await res.json();
      return json.data?.id as number;
    },
    retry: false,
  });

  const topEntries = ranking?.topEntries ?? [];
  const myEntryInTop = topEntries.find((e) => e.userId === myId);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />

      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">랭킹</h1>
            <p className="text-sm text-muted-foreground">활동 점수로 매겨지는 순위예요</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">불러오는 중...</div>
        ) : topEntries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-medium mb-1">아직 랭킹이 비어있어요</p>
            <p className="text-sm">후기를 남기고 지인을 초대해서 1등을 노려보세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topEntries.map((entry) => {
              const isMe = entry.userId === myId;
              const medalClass = MEDAL_STYLE[entry.rank];
              return (
                <Card
                  key={entry.userId}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer hover-elevate",
                    isMe && "border-primary bg-primary/5"
                  )}
                  onClick={() => setLocation(`/profile/${entry.userId}`)}
                  data-testid={`ranking-entry-${entry.userId}`}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                      medalClass ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {entry.rank}
                  </div>
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback
                      className={cn(getAvatarColorClass(entry.nickname), "text-white text-sm font-bold")}
                    >
                      {entry.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="flex-1 min-w-0 text-sm font-semibold truncate">
                    {entry.nickname}
                    {isMe && <span className="text-primary font-normal"> (나)</span>}
                  </p>
                  <p className="text-sm font-bold text-foreground shrink-0">{entry.totalScore}점</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 상위 목록 밖이면 내 순위를 하단에 고정해서 안내 */}
      {ranking && !myEntryInTop && (
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 max-w-2xl mx-auto">
          <Card className="p-3 flex items-center gap-3 shadow-lg bg-card/95 backdrop-blur-sm border-primary">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
              {ranking.myRank}
            </div>
            <p className="text-sm font-medium text-muted-foreground">내 순위</p>
          </Card>
        </div>
      )}

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
