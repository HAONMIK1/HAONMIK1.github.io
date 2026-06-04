import { Button } from "@/components/ui/button";
import { UserPlus, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { NakNakLogo } from "@/components/NakNakLogo";
import { Badge } from "@/components/ui/badge";

interface TopHeaderProps {
  onInviteFriendClick?: () => void;
  onSearchClick?: () => void;
  onFriendsClick?: () => void;
  friendsCount?: number;
  className?: string;
}

export default function TopHeader({
  onInviteFriendClick,
  onSearchClick,
  onFriendsClick,
  friendsCount = 0,
  className,
}: TopHeaderProps) {

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background border-b border-border",
        className
      )}
      data-testid="top-header"
    >
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3" data-testid="logo-container">
          <h1 className="text-2xl font-bold">낙낙</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {onFriendsClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFriendsClick}
              className="gap-2 relative"
              data-testid="button-friends"
            >
              <Users className="w-4 h-4" />
              <span>친구</span>
              {friendsCount > 0 && (
                <Badge 
                  variant="default" 
                  className="ml-1 px-1.5 py-0 h-5 text-xs"
                  data-testid="badge-friends-count"
                >
                  {friendsCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
