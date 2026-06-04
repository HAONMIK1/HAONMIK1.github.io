import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ExternalLink, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";

interface Review {
  userId: string;
  nickname: string;
  distance: number;
  rating: number;
  recommendMenu: string;
  hashTag?: string;
  content: string;
  photoUrl?: string;
  createdAt: string;
}

interface RestaurantWithReviewsProps {
  restaurantId: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  roadAddress?: string;
  category: string;
  placeUrl?: string;
  ratingAverage?: number;
  reviews: Review[];
  onClick?: () => void;
  className?: string;
}

export default function RestaurantWithReviews({
  restaurantId,
  name,
  address,
  category,
  placeUrl,
  ratingAverage = 0,
  reviews = [],
  onClick,
  className,
}: RestaurantWithReviewsProps) {
  const reviewCount = reviews.length;
  const { isSaved, toggleSave } = useSavedRestaurants(restaurantId);

  // 저장/삭제 토글 핸들러
  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(restaurantId);
  };

  const getDistanceBadgeText = (distance: number) => {
    return `${distance}촌`;
  };

  const getDistanceBadgeVariant = (distance: number): "default" | "secondary" | "outline" => {
    if (distance === 1) return "default";
    if (distance === 2) return "secondary";
    return "outline";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 30) return `${diffDays}일 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <Card
      className={cn("overflow-hidden transition-all hover-elevate cursor-pointer", className)}
      onClick={onClick}
      data-testid={`card-restaurant-${restaurantId}`}
    >
      {/* 음식점 정보 헤더 */}
      <div className="p-4 space-y-2 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
            <div className="flex items-center gap-2 mb-2">
              {ratingAverage > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">{ratingAverage.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{reviewCount}개 후기</span>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSave}
            data-testid={`button-save-restaurant-${restaurantId}`}
            className="flex-shrink-0"
          >
            <Heart 
              className={cn(
                "w-5 h-5",
                isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )} 
            />
          </Button>
        </div>

        <Badge variant="outline" className="text-xs">
          {category}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{address}</span>
        </div>
        {placeUrl && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={(e) => {
              e.stopPropagation();
              window.open(placeUrl, "_blank");
            }}
            data-testid="button-kakao-map"
          >
            <ExternalLink className="w-4 h-4" />
            카카오맵에서 보기
          </Button>
        )}
      </div>

      {/* 리뷰 카드들 - 가로 슬라이드 (사진 + 리뷰 세트) */}
      {reviews.length > 0 && (
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 p-4">
            {reviews.map((review, index) => (
              <div
                key={`${review.userId}-${index}`}
                className="flex-shrink-0 w-72"
              >
                {/* 리뷰 사진 */}
                {review.photoUrl && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-3">
                    <img
                      src={review.photoUrl}
                      alt={`${review.nickname}님의 후기`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 리뷰 내용 */}
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                        {review.nickname[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {review.nickname}
                        </span>
                        <Badge
                          variant={getDistanceBadgeVariant(review.distance)}
                          className="text-xs flex-shrink-0"
                        >
                          {getDistanceBadgeText(review.distance)}
                        </Badge>
                      </div>

                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3.5 h-3.5",
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {review.recommendMenu && (
                    <p className="text-sm font-medium text-foreground">
                      추천메뉴: {review.recommendMenu}
                    </p>
                  )}

                  <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                    {review.content}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 3 && (
        <div 
          className="p-3 text-center bg-muted/30 hover-elevate cursor-pointer"
          onClick={onClick}
          data-testid="button-more-reviews"
        >
          <span className="text-xs text-muted-foreground">
            +{reviews.length - 3}개의 후기 더보기
          </span>
        </div>
      )}
    </Card>
  );
}
