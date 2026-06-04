import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import RestaurantMapView, { MapPlace } from "@/components/RestaurantMapView";
import { Button } from "@/components/ui/button";
import { Navigation, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface MapPageProps {
  onNavigate?: (id: string) => void;
}

type Scope = "near" | "all";

// 좌표·네이버링크가 포함된 맛집 (피드에 없으면 mock 사용)
export const FALLBACK_PLACES: (MapPlace & { distance: number })[] = [
  { restaurantId: "1", name: "우동진 역삼점", category: "일식", ratingAverage: 4.0, distance: 1, lat: 37.5006, lng: 127.0366, address: "강남구 테헤란로 123", naverPlaceUrl: "https://m.place.naver.com/restaurant/12345678/home" },
  { restaurantId: "2", name: "성수돈까스", category: "일식", ratingAverage: 4.5, distance: 2, lat: 37.5446, lng: 127.0560, address: "성동구 연무장길 45", naverPlaceUrl: "https://m.place.naver.com/restaurant/23456789/home" },
  { restaurantId: "3", name: "홍대 떡볶이", category: "분식", ratingAverage: 4.2, distance: 1, lat: 37.5563, lng: 126.9237, address: "마포구 양화로 123", naverPlaceUrl: "https://m.place.naver.com/restaurant/34567890/home" },
  { restaurantId: "4", name: "치킨 전문점", category: "치킨", ratingAverage: 4.6, distance: 1, lat: 37.5012, lng: 127.0396, address: "강남구 테헤란로 456", naverPlaceUrl: "https://m.place.naver.com/restaurant/45678901/home" },
  { restaurantId: "5", name: "해물 찜 전문점", category: "한식", ratingAverage: 4.4, distance: 3, lat: 37.4815, lng: 126.9971, address: "서초구 방배중앙로 89", naverPlaceUrl: "https://m.place.naver.com/restaurant/56789012/home" },
  { restaurantId: "6", name: "감성 카페", category: "카페", ratingAverage: 4.7, distance: 2, lat: 37.5240, lng: 127.0227, address: "강남구 압구정로 234", naverPlaceUrl: "https://m.place.naver.com/restaurant/67890123/home" },
];

export default function MapPage({ onNavigate }: MapPageProps = {}) {
  const [, setLocation] = useLocation();
  const [scope, setScope] = useState<Scope>("all");
  const [networkFilters, setNetworkFilters] = useState<number[]>([1, 2, 3]);

  const { data: feedData, isLoading } = useQuery({
    queryKey: ["restaurants", "feed", "map"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/feed`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("피드 조회 실패");
      return res.json();
    },
    retry: false,
  });

  const rawPlaces: (MapPlace & { distance: number })[] = (feedData?.data ?? feedData ?? [])
    .map((r: any) => ({
      restaurantId: r.restaurantId,
      name: r.name,
      category: r.category,
      ratingAverage: r.ratingAverage,
      address: r.roadAddress || r.address,
      lat: r.latitude,
      lng: r.longitude,
      naverPlaceUrl: r.naverPlaceUrl,
      distance: r.reviews?.[0]?.distance ?? 1,
    }))
    .filter((r: any) => typeof r.lat === "number" && typeof r.lng === "number");

  const places = rawPlaces.length > 0 ? rawPlaces : FALLBACK_PLACES;

  const filteredPlaces = places.filter((p) => {
    const d = p.distance >= 3 ? 3 : p.distance;
    return networkFilters.includes(d);
  });

  const toggleFilter = (n: number) => {
    setNetworkFilters((prev) => (prev.includes(n) ? prev.filter((f) => f !== n) : [...prev, n]));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader onSearchClick={() => setLocation("/search")} />

      <div className="max-w-4xl mx-auto">
        <div className="p-4 flex items-center gap-2">
          <Button
            variant={scope === "near" ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setScope("near")}
            data-testid="scope-near"
          >
            <Navigation className="w-4 h-4" /> 내 주변
          </Button>
          <Button
            variant={scope === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setScope("all")}
            data-testid="scope-all"
          >
            전체
          </Button>
          <div className="ml-auto flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => toggleFilter(n)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  networkFilters.includes(n)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border"
                )}
                data-testid={`map-filter-${n}`}
              >
                {n === 3 ? "3촌+" : `${n}촌`}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="px-4">
            <RestaurantMapView places={filteredPlaces} heightClass="h-[62vh]" />
          </div>
        )}
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
