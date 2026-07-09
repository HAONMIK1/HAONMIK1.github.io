import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Loader2, MessageCircle } from "lucide-react";
import InviteFriendDialog from "./InviteFriendDialog";
import { apiRequest } from "@/lib/queryClient";

interface SearchedUser {
  id: number;
  nickname: string;
  email: string;
}

interface FriendsManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FriendsManagementDialog({ open, onOpenChange }: FriendsManagementDialogProps) {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchedUser[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    try {
      const res = await apiRequest("GET", `/api/v1/users/search?keyword=${encodeURIComponent(keyword.trim())}`);
      const body = await res.json();
      setResults((body.data ?? []) as SearchedUser[]);
    } catch {
      setResults([]);
      toast({ title: "검색 실패", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollow = (user: SearchedUser) => {
    toast({
      title: "팔로우 기능은 준비 중이에요",
      description: `${user.nickname}님을 팔로우하는 기능은 곧 추가될 예정이에요.`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md" data-testid="dialog-friends-management">
          <DialogHeader>
            <DialogTitle className="text-xl">친구 찾기</DialogTitle>
            <DialogDescription>닉네임으로 친구를 검색해보세요</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="닉네임으로 검색"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                  data-testid="input-search-friends"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching} data-testid="button-search-friends">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "검색"}
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {results === null ? null : results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">검색 결과가 없어요</div>
              ) : (
                results.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover-elevate"
                    data-testid={`user-item-${user.id}`}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.nickname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="flex-1 min-w-0 font-semibold truncate">{user.nickname}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFollow(user)}
                      data-testid={`button-follow-${user.id}`}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      팔로우
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-4">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setInviteDialogOpen(true)}
                data-testid="button-invite-kakao"
              >
                <MessageCircle className="w-4 h-4" />
                카카오톡으로 친구 초대하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InviteFriendDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
    </>
  );
}
