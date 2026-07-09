import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Star, ExternalLink, Heart, Trash2, UtensilsCrossed } from "lucide-react";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import { Button } from "@/components/ui/button";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  userId: number;
  nickname: string;
  content: string;
  rating: number;
  imageUrls: string[];
  createdAt: string;
}

export default function RestaurantDetailPage({ onNavigate, restaurantId }: RestaurantDetailPageProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // 리뷰 삭제 버튼을 보여줄지 판단하기 위한 내 계정 정보
  const { data: myId } = useQuery({
    queryKey: ["user", "me", "id"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/users/me");
      const json = await res.json();
      return json.data?.id as number;
    },
    retry: false,
  });

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm("이 후기를 삭제할까요?")) return;
    try {
      await apiRequest("DELETE", `/api/v1/reviews/${reviewId}`);
      queryClient.invalidateQueries({ queryKey: ["restaurant", restaurantId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user", "me", "reviews"] });
      toast({ title: "후기를 삭제했어요" });
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const ratingAverage = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const { isSaved, toggleSave } = useSavedRestaurants(restaurantId);
  const handleToggleSave = () => {
    if (restaurantId) toggleSave(restaurantId);
  };

  if (isLoadingRestaurant) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
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
      <TopHeader onInviteFriendClick={() => setShowInviteDialog(true)} />

      <div className="max-w-2xl mx-auto">
        <div className="px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2 -ml-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
        </div>

        {/* 맛집 헤더 */}
        <div className="px-4 mt-2">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleSave}
              className="flex-shrink-0 -mt-1"
              data-testid={`button-save-restaurant-${restaurant.id}`}
            >
              <Heart className={`w-6 h-6 ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge variant="secondary">{restaurant.category}</Badge>
            {reviews.length > 0 && (
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{ratingAverage.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews.length})</span>
              </span>
            )}
          </div>

          <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{restaurant.address}</p>
          </div>

          {restaurant.naverPlaceUrl && (
            <Button
              variant="outline"
              className="gap-2 mb-2"
              style={{ borderColor: "#03C75A", color: "#03C75A" }}
              onClick={() => window.open(restaurant.naverPlaceUrl, "_blank")}
              data-testid="button-naver-place"
            >
              <ExternalLink className="w-4 h-4" />
              네이버에서 보기
            </Button>
          )}
        </div>

        <div className="h-px bg-border mx-4 my-4" />

        {/* 후기 목록 */}
        <div className="px-4">
          <h2 className="text-base font-bold text-foreground mb-3">후기 {reviews.length}개</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">아직 작성된 후기가 없어요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="border-none shadow-none bg-transparent" data-testid={`review-card-${review.id}`}>
                  <CardContent className="p-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarFallback className="text-xs font-bold bg-muted">
                          {review.nickname[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{review.nickname}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {myId === review.userId && (
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-muted-foreground hover:text-destructive flex-shrink-0"
                              data-testid={`button-delete-review-${review.id}`}
                              aria-label="후기 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {review.imageUrls[0] && (
                          <div className="w-full aspect-video rounded-lg overflow-hidden mt-2 mb-2 bg-muted">
                            <img
                              src={review.imageUrls[0]}
                              alt={`${review.nickname}님의 후기 사진`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <p className="text-sm text-foreground leading-relaxed mt-1">{review.content}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <InviteFriendDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />
      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
