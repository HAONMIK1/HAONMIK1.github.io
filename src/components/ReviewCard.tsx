import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StarRating from "./StarRating";
import { Crown, Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ReviewCardProps {
  id: string;
  author: {
    name: string;
    avatarUrl?: string;
    hasLicense?: boolean;
  };
  restaurantName: string;
  rating: number;
  content: string;
  photos: string[];
  timestamp: string;
  likes?: number;
  comments?: number;
  hashtags?: string[];
  className?: string;
}

export default function ReviewCard({
  id,
  author,
  restaurantName,
  rating,
  content,
  photos,
  timestamp,
  likes = 0,
  comments = 0,
  hashtags = [],
  className,
}: ReviewCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <Card className={cn("p-4", className)} data-testid={`card-review-${id}`}>
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={author.avatarUrl} />
          <AvatarFallback>{author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{author.name}</span>
            {author.hasLicense && (
              <Badge variant="default" className="gap-1 text-xs">
                <Crown className="w-3 h-3" />
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{restaurantName}</span>
            <span>·</span>
            <span>{timestamp}</span>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <StarRating rating={rating} size="md" />
      </div>

      {photos.length > 0 && (
        <div className={cn(
          "grid gap-1 mb-3 rounded-lg overflow-hidden",
          photos.length === 1 && "grid-cols-1",
          photos.length === 2 && "grid-cols-2",
          photos.length >= 3 && "grid-cols-3"
        )}>
          {photos.slice(0, 3).map((photo, index) => (
            <div
              key={index}
              className={cn(
                "relative aspect-square",
                photos.length === 1 && "col-span-1 aspect-video"
              )}
            >
              <img
                src={photo}
                alt={`리뷰 사진 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <p className="text-base text-foreground mb-2 leading-relaxed">{content}</p>

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hashtags.map((tag, index) => (
            <span key={index} className="text-sm text-primary">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 hover-elevate active-elevate-2 rounded-md px-2 py-1"
          data-testid={`button-like-${id}`}
        >
          <Heart
            className={cn(
              "w-5 h-5",
              isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
            )}
          />
          <span className="text-sm text-muted-foreground">{likeCount}</span>
        </button>
        <button
          className="flex items-center gap-1.5 hover-elevate active-elevate-2 rounded-md px-2 py-1"
          data-testid={`button-comment-${id}`}
        >
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{comments}</span>
        </button>
      </div>
    </Card>
  );
}
