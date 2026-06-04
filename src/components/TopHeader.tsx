import { Button } from "@/components/ui/button";
import { Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { NakNakLogo } from "@/components/NakNakLogo";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface TopHeaderProps {
  onInviteFriendClick?: () => void;
  onSearchClick?: () => void;
  onFriendsClick?: () => void;
  friendsCount?: number;
  className?: string;
  // legacy props (unused, kept for compat)
  location?: string;
  notificationCount?: number;
  onLocationClick?: () => void;
  onNotificationClick?: () => void;
  onSearch?: () => void;
}

export default function TopHeader({
  onInviteFriendClick,
  onSearchClick,
  onFriendsClick,
  friendsCount = 0,
  className,
}: TopHeaderProps) {
  const [, setLocation] = useLocation();

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    } else {
      setLocation("/search");
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border",
        className
      )}
      data-testid="top-header"
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2" data-testid="logo-container">
          <NakNakLogo size={28} />
          <h1 className="text-xl font-bold tracking-tight">낙낙</h1>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchClick}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-header-search"
          >
            <Search className="w-5 h-5" />
          </Button>

          {onFriendsClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFriendsClick}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              data-testid="button-friends"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">친구</span>
              {friendsCount > 0 && (
                <Badge
                  variant="default"
                  className="px-1.5 py-0 h-4 text-xs min-w-[16px]"
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
