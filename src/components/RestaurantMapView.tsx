import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/StarRating";
import { MapPin, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// 카카오 지도 SDK는 로그인과 같은 JavaScript 키를 사용한다 (별도 지도 키가 있으면 우선)
const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || import.meta.env.VITE_KAKAO_JS_KEY;

declare global {
  interface Window {
    kakao: any;
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
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 카카오 지도 SDK 동적 로드
  useEffect(() => {
    if (!KAKAO_MAP_KEY) {
      setSdkFailed(true);
      return;
    }
    if (window.kakao?.maps) {
      setMapReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => setMapReady(true));
    script.onerror = () => setSdkFailed(true);
    document.head.appendChild(script);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance.current) return;
    const { kakao } = window;
    mapInstance.current = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5006, 127.0366),
      level: 7,
    });
  }, [mapReady]);

  // 마커 갱신
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;
    const { kakao } = window;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new kakao.maps.LatLngBounds();
    places.forEach((p) => {
      const pos = new kakao.maps.LatLng(p.lat, p.lng);
      const marker = new kakao.maps.Marker({ position: pos, map: mapInstance.current });
      kakao.maps.event.addListener(marker, "click", () => setSelected(p));
      markersRef.current.push(marker);
      bounds.extend(pos);
    });
    if (places.length > 0) mapInstance.current.setBounds(bounds);
  }, [mapReady, places]);

  // SDK 키 없음 → 목록 폴백
  if (sdkFailed) {
    return (
      <div className={cn("space-y-3", className)}>
        <Card className="p-3 bg-accent/40 text-xs text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          지도를 불러오지 못했어요 — 목록으로 표시합니다 (카카오 개발자센터에서 카카오맵 활성화 필요)
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
    <div className={cn("relative", className)}>
      <div ref={mapRef} className={cn("w-full rounded-2xl overflow-hidden", heightClass)} data-testid="map-canvas" />
      {selected && (
        <Card className="absolute bottom-4 left-4 right-4 p-4 shadow-lg" data-testid="map-mini-card">
          <div className="flex items-center justify-between gap-3">
            <div
              className="min-w-0 cursor-pointer"
              onClick={() => setLocation(`/restaurant/${selected.restaurantId}`)}
            >
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{selected.name}</p>
                {selected.category && <Badge variant="secondary" className="text-xs shrink-0">{selected.category}</Badge>}
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
  );
}
