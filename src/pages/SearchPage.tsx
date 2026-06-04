import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const CATEGORIES = ["전체", "한식", "일식", "중식", "양식", "분식", "치킨", "카페", "기타"];

interface SearchPageProps {
  onNavigate?: (id: string) => void;
}

interface RestaurantResult {
  restaurantId: string;
  name: string;
  category: string;
  address: string;
  roadAddress?: string;
  ratingAverage: number;
  reviewCount?: number;
  photoUrl?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SearchPage({ onNavigate }: SearchPageProps = {}) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const { data: results, isLoading, isFetching } = useQuery<RestaurantResult[]>({
    queryKey: ["search", submittedQuery, activeCategory],
    queryFn: async () => {
      if (!submittedQuery && activeCategory === "전체") return [];

      const params = new URLSearchParams();
      if (submittedQuery) params.set("q", submittedQuery);
      if (activeCategory !== "전체") params.set("category", activeCategory);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/restaurants/search?${params.toString()}`,
        { headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error("검색 실패");
      return response.json();
    },
    enabled: !!(submittedQuery || activeCategory !== "전체"),
    retry: false,
  });

  const handleSearch = useCallback(() => {
    setSubmittedQuery(query.trim());
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setQuery("");
    setSubmittedQuery("");
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSubmittedQuery(query.trim());
  };

  const showResults = submittedQuery || activeCategory !== "전체";

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader
        onInviteFriendClick={() => setShowInviteDialog(true)}
        onSearchClick={() => {}}
      />

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* 검색창 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="맛집 이름이나 주소로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-9 h-11"
              autoFocus
              data-testid="input-search"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} className="h-11 px-5" data-testid="button-search">
            검색
          </Button>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className="flex-shrink-0"
              data-testid={`category-${cat}`}
            >
              <Badge
                variant={activeCategory === cat ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-3 py-1 text-sm",
                  activeCategory === cat ? "" : "hover:bg-muted"
                )}
              >
                {cat}
              </Badge>
            </button>
          ))}
        </div>

        {/* 검색 결과 */}
        {isLoading || isFetching ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : showResults ? (
          results && results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                검색 결과 {results.length}개
              </p>
              {results.map((restaurant) => (
                <Card
                  key={restaurant.restaurantId}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/restaurant/${restaurant.restaurantId}`)}
                  data-testid={`search-result-${restaurant.restaurantId}`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {restaurant.photoUrl ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={restaurant.photoUrl}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-sm text-foreground truncate">
                            {restaurant.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {restaurant.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">
                              {restaurant.ratingAverage?.toFixed(1) ?? "-"}
                            </span>
                          </div>
                          {restaurant.reviewCount !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              {restaurant.reviewCount}개 후기
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {restaurant.roadAddress || restaurant.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium mb-1">검색 결과가 없습니다</p>
              <p className="text-sm">다른 키워드로 검색해보세요</p>
            </div>
          )
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium mb-1">맛집을 검색해보세요</p>
            <p className="text-sm">이름, 주소, 카테고리로 검색할 수 있어요</p>
          </div>
        )}
      </div>

      <InviteFriendDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
