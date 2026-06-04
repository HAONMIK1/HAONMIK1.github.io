import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, MapPin, Star, Heart, UserPlus, TrendingUp
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const kbbqImage = "/generated_images/Korean_BBQ_galbi_food_photo_1abb752a.png";
const bibimbapImage = "/generated_images/Bibimbap_stone_bowl_dish_f859dd5c.png";

interface UserProfilePageProps {
  onNavigate?: (id: string) => void;
}

interface UserInfo {
  id: number;
  email: string;
  name: string;
  nickname: string;
  inviteCode: string;
  score: number;
  restaurantCount: number;
  followingCount: number;
  followerCount: number;
}

export default function UserProfilePage({ onNavigate }: UserProfilePageProps = {}) {
  const [activeTab, setActiveTab] = useState("reviews");
  const [, setLocation] = useLocation();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const { savedIds: savedRestaurantIds } = useSavedRestaurants();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // API 호출 헬퍼 함수
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  // 내 정보 조회
  const { data: userInfo, isLoading: isLoadingUser, error: userError } = useQuery<UserInfo>({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("사용자 정보를 불러올 수 없습니다.");
      }

      return response.json();
    },
  });

  // 프로필 수정 mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { nickname: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "프로필 수정에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      toast({
        title: "프로필이 수정되었습니다.",
        description: "닉네임이 변경되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "프로필 수정 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileSave = (nickname: string, _bio?: string) => {
    updateProfileMutation.mutate({ nickname });
  };

  // API 데이터를 기반으로 사용자 정보 구성
  const displayUser = userInfo ? {
    name: userInfo.nickname || userInfo.name || "사용자",
    bio: "서울 강남 맛집 전문가 · 진짜 맛집만 소개합니다", // bio는 아직 API에 없음
    stats: {
      posts: userInfo.restaurantCount || 0,
      followers: userInfo.followerCount || 0,
      following: userInfo.followingCount || 0,
      weeklyPoints: 0, // 아직 API에 없음
      monthlyPoints: 0, // 아직 API에 없음
      totalPoints: userInfo.score || 0,
    },
  } : {
    name: "로딩 중...",
    bio: "",
    stats: {
      posts: 0,
      followers: 0,
      following: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      totalPoints: 0,
    },
  };

  const fallbackReviews = [
    {
      id: "review1",
      restaurant: { id: "rest1", name: "우동신 역삼점", imageUrl: kbbqImage },
      rating: 5,
      date: "2024-11-06",
      recommendedMenu: "가라아게 우동",
      text: "오늘도 점심 찾고고 금액도 저렴네요. 특히 가라아게는 꼭 드셔보세요!",
      hasReceipt: true,
      likes: 24,
    },
    {
      id: "review2",
      restaurant: { id: "rest2", name: "성수돈까스", imageUrl: bibimbapImage },
      rating: 4,
      date: "2024-11-05",
      recommendedMenu: "등심 돈까스",
      text: "바삭하고 두툼한 돈까스가 일품이에요. 소스도 맛있습니다!",
      hasReceipt: false,
      likes: 15,
    },
  ];

  // 내 후기 목록 API
  const { data: myReviewsData } = useQuery({
    queryKey: ["user", "me", "reviews"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me/reviews`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("후기 목록 조회 실패");
      return response.json();
    },
    retry: false,
  });

  const myReviews = myReviewsData ?? fallbackReviews;

  // 저장한 레스토랑 API
  const { data: savedRestaurantsData } = useQuery({
    queryKey: ["restaurants", "saved"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/restaurants/saved`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("저장 목록 조회 실패");
      return response.json();
    },
    retry: false,
  });

  const mockSavedRestaurants = savedRestaurantsData ?? [];

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
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["user", "me"] })}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader
        onInviteFriendClick={() => setShowInviteDialog(true)}
        onSearchClick={() => setLocation("/search")}
      />

      <div className="max-w-5xl mx-auto">
        {/* 프로필 헤더 - 깔끔한 디자인 */}
        <div className="px-4 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* 아바타 & 기본 정보 */}
                <div className="flex flex-col items-center md:items-start">
                  <div className="relative mb-3">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-2xl font-bold">{displayUser.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-foreground mb-4">{displayUser.name}</h1>

                  <div className="flex gap-2 flex-wrap">
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
                  </div>
                </div>

                {/* 통계 그리드 */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3 text-center hover-elevate cursor-pointer" data-testid="stat-posts">
                      <div className="text-2xl font-bold text-foreground">{displayUser.stats.posts}</div>
                      <div className="text-xs text-muted-foreground">게시물</div>
                    </Card>
                    <Card className="p-3 text-center hover-elevate cursor-pointer" data-testid="stat-followers">
                      <div className="text-2xl font-bold text-foreground">{displayUser.stats.followers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">팔로워</div>
                    </Card>
                    <Card className="p-3 text-center hover-elevate cursor-pointer" data-testid="stat-following">
                      <div className="text-2xl font-bold text-foreground">{displayUser.stats.following}</div>
                      <div className="text-xs text-muted-foreground">팔로잉</div>
                    </Card>
                    <Card 
                      className="p-3 text-center hover-elevate cursor-pointer" 
                      data-testid="stat-total-points"
                      onClick={() => setShowPointsDialog(true)}
                    >
                      <div className="text-2xl font-bold text-foreground">{displayUser.stats.totalPoints.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">내 점수</div>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="reviews" data-testid="tab-my-reviews">후기</TabsTrigger>
              <TabsTrigger value="saved" data-testid="tab-saved">저장</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-4 space-y-3">
              {myReviews.map((review) => (
                <Card
                  key={review.id}
                  className="hover-elevate cursor-pointer border-primary"
                  onClick={() => {
                    setLocation(`/review/${review.id}`);
                  }}
                  data-testid={`my-review-${review.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={review.restaurant.imageUrl}
                          alt={review.restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground mb-1 truncate">
                          {review.restaurant.name}
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
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>

                    {review.recommendedMenu && (
                      <Badge variant="outline" className="mb-2 text-xs">
                        추천: {review.recommendedMenu}
                      </Badge>
                    )}

                    <p className="text-sm text-foreground line-clamp-2">{review.text}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="saved" className="mt-4 space-y-3">
              {mockSavedRestaurants.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-1">저장한 맛집이 없습니다</p>
                  <p className="text-sm">마음에 드는 맛집을 저장해보세요!</p>
                </div>
              ) : (
                mockSavedRestaurants.map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setLocation(`/restaurant/${restaurant.id}`)}
                    data-testid={`saved-restaurant-${restaurant.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground mb-1 truncate">
                            {restaurant.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">{restaurant.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {restaurant.reviewCount}개 후기
                            </span>
                          </div>
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

      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        currentNickname={displayUser.name}
        currentBio={displayUser.bio}
        onSave={handleProfileSave}
      />

      <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
        <DialogContent className="max-w-md" data-testid="dialog-points">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              내 점수
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">이번 주</div>
                <div className="text-3xl font-bold text-primary">{displayUser.stats.weeklyPoints.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">포인트</div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">이번 달</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{displayUser.stats.monthlyPoints.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">포인트</div>
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">누적</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{displayUser.stats.totalPoints.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">포인트</div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
