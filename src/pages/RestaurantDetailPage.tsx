import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Star, ExternalLink, MessageSquare, Heart } from "lucide-react";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import { Button } from "@/components/ui/button";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

interface RestaurantDetailPageProps {
  onNavigate?: (id: string) => void;
  restaurantId?: string;
  reviewId?: string;
}

export default function RestaurantDetailPage({ onNavigate, restaurantId, reviewId }: RestaurantDetailPageProps) {
  const [, setLocation] = useLocation();
  const [networkFilter, setNetworkFilter] = useState<"all" | "1st" | "2nd" | "3rd">("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const fallbackRestaurant = {
    id: restaurantId || "1",
    name: "우동진 역삼점",
    category: "일식",
    address: "서울특별시 강남구 역삼동 123-45",
    roadAddress: "서울특별시 강남구 테헤란로 123",
    placeUrl: "https://map.kakao.com/link/map/12345",
    ratingAverage: 4.0,
    description: "신선한 재료로 만드는 정통 일식 우동 전문점입니다.",
  };

  const fallbackReviews = [
    { id: "review1", userId: "u1", nickname: "맛집탐방가", distance: 1, rating: 5, recommendMenu: "가리아게 우동", hashTag: "영수증", content: "우동이 정말 찐지고 국물이 진하네요. 특히 가리아게가 바삭바삭해요!", photoUrl: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-10T10:00:00Z" },
    { id: "review2", userId: "u2", nickname: "점쩝박사", distance: 1, rating: 4, recommendMenu: "카레우동", hashTag: "안주", content: "카레우동이 진짜 맛있어요! 양도 푸짐하고 가성비 최고입니다.", photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-10T09:30:00Z" },
    { id: "review3", userId: "u3", nickname: "한식러버", distance: 2, rating: 5, recommendMenu: "치즈우동", content: "치즈우동이 정말 맛있어요! 부드러운 우동과 치즈의 조합이 환상적입니다.", photoUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-09T18:00:00Z" },
    { id: "review4", userId: "u4", nickname: "일식매니아", distance: 3, rating: 4, recommendMenu: "새우튀김 우동", content: "새우튀김이 바삭하고 크기도 커서 좋았어요.", createdAt: "2024-11-08T12:00:00Z" },
  ];

  // 식당 상세 API
  const { data: restaurantData } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/restaurants/${restaurantId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("식당 정보 조회 실패");
      return response.json();
    },
    enabled: !!restaurantId,
    retry: false,
  });

  const mockRestaurant = restaurantData ?? fallbackRestaurant;
  const allReviews = restaurantData?.reviews ?? fallbackReviews;

  // 하이라이트할 리뷰 찾기
  const highlightedReview = reviewId ? allReviews.find((r: any) => r.id === reviewId) : null;

  // 나머지 리뷰 (하이라이트된 리뷰 제외)
  const otherReviews = reviewId
    ? allReviews.filter((r: any) => r.id !== reviewId)
    : allReviews;

  const filteredReviews = otherReviews.filter((review) => {
    if (networkFilter === "all") return true;
    if (networkFilter === "1st") return review.distance === 1;
    if (networkFilter === "2nd") return review.distance === 2;
    if (networkFilter === "3rd") return review.distance >= 3;
    return false;
  });

  const networkCounts = {
    all: otherReviews.length,
    "1st": otherReviews.filter((r) => r.distance === 1).length,
    "2nd": otherReviews.filter((r) => r.distance === 2).length,
    "3rd": otherReviews.filter((r) => r.distance >= 3).length,
  };

  const ratingDistribution = [
    { stars: 5, count: 78, percentage: 63 },
    { stars: 4, count: 32, percentage: 26 },
    { stars: 3, count: 10, percentage: 8 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 1, percentage: 1 },
  ];

  const getDistanceBadgeText = (distance: number) => {
    return `${distance}촌`;
  };

  const getDistanceBadgeVariant = (distance: number): "default" | "secondary" | "outline" => {
    if (distance === 1) return "default";
    if (distance === 2) return "secondary";
    return "outline";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const { isSaved, toggleSave } = useSavedRestaurants(mockRestaurant.id);

  // 저장/삭제 토글 핸들러
  const handleToggleSave = () => {
    toggleSave(mockRestaurant.id);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader
        onInviteFriendClick={() => setShowInviteDialog(true)}
        onSearchClick={() => setLocation("/search")}
      />

      <div className="max-w-5xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <div className="px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
        </div>

        {/* 음식점 기본 정보 */}
        <div className="px-4 mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">{mockRestaurant.name}</h1>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="secondary">{mockRestaurant.category}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">{mockRestaurant.ratingAverage.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({mockReviews.length}개 후기)</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleSave}
                  data-testid={`button-save-restaurant-${mockRestaurant.id}`}
                  className="flex-shrink-0"
                >
                  <Heart 
                    className={`w-6 h-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                  />
                </Button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground">{mockRestaurant.address}</p>
                    {mockRestaurant.roadAddress && (
                      <p className="text-muted-foreground text-xs mt-0.5">{mockRestaurant.roadAddress}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 카카오맵 버튼 */}
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="gap-2"
                  onClick={() => window.open(mockRestaurant.placeUrl, "_blank")}
                  data-testid="button-kakao-map"
                >
                  <ExternalLink className="w-4 h-4" />
                  카카오맵에서 보기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 별점 통계 */}
        <div className="px-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-1">
                    {mockRestaurant.ratingAverage.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(mockRestaurant.ratingAverage)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mockReviews.length}개의 후기
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  {ratingDistribution.map((dist) => (
                    <div key={dist.stars} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-12">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{dist.stars}</span>
                      </div>
                      <Progress value={dist.percentage} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {dist.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 후기 목록 */}
        <div className="px-4 mt-4">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            후기
          </h2>

          {/* 네트워크 필터 */}
          <Tabs value={networkFilter} onValueChange={(v) => setNetworkFilter(v as typeof networkFilter)}>
            <TabsList className="w-full grid grid-cols-4 mb-4">
              <TabsTrigger value="all" data-testid="tab-all-reviews">
                전체 ({networkCounts.all})
              </TabsTrigger>
              <TabsTrigger value="1st" data-testid="tab-1st-reviews">
                1촌 ({networkCounts["1st"]})
              </TabsTrigger>
              <TabsTrigger value="2nd" data-testid="tab-2nd-reviews">
                2촌 ({networkCounts["2nd"]})
              </TabsTrigger>
              <TabsTrigger value="3rd" data-testid="tab-3rd-reviews">
                3촌+ ({networkCounts["3rd"]})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={networkFilter} className="mt-0">
              <div className="space-y-3">
                {/* 하이라이트된 리뷰 (reviewId가 있는 경우) */}
                {highlightedReview && (
                  <Card className="border-primary" data-testid={`highlighted-review-${highlightedReview.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <Badge variant="default" className="text-xs">하이라이트 후기</Badge>
                      </div>
                      
                      {highlightedReview.photoUrl && (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
                          <img
                            src={highlightedReview.photoUrl}
                            alt={`${highlightedReview.nickname}님의 후기 사진`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className="text-sm font-bold">
                            {highlightedReview.nickname[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-semibold text-sm text-foreground">
                              {highlightedReview.nickname}
                            </span>
                            <Badge
                              variant={getDistanceBadgeVariant(highlightedReview.distance)}
                              className="text-xs"
                            >
                              {getDistanceBadgeText(highlightedReview.distance)}
                            </Badge>
                          </div>

                          <div className="flex gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < highlightedReview.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                }`}
                              />
                            ))}
                          </div>

                          {highlightedReview.recommendMenu && (
                            <p className="text-sm font-medium text-foreground mb-1">
                              추천메뉴: {highlightedReview.recommendMenu}
                            </p>
                          )}

                          <p className="text-sm text-foreground leading-relaxed mb-1">
                            {highlightedReview.content}
                          </p>

                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(highlightedReview.createdAt)}
                            </p>
                            {highlightedReview.hashTag && (
                              <Badge variant="outline" className="text-xs">
                                #{highlightedReview.hashTag}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 나머지 후기 */}
                {filteredReviews.length === 0 && !highlightedReview ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>해당 네트워크에 작성된 후기가 없습니다.</p>
                  </div>
                ) : (
                  <>
                    {filteredReviews.map((review) => (
                    <Card
                      key={review.id}
                      className="hover-elevate cursor-pointer"
                      onClick={() => setLocation(`/review/${review.id}`)}
                      data-testid={`review-card-${review.id}`}
                    >
                      <CardContent className="p-4">
                        {review.photoUrl && (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
                            <img
                              src={review.photoUrl}
                              alt={`${review.nickname}님의 후기 사진`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarFallback className="text-sm font-bold">
                              {review.nickname[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-semibold text-sm text-foreground">
                                {review.nickname}
                              </span>
                              <Badge
                                variant={getDistanceBadgeVariant(review.distance)}
                                className="text-xs"
                              >
                                {getDistanceBadgeText(review.distance)}
                              </Badge>
                            </div>

                            <div className="flex gap-0.5 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                  }`}
                                />
                              ))}
                            </div>

                            {review.recommendMenu && (
                              <p className="text-sm font-medium text-foreground mb-1">
                                추천메뉴: {review.recommendMenu}
                              </p>
                            )}

                            <p className="text-sm text-foreground leading-relaxed mb-1">
                              {review.content}
                            </p>

                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </p>
                              {review.hashTag && (
                                <Badge variant="outline" className="text-xs">
                                  #{review.hashTag}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <InviteFriendDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
