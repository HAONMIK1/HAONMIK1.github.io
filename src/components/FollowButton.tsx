import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  onFollowChange?: (following: boolean) => void;
  size?: "sm" | "default" | "lg";
}

export default function FollowButton({
  userId,
  initialFollowing = false,
  onFollowChange,
  size = "default",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);

  const handleClick = () => {
    const newState = !isFollowing;
    setIsFollowing(newState);
    onFollowChange?.(newState);
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size={size}
      onClick={handleClick}
      className="gap-1.5"
      data-testid={`button-follow-${userId}`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          <span>팔로잉</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>팔로우</span>
        </>
      )}
    </Button>
  );
}
