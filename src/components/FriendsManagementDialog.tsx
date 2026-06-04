import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, X, Eye, UserPlus, UserMinus, MessageCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import InviteFriendDialog from "./InviteFriendDialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface FriendsManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
}

export default function FriendsManagementDialog({
  open,
  onOpenChange,
  currentUserId = "current-user-id",
}: FriendsManagementDialogProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  // Fetch following list
  const { data: following = [], isLoading: isLoadingFollowing } = useQuery<User[]>({
    queryKey: [`/api/users/${currentUserId}/following`],
    enabled: open && !!currentUserId,
  });

  // Fetch followers list
  const { data: followers = [], isLoading: isLoadingFollowers } = useQuery<User[]>({
    queryKey: [`/api/users/${currentUserId}/followers`],
    enabled: open && !!currentUserId,
  });

  // Search users
  const { data: searchResults = [], refetch: searchUsers, isLoading: isSearching } = useQuery<User[]>({
    queryKey: [`/api/users/search?query=${searchQuery}`],
    enabled: false,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: (userId: string) => 
      apiRequest('POST', `/api/users/${userId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUserId}/following`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/search`] });
      toast({
        title: "팔로우 완료",
        description: "친구를 팔로우했습니다",
      });
    },
    onError: () => {
      toast({
        title: "팔로우 실패",
        description: "다시 시도해주세요",
        variant: "destructive",
      });
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => 
      apiRequest('DELETE', `/api/users/${userId}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUserId}/following`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/search`] });
      toast({
        title: "언팔로우 완료",
        description: "팔로우를 취소했습니다",
      });
    },
    onError: () => {
      toast({
        title: "언팔로우 실패",
        description: "다시 시도해주세요",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "검색어를 입력해주세요",
        description: "아이디를 입력하여 친구를 찾아보세요",
      });
      return;
    }
    searchUsers();
  };

  const handleFollow = (userId: string) => {
    followMutation.mutate(userId);
  };

  const handleUnfollow = (userId: string) => {
    unfollowMutation.mutate(userId);
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    onOpenChange(false);
  };

  const handleInviteFriend = () => {
    setInviteDialogOpen(true);
  };

  const isFollowingUser = (userId: string) => {
    return following.some(u => u.id === userId);
  };

  const renderUserList = (users: User[], showFollowButton: boolean = true) => {
    if (users.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>목록이 비어있습니다</p>
        </div>
      );
    }

    return users.map((user) => {
      const isFollowing = isFollowingUser(user.id);
      
      return (
        <div
          key={user.id}
          className="flex items-center justify-between p-3 hover-elevate rounded-lg"
          data-testid={`user-item-${user.id}`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{user.nickname || user.username}</p>
            </div>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewProfile(user.id)}
              data-testid={`button-view-profile-${user.id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {showFollowButton && user.id !== currentUserId && (
              isFollowing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnfollow(user.id)}
                  disabled={unfollowMutation.isPending}
                  data-testid={`button-unfollow-${user.id}`}
                >
                  {unfollowMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <UserMinus className="w-4 h-4 mr-1" />
                  )}
                  언팔로우
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleFollow(user.id)}
                  disabled={followMutation.isPending}
                  data-testid={`button-follow-${user.id}`}
                >
                  {followMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-1" />
                  )}
                  팔로우
                </Button>
              )
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-friends-management">
          <DialogHeader>
            <DialogTitle className="text-xl">친구 관리</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-dialog"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-6">
            {/* 검색 영역 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                아이디로 검색하여 친구를 추가하세요
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="아이디로 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                    data-testid="input-search-friends"
                  />
                </div>
                <Button
                  variant="default"
                  onClick={handleSearch}
                  disabled={isSearching}
                  data-testid="button-search-friends"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      검색 중
                    </>
                  ) : (
                    "검색"
                  )}
                </Button>
              </div>

              {/* 검색 결과 */}
              {searchQuery && searchResults.length > 0 && (
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-sm font-semibold">검색 결과</p>
                  {renderUserList(searchResults, true)}
                </div>
              )}
              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  검색 결과가 없습니다
                </div>
              )}
            </div>

            {/* 팔로잉/팔로워 탭 */}
            <Tabs defaultValue="following" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="following" data-testid="tab-following">
                  팔로잉 ({following.length})
                </TabsTrigger>
                <TabsTrigger value="followers" data-testid="tab-followers">
                  팔로워 ({followers.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="following" className="space-y-2 mt-4">
                {isLoadingFollowing ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
                  </div>
                ) : following.length > 0 ? (
                  renderUserList(following, true)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    아직 팔로우한 친구가 없습니다
                  </div>
                )}
              </TabsContent>
              <TabsContent value="followers" className="space-y-2 mt-4">
                {isLoadingFollowers ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
                  </div>
                ) : followers.length > 0 ? (
                  renderUserList(followers, true)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    아직 팔로워가 없습니다
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* 카카오 친구 초대 */}
            <div className="border-t pt-4">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleInviteFriend}
                data-testid="button-invite-kakao"
              >
                <MessageCircle className="w-4 h-4" />
                카카오톡으로 친구 초대하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 친구 초대 다이얼로그 */}
      <InviteFriendDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </>
  );
}
