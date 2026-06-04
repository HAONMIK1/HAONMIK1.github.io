import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Star } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface RankingsPageProps {
  onNavigate?: (id: string) => void;
}

export default function RankingsPage({ onNavigate }: RankingsPageProps = {}) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("weekly");
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const generateFallbackRankings = (basePoints: number, count: number = 20) => {
    const names = ["김민수","이지은","박지성","최영희","정민호","송지은","강동원","한지민","윤아","태연","수지","아이유","지디","빅뱅","엑소","방탄","트와이스","레드벨벳","블랙핑크","뉴진스"];
    return Array.from({ length: count }, (_, i) => ({
      rank: i + 1,
      user: { name: names[i % names.length] },
      points: basePoints - (i * 800),
    }));
  };

  const { data: weeklyData } = useQuery({
    queryKey: ["rankings", "weekly"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/rankings?type=weekly`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("주간 랭킹 조회 실패");
      return response.json();
    },
    retry: false,
  });

  const { data: monthlyData } = useQuery({
    queryKey: ["rankings", "monthly"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/rankings?type=monthly`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("월간 랭킹 조회 실패");
      return response.json();
    },
    retry: false,
  });

  const weeklyRankings = weeklyData?.rankings ?? generateFallbackRankings(12500, 20);
  const monthlyRankings = monthlyData?.rankings ?? generateFallbackRankings(25000, 20);

  const myRank = {
    weekly: weeklyData?.myRank ?? { rank: 7, points: 8500 },
    monthly: monthlyData?.myRank ?? { rank: 12, points: 18200 },
  };

  const currentRank = activeTab === "weekly" ? myRank.weekly : myRank.monthly;

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader
        onInviteFriendClick={() => setShowInviteDialog(true)}
        onSearchClick={() => setLocation("/search")}
      />

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">랭킹</h1>
            <p className="text-sm text-muted-foreground">쩝쩝박사 리더보드</p>
          </div>
        </div>

        {/* 내 순위 카드 */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary"></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">내 순위</p>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">{currentRank.points.toLocaleString()}P</span>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">15개 맛집</span>
                </div>
              </div>
            </div>
            <div className="text-5xl font-bold text-primary">
              #{currentRank.rank}
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="weekly" data-testid="tab-weekly">주간</TabsTrigger>
            <TabsTrigger value="monthly" data-testid="tab-monthly">월간</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-0 space-y-2">
            {weeklyRankings.map((ranking) => (
              <Card
                key={ranking.rank}
                className="p-4 hover-elevate cursor-pointer"
                data-testid={`weekly-rank-${ranking.rank}`}
                onClick={() => ranking.user?.id && setLocation(`/profile/${ranking.user.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 text-center">
                    <Badge 
                      variant={ranking.rank <= 3 ? "default" : "secondary"} 
                      className="text-sm font-bold"
                    >
                      {ranking.rank}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{ranking.user.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{ranking.points.toLocaleString()}P</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="monthly" className="mt-0 space-y-2">
            {monthlyRankings.map((ranking) => (
              <Card
                key={ranking.rank}
                className="p-4 hover-elevate cursor-pointer"
                data-testid={`monthly-rank-${ranking.rank}`}
                onClick={() => ranking.user?.id && setLocation(`/profile/${ranking.user.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 text-center">
                    <Badge 
                      variant={ranking.rank <= 3 ? "default" : "secondary"} 
                      className="text-sm font-bold"
                    >
                      {ranking.rank}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{ranking.user.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{ranking.points.toLocaleString()}P</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <InviteFriendDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
