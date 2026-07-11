import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import { MapPin, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// 네이버 지도 SDK는 NCP(네이버 클라우드 플랫폼) 콘솔에서 별도로 발급받는 Client ID를 쓴다
// (카카오 로그인 키, 서버의 네이버 검색 API 키와는 완전히 별개)
const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

declare global {
  interface Window {
    naver: any;
  }
}

export interface MapPlace {
  restaurantId: string;
  name: string;
  category?: string;
  ratingAverage?: number;
  address?: string;
  lat: number;
  lng: number;
  naverPlaceUrl?: string;
}

interface RestaurantMapViewProps {
  places: MapPlace[];
  heightClass?: string;
  className?: string;
}

export default function RestaurantMapView({
  places,
  heightClass = "h-[60vh]",
  className,
}: RestaurantMapViewProps) {
  const [, setLocation] = useLocation();
  const [mapReady, setMapReady] = useState(false);
  const [sdkFailed, setSdkFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 네이버 지도 SDK 동적 로드
  useEffect(() => {
    if (!NAVER_MAP_CLIENT_ID) {
      setSdkFailed(true);
      return;
    }
    if (window.naver?.maps) {
      setMapReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}`;
    script.async = true;
    script.onload = () => setMapReady(true);
    script.onerror = () => setSdkFailed(true);
    document.head.appendChild(script);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance.current) return;
    const { naver } = window;
    mapInstance.current = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(37.5006, 127.0366),
      zoom: 14,
    });
  }, [mapReady]);

  // 마커 갱신 (선택된 네트워크 필터에 따라 상위(DiscoveryFeed)에서 이미 걸러진 places가 내려온다)
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;
    const { naver } = window;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new naver.maps.LatLngBounds();
    places.forEach((p) => {
      const pos = new naver.maps.LatLng(p.lat, p.lng);
      const marker = new naver.maps.Marker({ position: pos, map: mapInstance.current, title: p.name });
      naver.maps.Event.addListener(marker, "click", () => setSelectedId(p.restaurantId));
      markersRef.current.push(marker);
      bounds.extend(pos);
    });
    if (places.length > 0) mapInstance.current.fitBounds(bounds);
  }, [mapReady, places]);

  // 필터가 바뀌어 선택된 장소가 목록에서 사라지면 선택 해제
  useEffect(() => {
    if (selectedId && !places.some((p) => p.restaurantId === selectedId)) {
      setSelectedId(null);
    }
  }, [places, selectedId]);

  const selected = places.find((p) => p.restaurantId === selectedId) ?? null;

  const focusPlace = (place: MapPlace) => {
    setSelectedId(place.restaurantId);
    if (mapInstance.current && window.naver) {
      mapInstance.current.panTo(new window.naver.maps.LatLng(place.lat, place.lng));
    }
  };

  // SDK 키 없음 → 목록 폴백
  if (sdkFailed) {
    return (
      <div className={cn("space-y-3", className)}>
        <Card className="p-3 bg-accent/40 text-xs text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          지도를 불러오지 못했어요 — 목록으로 표시합니다
        </Card>
        {places.map((p) => (
          <Card
            key={p.restaurantId}
            className="p-4 hover-elevate cursor-pointer"
            onClick={() => setLocation(`/restaurant/${p.restaurantId}`)}
            data-testid={`map-list-${p.restaurantId}`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{p.name}</p>
                  {p.category && <Badge variant="secondary" className="text-xs shrink-0">{p.category}</Badge>}
                </div>
                {p.address && <p className="text-xs text-muted-foreground mt-1 truncate">{p.address}</p>}
              </div>
              <div className="flex items-center gap-1 text-sm shrink-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {(p.ratingAverage ?? 0).toFixed(1)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2 items-start", className)}>
      {/* 지도 */}
      <div className="relative flex-[3] min-w-0">
        <div ref={mapRef} className={cn("w-full rounded-2xl overflow-hidden", heightClass)} data-testid="map-canvas" />
        {selected && (
          <Card className="absolute bottom-3 left-3 right-3 p-3 shadow-lg" data-testid="map-mini-card">
            <div className="flex items-center justify-between gap-3">
              <div
                className="min-w-0 cursor-pointer"
                onClick={() => setLocation(`/restaurant/${selected.restaurantId}`)}
              >
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate text-sm">{selected.name}</p>
                  {selected.category && <Badge variant="secondary" className="text-[10px] shrink-0">{selected.category}</Badge>}
                </div>
                {selected.address && <p className="text-xs text-muted-foreground mt-1 truncate">{selected.address}</p>}
                <div className="mt-1">
                  <StarRating rating={Math.round(selected.ratingAverage ?? 0)} size="sm" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <Button size="sm" onClick={() => setLocation(`/restaurant/${selected.restaurantId}`)}>
                  상세
                </Button>
                {selected.naverPlaceUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-[#03C75A]"
                    onClick={() => window.open(selected.naverPlaceUrl, "_blank")}
                    data-testid="map-naver-link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> 네이버
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 목록 — 클릭하면 지도가 해당 위치로 이동 */}
      <div className={cn("flex-[2] min-w-0 overflow-y-auto space-y-2", heightClass)} data-testid="map-side-list">
        {places.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8 px-2">표시할 맛집이 없어요</p>
        )}
        {places.map((p) => (
          <Card
            key={p.restaurantId}
            className={cn(
              "p-2.5 cursor-pointer hover-elevate transition-colors",
              selectedId === p.restaurantId && "border-primary bg-primary/5"
            )}
            onClick={() => focusPlace(p)}
            data-testid={`map-side-list-item-${p.restaurantId}`}
          >
            <p className="text-xs font-semibold truncate">{p.name}</p>
            {p.category && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{p.category}</p>}
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-medium">{(p.ratingAverage ?? 0).toFixed(1)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
