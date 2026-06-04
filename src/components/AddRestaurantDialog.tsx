import { useState, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import CategoryBadge from "./CategoryBadge";
import { MapPin, Upload, DollarSign, Clock, Coins, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    kakao: any;
  }
}

interface AddRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestaurantAdded?: (restaurant: any) => void;
}

export default function AddRestaurantDialog({ open, onOpenChange, onRestaurantAdded }: AddRestaurantDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hasPhotos, setHasPhotos] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    recommendedMenu: "",
    review: "",
    hashtag: "",
  });
  const [searchMode, setSearchMode] = useState<"search" | "manual">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const categories = ["한식", "일식", "중식", "양식", "분식", "치킨", "카페", "기타"];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      // 서버 프록시를 통해 카카오 API 호출
      const response = await fetch(
        `/api/kakao/search?query=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        toast({
          title: "검색 실패",
          description: errorData?.error || "음식점 검색 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        return;
      }
      
      const data = await response.json();
      
      if (data.documents && data.documents.length > 0) {
        setSearchResults(data.documents);
      } else {
        setSearchResults([]);
        toast({
          title: "검색 결과가 없습니다",
          description: "다른 키워드로 검색해보세요.",
        });
      }
    } catch (error) {
      toast({
        title: "검색 실패",
        description: "음식점 검색 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSelectPlace = (place: any) => {
    setFormData({
      name: place.place_name,
      address: place.road_address_name || place.address_name,
      recommendedMenu: "",
      review: "",
      hashtag: "",
    });
    
    const categoryMap: Record<string, string> = {
      "한식": "한식",
      "일식": "일식",
      "중식": "중식",
      "양식": "양식",
      "분식": "분식",
      "치킨": "치킨",
      "카페": "카페",
    };
    
    const detectedCategory = Object.keys(categoryMap).find((key) =>
      place.category_name.includes(key)
    );
    
    if (detectedCategory) {
      setSelectedCategory(categoryMap[detectedCategory]);
    }
    
    // 검색 결과만 초기화 (검색어는 유지)
    setSearchResults([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setHasPhotos(files.length > 0);
  };

  const handleBackToSearch = () => {
    setFormData({
      name: "",
      address: "",
      recommendedMenu: "",
      review: "",
      hashtag: "",
    });
    setSelectedCategory("");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setRating(0);
    setSelectedCategory("");
    setHasPhotos(false);
    setSelectedFiles([]);
    setSearchQuery("");
    setSearchResults([]);
    setSearchMode("search");
    setFormData({ name: "", address: "", recommendedMenu: "", review: "", hashtag: "" });
  };

  const handleSubmit = async () => {
    if (!rating || rating === 0) {
      toast({ title: "별점을 선택해주세요", description: "맛집에 대한 별점을 매겨주세요.", variant: "destructive" });
      return;
    }
    if (!formData.review || formData.review.trim().length === 0) {
      toast({ title: "후기를 작성해주세요", description: "맛집에 대한 후기를 작성해주세요.", variant: "destructive" });
      return;
    }

    const payload = {
      name: formData.name || "새로운 맛집",
      category: selectedCategory || "기타",
      address: formData.address || "",
      rating,
      recommendMenu: formData.recommendedMenu,
      review: formData.review,
      hashtag: formData.hashtag,
    };

    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/v1/restaurants", payload);
      const saved = await res.json();

      if (onRestaurantAdded) {
        onRestaurantAdded(saved);
      }
      toast({ title: "맛집 등록 완료!", description: "새로운 맛집이 등록되었습니다." });
    } catch {
      // API 실패 시 로컬 상태에만 추가
      const localRestaurant = {
        id: `rest-${Date.now()}`,
        name: payload.name,
        category: payload.category,
        imageUrl: "",
        rating: payload.rating,
        address: payload.address,
        restaurantId: `rest-${Date.now()}`,
        ratingAverage: payload.rating,
        reviews: [{
          userId: "me",
          nickname: "나",
          distance: 1,
          rating: payload.rating,
          recommendMenu: payload.recommendMenu,
          content: payload.review,
          createdAt: new Date().toISOString(),
        }],
      };
      if (onRestaurantAdded) {
        onRestaurantAdded(localRestaurant);
      }
      toast({ title: "맛집 등록 완료!", description: "새로운 맛집이 등록되었습니다." });
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-restaurant">
        <DialogHeader>
          <DialogTitle className="text-2xl">맛집 등록하기</DialogTitle>
          <DialogDescription>
            새로운 맛집을 등록하고 포인트를 받으세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 포인트 획득 정보 */}
          <div className={`rounded-lg p-6 ${hasPhotos ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <p className="text-sm opacity-90 mb-2">등록 시 획득 점수</p>
            <p className="text-4xl font-bold mb-4">{hasPhotos ? '1,000' : '500'}점</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>기본 후기</span>
                <span className="font-medium">500점</span>
              </div>
              <div className="flex justify-between items-center">
                <span>📸 사진 추가</span>
                <span className="font-medium">+500점 (총 1,000점)</span>
              </div>
            </div>
          </div>

          {/* 검색 모드 토글 */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={searchMode === "search" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSearchMode("search")}
                  data-testid="button-search-mode"
                >
                  <Search className="w-4 h-4 mr-2" />
                  카카오맵 검색
                </Button>
                <Button
                  type="button"
                  variant={searchMode === "manual" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSearchMode("manual")}
                  data-testid="button-manual-mode"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  수동 입력
                </Button>
              </div>

              {/* 카카오맵 검색 */}
              {searchMode === "search" && !formData.name && (
                <div className="space-y-3">
                  <Label htmlFor="search">맛집 검색</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      placeholder="맛집 이름을 검색하세요..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      data-testid="input-place-search"
                    />
                    <Button
                      type="button"
                      onClick={handleSearch}
                      data-testid="button-search-places"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* 검색 결과 */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">검색 결과 {searchResults.length}개</p>
                        <a
                          href={`https://map.kakao.com/link/search/${encodeURIComponent(searchQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          카카오맵에서 보기
                        </a>
                      </div>
                      
                      {/* 검색 결과 리스트 */}
                      <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                        {searchResults.map((place) => (
                          <div
                            key={place.id}
                            className="p-3 hover-elevate cursor-pointer"
                            onClick={() => handleSelectPlace(place)}
                            data-testid={`search-result-${place.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{place.place_name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{place.category_name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {place.road_address_name || place.address_name}
                                </p>
                              </div>
                              <a
                                href={place.place_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0 text-xs text-primary hover:underline"
                              >
                                지도
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 선택된 맛집 정보 (검색 모드) */}
              {searchMode === "search" && formData.name && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">맛집 검색 *</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToSearch}
                      data-testid="button-back-to-search"
                      className="flex items-center gap-1"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">가게 이름</p>
                      <p className="font-semibold">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">주소</p>
                      <p className="text-sm">{formData.address}</p>
                    </div>
                    {selectedCategory && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">카테고리</p>
                        <CategoryBadge label={selectedCategory} variant="default" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 수동 입력 필드 */}
              {searchMode === "manual" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">맛집 이름 *</Label>
                    <Input
                      id="name"
                      placeholder="예: 강남 갈비집"
                      data-testid="input-restaurant-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">주소 *</Label>
                    <Input
                      id="address"
                      placeholder="서울시 강남구 테헤란로..."
                      data-testid="input-address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>카테고리 *</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className="transition-all"
                        >
                          <CategoryBadge
                            label={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 사진 업로드 */}
              <div className="space-y-2">
                <Label>사진 업로드</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-file-upload"
                />
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="upload-area"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  {selectedFiles.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedFiles.length}장 선택됨 ✓</p>
                      <p className="text-xs text-muted-foreground mt-1">{selectedFiles.map(f => f.name).join(", ")}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">클릭하여 사진 업로드 (+500P)</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>별점 *</Label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onRatingChange={setRating}
                  />
                  <span className="text-sm text-muted-foreground">
                    {rating > 0 ? `${rating}점` : "별점을 선택하세요"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu">추천 메뉴</Label>
                <Input
                  id="menu"
                  placeholder="예: 가라아게 우동, LA갈비"
                  value={formData.recommendedMenu}
                  onChange={(e) => setFormData({ ...formData, recommendedMenu: e.target.value })}
                  data-testid="input-menu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review">후기 작성</Label>
                <Textarea
                  id="review"
                  placeholder="이 맛집에 대한 후기를 작성해주세요. 어떤 점이 좋았나요? 추천하고 싶은 메뉴가 있나요?"
                  rows={5}
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  data-testid="textarea-review"
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  상세한 후기를 작성하면 더 많은 포인트를 받을 수 있어요!
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtag">해시태그</Label>
                <Input
                  id="hashtag"
                  placeholder="예: 데이트맛집, 가성비최고"
                  value={formData.hashtag}
                  onChange={(e) => setFormData({ ...formData, hashtag: e.target.value })}
                  data-testid="input-hashtag"
                />
              </div>

              {/* 등록 버튼 */}
              <Button
                onClick={handleSubmit}
                className="w-full gap-2"
                data-testid="button-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "등록 중..." : "맛집 등록하기"}
              </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
