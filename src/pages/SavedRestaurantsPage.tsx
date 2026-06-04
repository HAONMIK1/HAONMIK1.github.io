import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { Bookmark, BookmarkX, Star, Loader2, MapPin } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface SavedRestaurantsPageProps {
  onNavigate?: (id: string) => void;
}

// 로컬 저장 ID를 카드로 풀어내기 위한 참조 데이터 (백엔드 미연동 시)
const KNOWN_RESTAURANTS: Record<string, any> = {
  "1": { restaurantId: "1", name: "우동진 역삼점", category: "일식", ratingAverage: 4.0, address: "강남구 테헤란로 123" },
  "2": { restaurantId: "2", name: "성수돈까스", category: "일식", ratingAverage: 4.5, address: "성동구 연무장길 45" },
  "3": { restaurantId: "3", name: "홍대 떡볶이", category: "분식", ratingAverage: 4.2, address: "마포구 양화로 123" },
  "4": { restaurantId: "4", name: "치킨 전문점", category: "치킨", ratingAverage: 4.6, address: "강남구 테헤란로 456" },
  "5": { restaurantId: "5", name: "해물 찜 전문점", category: "한식", ratingAverage: 4.4, address: "서초구 방배중앙로 89" },
  "6": { restaurantId: "6", name: "감성 카페", category: "카페", ratingAverage: 4.7, address: "강남구 압구정로 234" },
};

export default function SavedRestaurantsPage({ onNavigate }: SavedRestaurantsPageProps = {}) {
  const [, setLocation] = useLocation();
  const { savedIds, toggleSave } = useSavedRestaurants();

  // 서버 저장 목록 (백엔드 제안 엔드포인트). 실패 시 로컬 savedIds 사용
  const { data: serverSaved, isLoading } = useQuery({
    queryKey: ["restaurants", "saved"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/saved`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("저장 목록 조회 실패");
      return res.json();
    },
    retry: false,
  });

  const serverList: any[] | null = serverSaved?.data ?? serverSaved ?? null;

  // 서버 목록이 있으면 사용, 없으면 로컬 savedIds → 참조 데이터로 변환
  const restaurants: any[] = Array.isArray(serverList) && serverList.length > 0
    ? serverList
    : savedIds.map((id) => KNOWN_RESTAURANTS[id] ?? { restaurantId: id, name: "저장한 맛집", category: "기타", ratingAverage: 0, address: "" });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader onSearchClick={() => setLocation("/search")} />

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Bookmark className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">저장한 맛집</h1>
            <p className="text-sm text-muted-foreground">가보고 싶은 곳을 모아두세요</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-1">아직 저장한 맛집이 없어요</p>
            <p className="text-sm text-muted-foreground mb-6">맘에 드는 맛집을 저장해보세요</p>
            <Button onClick={() => setLocation("/")} data-testid="button-go-feed">
              맛집 둘러보기
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {restaurants.map((r) => (
              <Card
                key={r.restaurantId}
                className="p-4 hover-elevate cursor-pointer"
                onClick={() => setLocation(`/restaurant/${r.restaurantId}`)}
                data-testid={`saved-${r.restaurantId}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{r.name}</p>
                      <Badge variant="secondary" className="text-xs shrink-0">{r.category}</Badge>
                    </div>
                    {r.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {r.address}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-sm mt-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {(r.ratingAverage ?? 0).toFixed(1)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(r.restaurantId);
                    }}
                    data-testid={`unsave-${r.restaurantId}`}
                  >
                    <BookmarkX className="w-5 h-5 text-muted-foreground" />
                  </Button>
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
