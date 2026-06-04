import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import FollowButton from "./FollowButton";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileCardProps {
  userId: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  hasLicense?: boolean;
  stats: {
    restaurants: number;
    reviews: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
  onFollowChange?: (following: boolean) => void;
  onClick?: () => void;
  className?: string;
}

export default function UserProfileCard({
  userId,
  name,
  bio,
  avatarUrl,
  hasLicense = false,
  stats,
  isFollowing = false,
  onFollowChange,
  onClick,
  className,
}: UserProfileCardProps) {
  return (
    <Card
      className={cn("p-6", className)}
      onClick={onClick}
      data-testid={`card-user-${userId}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-2xl">{name[0]}</AvatarFallback>
          </Avatar>
          {hasLicense && (
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5">
              <Crown className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
        {hasLicense && (
          <Badge variant="default" className="gap-1 mb-2">
            <Crown className="w-3 h-3" />
            공식 평론가
          </Badge>
        )}
        
        {bio && (
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">{bio}</p>
        )}

        <div className="flex gap-6 mb-4 w-full justify-center">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">{stats.restaurants}</span>
            <span className="text-xs text-muted-foreground">맛집</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">{stats.reviews}</span>
            <span className="text-xs text-muted-foreground">후기</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">{stats.followers}</span>
            <span className="text-xs text-muted-foreground">팔로워</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground">{stats.following}</span>
            <span className="text-xs text-muted-foreground">팔로잉</span>
          </div>
        </div>

        <FollowButton
          userId={userId}
          initialFollowing={isFollowing}
          onFollowChange={onFollowChange}
          size="default"
        />
      </div>
    </Card>
  );
}
