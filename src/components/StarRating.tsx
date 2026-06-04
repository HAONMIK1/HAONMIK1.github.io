import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = false,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const filled = index < Math.floor(rating);
          const halfFilled = index < rating && index >= Math.floor(rating);

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              disabled={!interactive}
              className={cn(
                "relative",
                interactive && "cursor-pointer hover-elevate active-elevate-2 rounded-sm"
              )}
              data-testid={`star-${index + 1}`}
            >
              {halfFilled ? (
                <div className="relative">
                  <Star className={cn(sizeClasses[size], "text-muted-foreground")} />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                    <Star className={cn(sizeClasses[size], "text-yellow-500 fill-yellow-500")} />
                  </div>
                </div>
              ) : (
                <Star
                  className={cn(
                    sizeClasses[size],
                    filled ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
