import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import RestaurantMapView, { MapPlace, ReviewListItem } from "@/components/RestaurantMapView";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { apiRequest } from "@/lib/queryClient";
import { getAvatarColorClass } from "@/lib/avatarColor";
import { cn } from "@/lib/utils";
import { List, Map as MapIcon, Plus, Star, UtensilsCrossed } from "lucide-react";

type NetworkFilter = "1st" | "2nd" | "3rd";

const FILTER_LABELS: Record<NetworkFilter, string> = {
  "1st": "1촌",
  "2nd": "2촌",
  "3rd": "3촌",
};

const DEGREE_BY_FILTER: Record<NetworkFilter, number> = {
  "1st": 1,
  "2nd": 2,
  "3rd": 3,
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
  imageUrls?: string[];
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

  const degrees = networkFilters.map((f) => DEGREE_BY_FILTER[f]);

  const { data: reviewsData } = useQuery({
    queryKey: ["feed", "reviews", degrees],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/v1/feed/reviews?degrees=${degrees.join(",")}`);
      const json = await res.json();
      return (json.data?.content ?? []) as ReviewItem[];
    },
    enabled: degrees.length > 0,
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

  // 리뷰에 직접 첨부한 사진이 없으면, 등록 시 네이버에서 가져온 맛집 대표 사진으로 대체한다.
  const fallbackPhotoByRestaurant = new Map<number, string>();
  const categoryByRestaurant = new Map<number, string>();
  restaurants.forEach((r) => {
    if (r.imageUrls && r.imageUrls.length > 0) {
      fallbackPhotoByRestaurant.set(r.id, r.imageUrls[0]);
    }
    categoryByRestaurant.set(r.id, r.category);
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
      imageUrl: fallbackPhotoByRestaurant.get(r.id),
    }));

  const noFilterSelected = networkFilters.length === 0;
  const visibleReviews = reviews;
  const visiblePlaces = mapPlaces;

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

      <div className="max-w-2xl mx-auto p-4 space-y-7">
        {/* 네트워크 필터 (복수 선택 토글) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 rounded-full bg-muted p-0.5" data-testid="view-toggle">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
                aria-label="리스트 보기"
                data-testid="view-list"
              >
                <List className="w-3.5 h-3.5" /> 리스트
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  viewMode === "map" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
                aria-label="지도 보기"
                data-testid="view-map"
              >
                <MapIcon className="w-3.5 h-3.5" /> 지도
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-auto p-0"
              onClick={() => setNetworkFilters(["1st", "2nd", "3rd"])}
              data-testid="button-filter-reset"
            >
              전체 선택
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                ["1st", "border-primary text-primary"],
                ["2nd", "border-green-500 text-green-600 dark:text-green-400"],
                ["3rd", "border-purple-500 text-purple-600 dark:text-purple-400"],
              ] as [NetworkFilter, string][]
            ).map(([filter, activeClass]) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={cn(
                  "py-2.5 rounded-full border transition-all hover-elevate active-elevate-2 text-center text-sm font-medium",
                  networkFilters.includes(filter) ? activeClass : "bg-transparent border-border text-muted-foreground"
                )}
                data-testid={`filter-${filter}`}
              >
                {FILTER_LABELS[filter]}
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
              heightClass="h-[68vh]"
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
            <div className="space-y-4">
              {visibleReviews.map((review) => {
                const fallback = fallbackPhotoByRestaurant.get(review.restaurantId);
                const photos = review.imageUrls.length > 0 ? review.imageUrls : fallback ? [fallback] : [];
                const category = categoryByRestaurant.get(review.restaurantId);
                return (
                  <Card
                    key={review.id}
                    className="cursor-pointer border-none shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
                    onClick={() => setLocation(`/restaurant/${review.restaurantId}`)}
                    data-testid={`feed-review-${review.id}`}
                  >
                    <CardContent className="p-4">
                      {/* 작성자를 맨 위, 크게 — "누구의 후기인지"가 가장 먼저 눈에 들어오게 */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar
                          className="w-11 h-11 shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/profile/${review.userId}`);
                          }}
                          data-testid={`feed-review-author-${review.id}`}
                        >
                          <AvatarFallback
                            className={cn(getAvatarColorClass(review.nickname), "text-white text-base font-bold")}
                          >
                            {review.nickname.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-bold text-foreground truncate hover:underline w-fit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/profile/${review.userId}`);
                            }}
                          >
                            {review.nickname}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                        </div>
                        <span className="flex items-center gap-0.5 text-sm font-bold text-foreground shrink-0">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {review.rating.toFixed(1)}
                        </span>
                      </div>

                      {/* 맛집 태그 — 어디에 대한 후기인지 */}
                      <div className="flex items-center gap-1.5 mb-2 text-sm min-w-0">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-semibold text-foreground truncate">{review.restaurantName}</span>
                        {category && (
                          <span className="text-xs text-muted-foreground shrink-0">· {category}</span>
                        )}
                      </div>

                      {/* 후기 본문 — 사진이 없을 땐 이 텍스트가 카드의 주인공 */}
                      <p
                        className={cn(
                          "text-sm text-foreground leading-relaxed",
                          photos.length > 0 ? "line-clamp-2" : "line-clamp-5"
                        )}
                      >
                        {review.content}
                      </p>

                      {/* 사진은 후기 아래에 보조 콘텐츠로 — 여러 장이면 옆으로 넘겨볼 수 있게 */}
                      {photos.length === 1 ? (
                        <div className="mt-3 rounded-xl overflow-hidden aspect-[4/3] bg-muted">
                          <img
                            src={photos[0]}
                            alt={review.restaurantName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : photos.length > 1 ? (
                        <div
                          className="mt-3 flex gap-2 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
                          data-testid={`feed-review-gallery-${review.id}`}
                        >
                          {photos.map((url, i) => (
                            <div
                              key={url + i}
                              className="w-[75%] shrink-0 snap-start rounded-xl overflow-hidden aspect-[4/3] bg-muted"
                            >
                              <img
                                src={url}
                                alt={`${review.restaurantName} 사진 ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <InviteFriendDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
