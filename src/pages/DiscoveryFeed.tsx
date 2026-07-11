import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import RestaurantMapView, { MapPlace, ReviewListItem } from "@/components/RestaurantMapView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { List, Map as MapIcon, Plus, Star, UtensilsCrossed } from "lucide-react";

type NetworkFilter = "1st" | "2nd" | "3rd";

const FILTER_LABELS: Record<NetworkFilter, string> = {
  "1st": "1촌",
  "2nd": "2촌",
  "3rd": "3촌+",
};

interface ReviewItem {
  id: number;
  restaurantId: number;
  restaurantName: string;
  userId: number;
  nickname: string;
  content: string;
  rating: number;
  imageUrls: string[];
  createdAt: string;
}

interface RestaurantDetail {
  id: number;
  name: string;
  category: string;
  address: string;
  latitude?: number;
  longitude?: number;
  naverPlaceUrl?: string;
}

interface DiscoveryFeedProps {
  onNavigate?: (id: string) => void;
}

export default function DiscoveryFeed({ onNavigate }: DiscoveryFeedProps = {}) {
  const [, setLocation] = useLocation();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [networkFilters, setNetworkFilters] = useState<NetworkFilter[]>(["1st", "2nd", "3rd"]);
  const { savedIds } = useSavedRestaurants();

  const toggleFilter = (filter: NetworkFilter) => {
    setNetworkFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  // 팔로우 기반 피드 API가 아직 없어서, 지금 보여줄 수 있는 실제 데이터는 내 후기뿐이다.
  // 피드 API가 생기면 이 쿼리만 교체하면 된다.
  const { data: reviewsData } = useQuery({
    queryKey: ["user", "me", "reviews"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/users/me/reviews");
      const json = await res.json();
      return (json.data?.content ?? []) as ReviewItem[];
    },
    retry: false,
  });
  const reviews = reviewsData ?? [];

  const { data: myId } = useQuery({
    queryKey: ["user", "me", "id"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/users/me");
      const json = await res.json();
      return json.data?.id as number;
    },
    retry: false,
  });

  const { data: followingIdsData } = useQuery({
    queryKey: ["user", "me", "following"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/users/me/following");
      const json = await res.json();
      return (json.data ?? []) as number[];
    },
    retry: false,
  });
  const followingIds = followingIdsData ?? [];

  // 지도 핀: 내가 후기 쓴 맛집 + 저장한 맛집 (상세 API에 좌표가 있다)
  const restaurantIds = Array.from(
    new Set([...reviews.map((r) => String(r.restaurantId)), ...savedIds])
  );
  const { data: restaurantsData } = useQuery({
    queryKey: ["restaurants", "byIds", restaurantIds],
    queryFn: async () => {
      const results = await Promise.all(
        restaurantIds.map(async (id) => {
          try {
            const res = await apiRequest("GET", `/api/v1/restaurants/${id}`);
            const json = await res.json();
            return json.data as RestaurantDetail;
          } catch {
            return null;
          }
        })
      );
      return results.filter((r): r is RestaurantDetail => r !== null);
    },
    enabled: restaurantIds.length > 0,
  });
  const restaurants = restaurantsData ?? [];

  const ratingByRestaurant = new Map<number, number>();
  restaurants.forEach((r) => {
    const mine = reviews.filter((rev) => rev.restaurantId === r.id);
    if (mine.length > 0) {
      ratingByRestaurant.set(r.id, mine.reduce((s, rev) => s + rev.rating, 0) / mine.length);
    }
  });

  const mapPlaces: MapPlace[] = restaurants
    .filter((r) => typeof r.latitude === "number" && typeof r.longitude === "number")
    .map((r) => ({
      restaurantId: String(r.id),
      name: r.name,
      category: r.category,
      address: r.address,
      ratingAverage: ratingByRestaurant.get(r.id),
      lat: r.latitude as number,
      lng: r.longitude as number,
      naverPlaceUrl: r.naverPlaceUrl,
    }));

  const noFilterSelected = networkFilters.length === 0;
  const visibleReviews = noFilterSelected ? [] : reviews;
  const visiblePlaces = noFilterSelected ? [] : mapPlaces;

  const reviewItems: ReviewListItem[] = visibleReviews.map((r) => ({
    reviewId: r.id,
    restaurantId: String(r.restaurantId),
    restaurantName: r.restaurantName,
    userId: r.userId,
    nickname: r.nickname,
    rating: r.rating,
  }));

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader onInviteFriendClick={() => setShowInviteDialog(true)} />

      <div className="max-w-2xl mx-auto p-4 space-y-5">
        {/* 리스트 / 지도 보기 전환 */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-muted p-1" data-testid="view-toggle">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-5 py-1.5 rounded-full text-sm font-semibold transition-all",
                viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
              data-testid="view-list"
            >
              <List className="w-4 h-4" /> 리스트
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={cn(
                "flex items-center gap-1.5 px-5 py-1.5 rounded-full text-sm font-semibold transition-all",
                viewMode === "map" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
              data-testid="view-map"
            >
              <MapIcon className="w-4 h-4" /> 지도
            </button>
          </div>
        </div>

        {/* 네트워크 필터 (복수 선택 토글) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">네트워크 필터</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary h-auto p-0"
              onClick={() => setNetworkFilters(["1st", "2nd", "3rd"])}
              data-testid="button-filter-reset"
            >
              전체 선택
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["1st", "bg-primary/10 dark:bg-primary/20 border-primary text-primary"],
                ["2nd", "bg-green-50 dark:bg-green-950/30 border-green-500 text-green-600 dark:text-green-400"],
                ["3rd", "bg-purple-50 dark:bg-purple-950/30 border-purple-500 text-purple-600 dark:text-purple-400"],
              ] as [NetworkFilter, string][]
            ).map(([filter, activeClass]) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={cn(
                  "py-3 px-4 rounded-lg border-2 transition-all hover-elevate active-elevate-2",
                  networkFilters.includes(filter) ? activeClass : "bg-card border-border"
                )}
                data-testid={`filter-${filter}`}
              >
                <div className="text-center text-sm font-semibold">{FILTER_LABELS[filter]}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 피드 본문 */}
        <section>
          {viewMode === "map" ? (
            <RestaurantMapView
              places={visiblePlaces}
              reviewItems={reviewItems}
              myUserId={myId}
              followingIds={followingIds}
              heightClass="h-[55vh]"
            />
          ) : noFilterSelected ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">필터를 선택하면 맛집이 보여요</p>
            </div>
          ) : visibleReviews.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium mb-1">아직 게시물이 없어요</p>
              <p className="text-sm mb-6">첫 맛집을 등록하고 후기를 남겨보세요</p>
              <Button className="gap-2" onClick={() => onNavigate?.("add")} data-testid="button-go-add">
                <Plus className="w-4 h-4" /> 맛집 등록하기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleReviews.map((review) => (
                <Card
                  key={review.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/restaurant/${review.restaurantId}`)}
                  data-testid={`feed-review-${review.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3 mb-2">
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                        {review.imageUrls[0] ? (
                          <img
                            src={review.imageUrls[0]}
                            alt={review.restaurantName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate">
                          {review.restaurantName}
                        </h3>
                        <div className="flex items-center gap-0.5 my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/40"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {review.nickname} · {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <InviteFriendDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
