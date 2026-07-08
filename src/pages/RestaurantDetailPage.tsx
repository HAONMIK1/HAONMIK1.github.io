import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Star, ExternalLink, MessageSquare, Heart, UtensilsCrossed } from "lucide-react";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import { Button } from "@/components/ui/button";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

interface RestaurantDetailPageProps {
  onNavigate?: (id: string) => void;
  restaurantId?: string;
}

interface RestaurantDetail {
  id: number;
  name: string;
  category: string;
  address: string;
  naverPlaceUrl?: string;
}

interface ReviewItem {
  id: number;
  restaurantId: number;
  nickname: string;
  content: string;
  rating: number;
  imageUrls: string[];
  createdAt: string;
}

export default function RestaurantDetailPage({ onNavigate, restaurantId }: RestaurantDetailPageProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // 식당 상세 API
  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery<RestaurantDetail>({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/v1/restaurants/${restaurantId}`);
      const json = await response.json();
      return json.data as RestaurantDetail;
    },
    enabled: !!restaurantId,
    retry: false,
  });

  // 후기 목록 API
  const { data: allReviews } = useQuery<ReviewItem[]>({
    queryKey: ["restaurant", restaurantId, "reviews"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/v1/restaurants/${restaurantId}/reviews`);
      const json = await response.json();
      return (json.data?.content ?? []) as ReviewItem[];
    },
    enabled: !!restaurantId,
    retry: false,
  });

  const reviews = allReviews ?? [];

  // 별점 평균/분포는 실제 리뷰에서 직접 집계
  const ratingAverage = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { stars, count, percentage };
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const { isSaved, toggleSave } = useSavedRestaurants(restaurantId);

  const handleToggleSave = () => {
    if (restaurantId) toggleSave(restaurantId);
  };

  const renderReviewCard = (review: ReviewItem) => (
    <Card
      key={review.id}
      data-testid={`review-card-${review.id}`}
    >
      <CardContent className="p-4">
        {review.imageUrls[0] && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
            <img
              src={review.imageUrls[0]}
              alt={`${review.nickname}님의 후기 사진`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="text-sm font-bold">
              {review.nickname[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <span className="font-semibold text-sm text-foreground mb-1.5 block">
              {review.nickname}
            </span>

            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                  }`}
                />
              ))}
            </div>

            <p className="text-sm text-foreground leading-relaxed mb-1">
              {review.content}
            </p>

            <p className="text-xs text-muted-foreground">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoadingRestaurant) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-destructive">맛집 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader
        onInviteFriendClick={() => setShowInviteDialog(true)}
      />

      <div className="max-w-5xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <div className="px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
        </div>

        {/* 음식점 기본 정보 */}
        <div className="px-4 mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">{restaurant.name}</h1>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="secondary">{restaurant.category}</Badge>
                    {reviews.length > 0 && (
                      <>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-sm">{ratingAverage.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({reviews.length}개 후기)</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleSave}
                  data-testid={`button-save-restaurant-${restaurant.id}`}
                  className="flex-shrink-0"
                >
                  <Heart
                    className={`w-6 h-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                  />
                </Button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-foreground">{restaurant.address}</p>
                </div>
              </div>

              {restaurant.naverPlaceUrl && (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="gap-2"
                    style={{ backgroundColor: "#03C75A" }}
                    onClick={() => window.open(restaurant.naverPlaceUrl, "_blank")}
                    data-testid="button-naver-place"
                  >
                    <ExternalLink className="w-4 h-4" />
                    네이버에서 보기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 별점 통계 */}
        {reviews.length > 0 && (
          <div className="px-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground mb-1">
                      {ratingAverage.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1 justify-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(ratingAverage)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {reviews.length}개의 후기
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    {ratingDistribution.map((dist) => (
                      <div key={dist.stars} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-12">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">{dist.stars}</span>
                        </div>
                        <Progress value={dist.percentage} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {dist.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 후기 목록 */}
        <div className="px-4 mt-4">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            후기 ({reviews.length})
          </h2>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>아직 작성된 후기가 없습니다.</p>
              </div>
            ) : (
              reviews.map((review) => renderReviewCard(review))
            )}
          </div>
        </div>
      </div>

      <InviteFriendDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
