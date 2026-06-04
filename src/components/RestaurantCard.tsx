import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestaurantCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  rating: number;
  priceRange?: string;
  address: string;
  author: {
    name: string;
    avatarUrl?: string;
    hasLicense?: boolean;
  };
  reviewCount?: number;
  avgRating?: number;
  maxRating?: number;
  recentReview?: {
    author: string;
    recommendedMenu?: string;
    rating: number;
    text: string;
    date: string;
  };
  onClick?: () => void;
  className?: string;
}

export default function RestaurantCard({
  id,
  name,
  category,
  imageUrl,
  rating,
  address,
  reviewCount = 4,
  avgRating = 4.0,
  maxRating = 5.0,
  recentReview,
  onClick,
  className,
}: RestaurantCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer hover-elevate active-elevate-2 transition-all",
        className
      )}
      onClick={onClick}
      data-testid={`card-restaurant-${id}`}
    >
      {/* 이미지 */}
      <div className="relative aspect-[4/3]">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 콘텐츠 */}
      <div className="p-4 space-y-3">
        {/* 제목 & 평점 & 후기 수 */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm">{rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{reviewCount}개 후기</span>
            </div>
          </div>
          
          {/* 카테고리 & 주소 */}
          <Badge variant="secondary" className="mb-2">{category}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{address}</span>
          </div>
        </div>

        {/* 평균 평점 */}
        <div className="text-sm text-muted-foreground">
          모든 유저 평균 {avgRating} / {maxRating}
        </div>

        {/* 최근 후기 미리보기 */}
        {recentReview && (
          <div className="border-t pt-3 mt-3">
            <div className="flex gap-3">
              {/* 아바타 */}
              <Avatar className="w-10 h-10 flex-shrink-0 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {recentReview.author[0]}
                </AvatarFallback>
              </Avatar>

              {/* 후기 내용 */}
              <div className="flex-1 min-w-0">
                {recentReview.recommendedMenu && (
                  <p className="text-sm font-medium mb-1">
                    추천메뉴: {recentReview.recommendedMenu}
                  </p>
                )}

                {/* 별점 */}
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5",
                        i < recentReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                      )}
                    />
                  ))}
                </div>

                {/* 후기 텍스트 */}
                <p className="text-sm text-foreground line-clamp-2 mb-1">
                  {recentReview.text}
                </p>

                {/* 날짜 */}
                <p className="text-xs text-muted-foreground">{recentReview.date}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
