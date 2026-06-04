import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Utensils, UserPlus, Coins, Trophy, Bell, Loader2, CheckCheck } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface NotificationsPageProps {
  onNavigate?: (id: string) => void;
}

type NotiType = "review" | "follow" | "point" | "ranking";

interface Noti {
  id: string;
  type: NotiType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const FALLBACK_NOTIS: Noti[] = [
  { id: "n1", type: "review", title: "맛집탐방가님이 새 맛집을 등록했어요", body: "우동진 역삼점 · ★5", timestamp: "10분 전", read: false, link: "/restaurant/1" },
  { id: "n2", type: "follow", title: "쩝쩝박사님이 회원님을 팔로우해요", body: "맞팔로우하고 맛집을 공유해보세요", timestamp: "1시간 전", read: false, link: "/profile" },
  { id: "n3", type: "point", title: "포인트가 적립되었어요", body: "후기 작성 +500P", timestamp: "3시간 전", read: false, link: "/points" },
  { id: "n4", type: "ranking", title: "주간 랭킹이 올랐어요!", body: "12위 → 7위 (+5)", timestamp: "어제", read: true, link: "/rankings" },
  { id: "n5", type: "review", title: "한식러버님이 새 맛집을 등록했어요", body: "성수돈까스 · ★4.5", timestamp: "어제", read: true, link: "/restaurant/2" },
  { id: "n6", type: "point", title: "친구 초대 보너스 지급", body: "야식대장님 가입 +1,000P", timestamp: "2일 전", read: true, link: "/points" },
];

const ICONS: Record<NotiType, React.ReactNode> = {
  review: <Utensils className="w-5 h-5 text-primary" />,
  follow: <UserPlus className="w-5 h-5 text-green-600" />,
  point: <Coins className="w-5 h-5 text-yellow-500" />,
  ranking: <Trophy className="w-5 h-5 text-purple-500" />,
};

export default function NotificationsPage({ onNavigate }: NotificationsPageProps = {}) {
  const [, setLocation] = useLocation();
  const [localRead, setLocalRead] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("알림 조회 실패");
      return res.json();
    },
    retry: false,
  });

  const notis: Noti[] = data?.data ?? data?.notifications ?? FALLBACK_NOTIS;

  const isRead = (n: Noti) => n.read || localRead.has(n.id);

  const markRead = (id: string) => {
    setLocalRead((prev) => new Set(prev).add(id));
    // 백엔드 연동 시: POST /api/v1/notifications/{id}/read
    fetch(`${API_BASE_URL}/api/v1/notifications/${id}/read`, { method: "POST", headers: getAuthHeaders() }).catch(() => {});
  };

  const markAllRead = () => {
    setLocalRead(new Set(notis.map((n) => n.id)));
    fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, { method: "POST", headers: getAuthHeaders() }).catch(() => {});
  };

  const handleClick = (n: Noti) => {
    markRead(n.id);
    if (n.link) setLocation(n.link);
  };

  const unreadCount = notis.filter((n) => !isRead(n)).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader onSearchClick={() => setLocation("/search")} />

      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">알림</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `안 읽은 알림 ${unreadCount}개` : "모두 확인했어요"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={markAllRead} data-testid="button-read-all">
              <CheckCheck className="w-4 h-4" /> 모두 읽음
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : notis.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p>아직 알림이 없어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notis.map((n) => (
              <Card
                key={n.id}
                className={cn(
                  "p-4 flex items-start gap-3 hover-elevate cursor-pointer transition-colors",
                  !isRead(n) && "bg-primary/5 border-primary/20"
                )}
                onClick={() => handleClick(n)}
                data-testid={`noti-${n.id}`}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-card border shrink-0">
                  {ICONS[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !isRead(n) ? "font-semibold text-foreground" : "text-foreground")}>
                    {n.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.timestamp}</p>
                </div>
                {!isRead(n) && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
