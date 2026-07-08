import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { apiRequest } from "@/lib/queryClient";
import { Bookmark, BookmarkX, Loader2, MapPin, UtensilsCrossed } from "lucide-react";

interface SavedRestaurantsPageProps {
  onNavigate?: (id: string) => void;
}

interface RestaurantItem {
  id: number;
  name: string;
  category: string;
  address: string;
}

export default function SavedRestaurantsPage({ onNavigate }: SavedRestaurantsPageProps = {}) {
  const [, setLocation] = useLocation();
  const { savedIds, toggleSave } = useSavedRestaurants();

  // 로컬(localStorage)에 저장된 id들을 실제 맛집 상세 API로 조회
  const { data: restaurantsData, isLoading } = useQuery({
    queryKey: ["restaurants", "saved", savedIds],
    queryFn: async () => {
      const results = await Promise.all(
        savedIds.map(async (id) => {
          try {
            const res = await apiRequest("GET", `/api/v1/restaurants/${id}`);
            const json = await res.json();
            return json.data as RestaurantItem;
          } catch {
            return null;
          }
        })
      );
      return results.filter((r): r is RestaurantItem => r !== null);
    },
    enabled: savedIds.length > 0,
  });

  const restaurants = restaurantsData ?? [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />

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
            <p className="text-sm text-muted-foreground">맘에 드는 맛집을 저장해보세요</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {restaurants.map((r) => (
              <Card
                key={r.id}
                className="p-4 hover-elevate cursor-pointer"
                onClick={() => setLocation(`/restaurant/${r.id}`)}
                data-testid={`saved-${r.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted flex-shrink-0">
                    <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{r.name}</p>
                      <Badge variant="secondary" className="text-xs shrink-0">{r.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {r.address}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(String(r.id));
                    }}
                    data-testid={`unsave-${r.id}`}
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
