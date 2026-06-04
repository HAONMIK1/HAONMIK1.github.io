import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFeedItemProps {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
    hasLicense?: boolean;
  };
  action: string;
  target: string;
  timestamp: string;
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
}

export default function ActivityFeedItem({
  id,
  user,
  action,
  target,
  timestamp,
  imageUrl,
  onClick,
  className,
}: ActivityFeedItemProps) {
  return (
    <div
      className={cn(
        "flex gap-3 p-4 hover-elevate active-elevate-2 cursor-pointer rounded-lg",
        className
      )}
      onClick={onClick}
      data-testid={`activity-${id}`}
    >
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={user.avatarUrl} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <div className="flex-1">
            <span className="font-semibold text-foreground">{user.name}</span>
            {user.hasLicense && (
              <Crown className="w-3 h-3 text-primary inline ml-1" />
            )}
            <span className="text-foreground ml-1">{action}</span>
            <span className="font-medium text-foreground ml-1">{target}</span>
          </div>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={target}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  );
}
