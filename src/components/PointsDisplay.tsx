import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointsDisplayProps {
  points: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function PointsDisplay({ 
  points, 
  size = "md", 
  showLabel = false,
  className 
}: PointsDisplayProps) {
  const sizeClasses = {
    sm: { icon: "w-4 h-4", text: "text-sm" },
    md: { icon: "w-5 h-5", text: "text-base" },
    lg: { icon: "w-6 h-6", text: "text-lg" },
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)} data-testid="points-display">
      <Coins className={cn(sizeClasses[size].icon, "text-yellow-500")} />
      <span className={cn("font-semibold text-foreground", sizeClasses[size].text)}>
        {points.toLocaleString('ko-KR')}
        {showLabel && <span className="text-muted-foreground ml-1">P</span>}
      </span>
    </div>
  );
}
