import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingCardProps {
  rank: number;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    hasLicense?: boolean;
  };
  score: number;
  scoreLabel?: string;
  onClick?: () => void;
  isCurrentUser?: boolean;
  className?: string;
}

export default function RankingCard({
  rank,
  user,
  score,
  scoreLabel = "포인트",
  onClick,
  isCurrentUser = false,
  className,
}: RankingCardProps) {
  const getMedalIcon = () => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankColor = () => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <Card
      className={cn(
        "p-4 hover-elevate active-elevate-2 cursor-pointer transition-all",
        isCurrentUser && "border-primary",
        className
      )}
      onClick={onClick}
      data-testid={`card-ranking-${rank}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10">
          {rank <= 3 ? (
            getMedalIcon()
          ) : (
            <span className={cn("text-lg font-bold", getRankColor())}>
              {rank}
            </span>
          )}
        </div>

        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-foreground truncate">
              {user.name}
            </span>
            {user.hasLicense && (
              <Crown className="w-4 h-4 text-primary flex-shrink-0" />
            )}
            {isCurrentUser && (
              <Badge variant="default" className="text-xs flex-shrink-0">나</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {score.toLocaleString('ko-KR')} {scoreLabel}
          </p>
        </div>
      </div>
    </Card>
  );
}
