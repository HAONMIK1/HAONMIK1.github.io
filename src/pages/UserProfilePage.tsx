import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Settings, MapPin, Star, Heart, UserPlus, UserCheck, UtensilsCrossed
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserProfilePageProps {
  onNavigate?: (id: string) => void;
  userId?: string;
}

interface MyInfo {
  id: number;
  email: string;
  nickname: string;
  inviteCode: string;
  followerCount: number;
  followingCount: number;
}

interface OtherUserInfo {
  id: number;
  email: string;
  nickname: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface ReviewItem {
  id: number;
  restaurantId: number;
  restaurantName: string;
  content: string;
  rating: number;
  imageUrls: string[];
  createdAt: string;
}

interface RestaurantItem {
  id: number;
  name: string;
  category: string;
  address: string;
}

export default function UserProfilePage({ onNavigate, userId }: UserProfilePageProps = {}) {
  const isOwnProfile = !userId;
  const [activeTab, setActiveTab] = useState("reviews");
  const [, setLocation] = useLocation();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: myInfo, isLoading: isLoadingMy, error: myError } = useQuery<MyInfo>({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/v1/users/me");
      const json = await response.json();
      return json.data as MyInfo;
    },
    enabled: isOwnProfile,
  });

  const { data: otherInfo, isLoading: isLoadingOther, error: otherError } = useQuery<OtherUserInfo>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/v1/users/${userId}`);
      const json = await response.json();
      return json.data as OtherUserInfo;
    },
    enabled: !isOwnProfile,
  });

  const isLoadingUser = isOwnProfile ? isLoadingMy : isLoadingOther;
  const userError = isOwnProfile ? myError : otherError;
  const displayName = (isOwnProfile ? myInfo?.nickname : otherInfo?.nickname) || "사용자";
  const followerCount = (isOwnProfile ? myInfo?.followerCount : otherInfo?.followerCount) ?? 0;
  const followingCount = (isOwnProfile ? myInfo?.followingCount : otherInfo?.followingCount) ?? 0;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { nickname: string }) => {
      const response = await apiRequest("PATCH", "/api/v1/users/me", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      toast({ title: "프로필이 수정되었습니다.", description: "닉네임이 변경되었습니다." });
    },
    onError: (error: Error) => {
      toast({ title: "프로필 수정 실패", description: error.message, variant: "destructive" });
    },
  });

  const handleProfileSave = (nickname: string) => {
    updateProfileMutation.mutate({ nickname });
  };

  const handleToggleFollow = async () => {
    if (!otherInfo) return;
    try {
      await apiRequest(otherInfo.isFollowing ? "DELETE" : "POST", `/api/v1/users/${userId}/follow`);
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    } catch (error) {
      toast({
        title: "팔로우 처리에 실패했어요",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const reviewsEndpoint = isOwnProfile ? "/api/v1/users/me/reviews" : `/api/v1/users/${userId}/reviews`;
  const savedEndpoint = isOwnProfile
    ? "/api/v1/users/me/saved-restaurants"
    : `/api/v1/users/${userId}/saved-restaurants`;

  const { data: reviewsData } = useQuery({
    queryKey: ["user", userId ?? "me", "reviews"],
    queryFn: async () => {
      const response = await apiRequest("GET", reviewsEndpoint);
      const json = await response.json();
      return (json.data?.content ?? []) as ReviewItem[];
    },
    retry: false,
  });
  const reviews = reviewsData ?? [];

  const { data: savedRestaurantsData } = useQuery({
    queryKey: ["user", userId ?? "me", "saved-restaurants"],
    queryFn: async () => {
      const response = await apiRequest("GET", `${savedEndpoint}?size=200`);
      const json = await response.json();
      return (json.data?.content ?? []) as RestaurantItem[];
    },
    retry: false,
  });
  const savedRestaurants = savedRestaurantsData ?? [];

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">프로필을 불러올 수 없습니다.</p>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: isOwnProfile ? ["user", "me"] : ["user", userId] })
            }
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader onInviteFriendClick={() => setShowInviteDialog(true)} />

      <div className="max-w-5xl mx-auto">
        {/* 프로필 헤더 */}
        <div className="px-4 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <div className="relative mb-3">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-2xl font-bold">{displayName[0]}</AvatarFallback>
                    </Avatar>
                  </div>

                  <h1 className="text-2xl font-bold text-foreground mb-2">{displayName}</h1>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                    <span data-testid="text-follower-count">
                      <span className="font-semibold text-foreground">{followerCount}</span> 팔로워
                    </span>
                    <span data-testid="text-following-count">
                      <span className="font-semibold text-foreground">{followingCount}</span> 팔로잉
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {isOwnProfile ? (
                      <>
                        <Button
                          variant="default"
                          className="gap-2"
                          onClick={() => setShowEditDialog(true)}
                          data-testid="button-edit-profile"
                        >
                          <Settings className="w-4 h-4" />
                          프로필 수정
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => setShowInviteDialog(true)}
                          data-testid="button-invite-friend"
                        >
                          <UserPlus className="w-4 h-4" />
                          친구 초대
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant={otherInfo?.isFollowing ? "outline" : "default"}
                        className="gap-2"
                        onClick={handleToggleFollow}
                        data-testid="button-toggle-follow"
                      >
                        {otherInfo?.isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4" />
                            팔로잉
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            팔로우
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-3 text-center" data-testid="stat-posts">
                        <div className="text-2xl font-bold text-foreground">{reviews.length}</div>
                        <div className="text-xs text-muted-foreground">작성한 후기</div>
                      </Card>
                      <Card className="p-3 text-center" data-testid="stat-saved">
                        <div className="text-2xl font-bold text-foreground">{savedRestaurants.length}</div>
                        <div className="text-xs text-muted-foreground">저장한 맛집</div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 컨텐츠 - 타인 프로필은 후기/저장만 노출 (기존과 동일) */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="reviews" data-testid="tab-my-reviews">후기</TabsTrigger>
              <TabsTrigger value="saved" data-testid="tab-saved">저장</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-4 space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-1">작성한 후기가 없습니다</p>
                  {isOwnProfile && <p className="text-sm">맛집에 다녀오고 첫 후기를 남겨보세요!</p>}
                </div>
              ) : (
                reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setLocation(`/restaurant/${review.restaurantId}`)}
                    data-testid={`my-review-${review.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3 mb-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          {review.imageUrls[0] ? (
                            <img
                              src={review.imageUrls[0]}
                              alt={review.restaurantName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground mb-1 truncate">
                            {review.restaurantName}
                          </h3>
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating
                                    ? "fill-primary text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-foreground line-clamp-2">{review.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-4 space-y-3">
              {isOwnProfile && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary h-auto p-0"
                    onClick={() => setLocation("/saved")}
                    data-testid="button-view-all-saved"
                  >
                    전체 보기 →
                  </Button>
                </div>
              )}
              {savedRestaurants.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-1">저장한 맛집이 없습니다</p>
                  {isOwnProfile && <p className="text-sm">마음에 드는 맛집을 저장해보세요!</p>}
                </div>
              ) : (
                savedRestaurants.map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setLocation(`/restaurant/${restaurant.id}`)}
                    data-testid={`saved-restaurant-${restaurant.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground mb-1 truncate">
                            {restaurant.name}
                          </h3>
                          <Badge variant="outline" className="mb-1 text-xs">
                            {restaurant.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{restaurant.address}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <InviteFriendDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      {isOwnProfile && (
        <EditProfileDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          currentNickname={displayName}
          onSave={handleProfileSave}
        />
      )}

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
