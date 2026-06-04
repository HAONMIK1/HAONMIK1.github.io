import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import FriendsManagementDialog from "@/components/FriendsManagementDialog";
import RestaurantWithReviews from "@/components/RestaurantWithReviews";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type NetworkFilter = "1st" | "2nd" | "3rd";

interface DiscoveryFeedProps {
  onNavigate?: (id: string) => void;
  newRestaurants?: any[];
}

export default function DiscoveryFeed({ onNavigate, newRestaurants = [] }: DiscoveryFeedProps = {}) {
  const [, setLocation] = useLocation();
  const [networkFilters, setNetworkFilters] = useState<NetworkFilter[]>(["1st", "2nd", "3rd"]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showFriendsDialog, setShowFriendsDialog] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(10);
  const [isScrollLoading, setIsScrollLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 피드 API 호출
  const { data: feedData, isLoading: isFeedLoading } = useQuery({
    queryKey: ["restaurants", "feed"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/restaurants/feed`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("피드 조회 실패");
      return response.json();
    },
    retry: false,
  });

  const toggleFilter = (filter: NetworkFilter) => {
    setNetworkFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const resetFilters = () => {
    setNetworkFilters(["1st", "2nd", "3rd"]);
  };

  const handleNavigate = (destination: string) => {
    if (destination === "home") {
      setLocation("/");
    } else if (destination === "rankings") {
      setLocation("/rankings");
    } else if (destination === "profile") {
      setLocation("/profile");
    }
    onNavigate?.(destination);
  };

  const fallbackRestaurantsData = [
    {
      restaurantId: "1",
      name: "우동진 역삼점",
      address: "서울특별시 강남구 역삼동 123-45",
      roadAddress: "서울특별시 강남구 테헤란로 123",
      category: "일식",
      placeUrl: "https://map.kakao.com/link/map/12345",
      ratingAverage: 4.0,
      reviews: [
        { userId: "u1", nickname: "맛집탐방가", distance: 1, rating: 5, recommendMenu: "가리아게 우동", hashTag: "영수증", content: "우동이 정말 찐지고 국물이 진하네요. 특히 가리아게가 바삭바삭해요!", photoUrl: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-10T10:00:00Z" },
        { userId: "u2", nickname: "점쩝박사", distance: 1, rating: 4, recommendMenu: "카레우동", hashTag: "안주", content: "카레우동이 진짜 맛있어요! 양도 푸짐하고 가성비 최고입니다.", photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-10T09:30:00Z" },
      ],
    },
    {
      restaurantId: "2",
      name: "성수돈까스",
      address: "서울특별시 성수구 성수동 67-89",
      roadAddress: "서울특별시 성수구 연무장길 45",
      category: "일식",
      placeUrl: "https://map.kakao.com/link/map/67890",
      ratingAverage: 4.5,
      reviews: [
        { userId: "u3", nickname: "한식러버", distance: 2, rating: 5, recommendMenu: "치즈돈까스", content: "간단하게 점심 먹기 좋은 곳이에요. 치즈돈까스가 정말 치고빠집니다.", photoUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-10T12:15:00Z" },
        { userId: "u4", nickname: "돈까스매니아", distance: 2, rating: 4, recommendMenu: "로제돈까스", content: "로제소스가 정말 맛있어요. 부드러운 돈까스와 찰떡궁합!", photoUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-10T11:00:00Z" },
      ],
    },
    {
      restaurantId: "3",
      name: "홍대 떡볶이",
      address: "서울특별시 마포구 홍대입구",
      roadAddress: "서울특별시 마포구 양화로 123",
      category: "분식",
      placeUrl: "https://map.kakao.com/link/map/11111",
      ratingAverage: 4.2,
      reviews: [
        { userId: "u5", nickname: "떡볶이매니아", distance: 1, rating: 4, recommendMenu: "치즈떡볶이", content: "매콤하면서도 달달해요! 치즈가 듬뿍 들어가서 고소하고 맛있어요.", photoUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-09T18:30:00Z" },
        { userId: "u6", nickname: "분식킹", distance: 2, rating: 4, recommendMenu: "로제떡볶이", content: "로제떡볶이가 진짜 미쳤어요. 크림 소스랑 떡이 환상의 조합!", photoUrl: "https://images.unsplash.com/photo-1607330289024-097b0faf01d7?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-09T17:00:00Z" },
      ],
    },
    {
      restaurantId: "4",
      name: "치킨 전문점",
      address: "서울특별시 강남구 역삼동",
      roadAddress: "서울특별시 강남구 테헤란로 456",
      category: "치킨",
      placeUrl: "https://map.kakao.com/link/map/22222",
      ratingAverage: 4.6,
      reviews: [
        { userId: "u7", nickname: "치킨러버", distance: 1, rating: 5, recommendMenu: "양념치킨", content: "양념이 달콤하면서도 매콤해요! 바삭바삭한 튀김옷이 일품입니다.", photoUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-09T20:00:00Z" },
      ],
    },
    {
      restaurantId: "5",
      name: "해물 찜 전문점",
      address: "서울특별시 서초구 방배동",
      roadAddress: "서울특별시 서초구 방배중앙로 89",
      category: "한식",
      placeUrl: "https://map.kakao.com/link/map/33333",
      ratingAverage: 4.4,
      reviews: [
        { userId: "u8", nickname: "해물러버", distance: 3, rating: 4, recommendMenu: "해물찜", content: "싱싱한 해산물이 가득! 양념도 맛있고 양도 푸짐해요.", photoUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-08T19:00:00Z" },
      ],
    },
    {
      restaurantId: "6",
      name: "감성 카페",
      address: "서울특별시 강남구 신사동",
      roadAddress: "서울특별시 강남구 압구정로 234",
      category: "카페",
      placeUrl: "https://map.kakao.com/link/map/44444",
      ratingAverage: 4.7,
      reviews: [
        { userId: "u9", nickname: "카페마니아", distance: 2, rating: 5, recommendMenu: "아인슈페너", content: "분위기 정말 좋아요! 커피도 맛있고 디저트도 훌륭합니다.", photoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80", createdAt: "2024-11-08T15:00:00Z" },
      ],
    },
  ];

  const baseRestaurants = feedData ?? fallbackRestaurantsData;
  const allRestaurants = [...(newRestaurants || []), ...baseRestaurants];

  const networkCounts = {
    all: allRestaurants.length,
    "1st": allRestaurants.filter((r) =>
      r.reviews?.some((rev: any) => rev.distance === 1)
    ).length,
    "2nd": allRestaurants.filter((r) =>
      r.reviews?.some((rev: any) => rev.distance === 2)
    ).length,
    "3rd": allRestaurants.filter((r) =>
      r.reviews?.some((rev: any) => rev.distance >= 3)
    ).length,
  };

  const filteredRestaurants = allRestaurants.filter((restaurant) => {
    if (networkFilters.length === 0) return false;
    if (networkFilters.length === 3) return true; // 모두 선택된 경우
    
    return restaurant.reviews?.some((r: any) => {
      if (networkFilters.includes("1st") && r.distance === 1) return true;
      if (networkFilters.includes("2nd") && r.distance === 2) return true;
      if (networkFilters.includes("3rd") && r.distance >= 3) return true;
      return false;
    });
  });

  // 표시할 레스토랑 (페이징 적용)
  const displayedRestaurants = filteredRestaurants.slice(0, displayedCount);
  const hasMore = displayedCount < filteredRestaurants.length;

  // 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isScrollLoading) {
          setIsScrollLoading(true);
          setTimeout(() => {
            setDisplayedCount((prev) => prev + 10);
            setIsScrollLoading(false);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isScrollLoading]);

  // 필터 변경 시 displayedCount 리셋
  useEffect(() => {
    setDisplayedCount(10);
  }, [networkFilters]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader
        onInviteFriendClick={() => setShowInviteDialog(true)}
        onSearchClick={() => setLocation("/search")}
        onFriendsClick={() => setShowFriendsDialog(true)}
        friendsCount={1}
      />

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* 네트워크 필터 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">네트워크 필터</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary h-auto p-0"
              data-testid="button-filter-reset"
              onClick={resetFilters}
            >
              전체 선택
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => toggleFilter("1st")}
              className={cn(
                "py-3 px-4 rounded-lg border-2 transition-all hover-elevate active-elevate-2",
                networkFilters.includes("1st")
                  ? "bg-primary/10 dark:bg-primary/20 border-primary text-primary"
                  : "bg-card border-border"
              )}
              data-testid="filter-1st"
            >
              <div className="text-center text-sm font-semibold">1촌</div>
            </button>

            <button
              onClick={() => toggleFilter("2nd")}
              className={cn(
                "py-3 px-4 rounded-lg border-2 transition-all hover-elevate active-elevate-2",
                networkFilters.includes("2nd")
                  ? "bg-green-50 dark:bg-green-950/30 border-green-500 text-green-600 dark:text-green-400"
                  : "bg-card border-border"
              )}
              data-testid="filter-2nd"
            >
              <div className="text-center text-sm font-semibold">2촌</div>
            </button>

            <button
              onClick={() => toggleFilter("3rd")}
              className={cn(
                "py-3 px-4 rounded-lg border-2 transition-all hover-elevate active-elevate-2",
                networkFilters.includes("3rd")
                  ? "bg-purple-50 dark:bg-purple-950/30 border-purple-500 text-purple-600 dark:text-purple-400"
                  : "bg-card border-border"
              )}
              data-testid="filter-3rd"
            >
              <div className="text-center text-sm font-semibold">3촌+</div>
            </button>
          </div>
        </section>

        {/* 필터링된 음식점 목록 */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">
            {networkFilters.length === 3 && "전체 맛집"}
            {networkFilters.length === 1 && networkFilters.includes("1st") && "1촌 맛집"}
            {networkFilters.length === 1 && networkFilters.includes("2nd") && "2촌 맛집"}
            {networkFilters.length === 1 && networkFilters.includes("3rd") && "3촌+ 맛집"}
            {networkFilters.length === 2 && "선택된 맛집"}
            {networkFilters.length === 0 && "맛집 없음"}
          </h2>

          {isFeedLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>해당 네트워크에 등록된 맛집이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayedRestaurants.map((restaurant) => (
                  <RestaurantWithReviews
                    key={restaurant.restaurantId}
                    {...restaurant}
                    onClick={() => setLocation(`/restaurant/${restaurant.restaurantId}`)}
                  />
                ))}
              </div>
              
              {/* 무한 스크롤 트리거 */}
              {hasMore && (
                <div 
                  ref={observerTarget}
                  className="flex justify-center py-8"
                  data-testid="scroll-trigger"
                >
                  {isScrollLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">로딩 중...</span>
                    </div>
                  )}
                </div>
              )}
              
              {!hasMore && displayedRestaurants.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">모든 맛집을 확인했습니다</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <InviteFriendDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <FriendsManagementDialog
        open={showFriendsDialog}
        onOpenChange={setShowFriendsDialog}
      />

      <BottomNavigation onNavigate={handleNavigate} />
    </div>
  );
}
