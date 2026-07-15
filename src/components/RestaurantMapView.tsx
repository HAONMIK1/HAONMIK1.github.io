import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export interface ReviewListItem {
  reviewId: number;
  restaurantId: string;
  restaurantName: string;
  userId: number;
  nickname: string;
  rating: number;
}

interface RestaurantMapViewProps {
  places: MapPlace[];
  reviewItems?: ReviewListItem[];
  myUserId?: number;
  followingIds?: number[];
  heightClass?: string;
  className?: string;
}

export default function RestaurantMapView({
  places,
  reviewItems,
  myUserId,
  followingIds,
  heightClass = "h-[60vh]",
  className,
}: RestaurantMapViewProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mapReady, setMapReady] = useState(false);
  const [sdkFailed, setSdkFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [followingSet, setFollowingSet] = useState<Set<number>>(new Set(followingIds));
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setFollowingSet(new Set(followingIds));
  }, [followingIds]);

  const handleToggleFollow = async (e: React.MouseEvent, targetUserId: number) => {
    e.stopPropagation();
    const isFollowing = followingSet.has(targetUserId);
    setFollowingSet((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(targetUserId);
      else next.add(targetUserId);
      return next;
    });
    try {
      await apiRequest(isFollowing ? "DELETE" : "POST", `/api/v1/users/${targetUserId}/follow`);
    } catch (error) {
      setFollowingSet((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.add(targetUserId);
        else next.delete(targetUserId);
        return next;
      });
      toast({
        title: "팔로우 처리에 실패했어요",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

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
      naver.maps.Event.addListener(marker, "click", () => focusPlace(p, { panMap: false }));
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

  const focusPlace = (place: MapPlace, options?: { panMap?: boolean }) => {
    setSelectedId(place.restaurantId);
    if ((options?.panMap ?? true) && mapInstance.current && window.naver) {
      mapInstance.current.panTo(new window.naver.maps.LatLng(place.lat, place.lng));
    }
    cardRefs.current[place.restaurantId]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
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

  const isEmpty = reviewItems ? reviewItems.length === 0 : places.length === 0;

  return (
    <div className={cn("relative", className)}>
      {/* 지도 — 목록을 옆에 따로 두지 않고 하단에 오버레이 캐러셀로 겹쳐서 보여준다 (좁은 화면 대응) */}
      <div ref={mapRef} className={cn("w-full rounded-2xl overflow-hidden", heightClass)} data-testid="map-canvas" />

      {isEmpty ? (
        <div
          className="absolute bottom-3 left-3 right-3 rounded-xl bg-card/95 backdrop-blur-sm py-3 text-center text-xs text-muted-foreground shadow-lg"
          data-testid="map-overlay-empty"
        >
          {reviewItems ? "표시할 후기가 없어요" : "표시할 맛집이 없어요"}
        </div>
      ) : (
        <div
          className="absolute bottom-3 left-0 right-0 flex gap-2 overflow-x-auto px-3 pb-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          data-testid="map-overlay-list"
        >
          {reviewItems
            ? reviewItems.map((item) => {
                const place = places.find((p) => p.restaurantId === item.restaurantId);
                const isFollowing = followingSet.has(item.userId);
                const isSelected = selectedId === item.restaurantId;
                return (
                  <Card
                    key={item.reviewId}
                    ref={(el) => {
                      cardRefs.current[item.restaurantId] = el;
                    }}
                    className={cn(
                      "shrink-0 w-[180px] snap-start p-2.5 cursor-pointer shadow-lg transition-colors",
                      isSelected ? "border-primary bg-primary/5" : "bg-card/95 backdrop-blur-sm"
                    )}
                    onClick={() => place && focusPlace(place)}
                    data-testid={`map-overlay-item-${item.reviewId}`}
                  >
                    <p className="text-xs font-semibold truncate">{item.restaurantName}</p>
                    <div className="flex items-center justify-between gap-1 mt-1">
                      <p
                        className="text-[10px] text-muted-foreground truncate hover:text-foreground hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/profile/${item.userId}`);
                        }}
                        data-testid={`map-overlay-nickname-${item.userId}`}
                      >
                        {item.nickname}
                      </p>
                      {myUserId !== item.userId && (
                        <button
                          type="button"
                          onClick={(e) => handleToggleFollow(e, item.userId)}
                          className="shrink-0"
                          data-testid={`button-follow-${item.userId}`}
                        >
                          <Badge
                            variant={isFollowing ? "default" : "outline"}
                            className="text-[9px] font-normal cursor-pointer px-1.5 py-0"
                          >
                            {isFollowing ? "팔로잉" : "팔로우"}
                          </Badge>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] font-medium">{item.rating}</span>
                    </div>
                    {isSelected && (
                      <div className="flex gap-1.5 mt-2">
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/restaurant/${item.restaurantId}`);
                          }}
                        >
                          상세
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })
            : places.map((p) => {
                const isSelected = selectedId === p.restaurantId;
                return (
                  <Card
                    key={p.restaurantId}
                    ref={(el) => {
                      cardRefs.current[p.restaurantId] = el;
                    }}
                    className={cn(
                      "shrink-0 w-[180px] snap-start p-2.5 cursor-pointer shadow-lg transition-colors",
                      isSelected ? "border-primary bg-primary/5" : "bg-card/95 backdrop-blur-sm"
                    )}
                    onClick={() => focusPlace(p)}
                    data-testid={`map-overlay-item-${p.restaurantId}`}
                  >
                    <p className="text-xs font-semibold truncate">{p.name}</p>
                    {p.category && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{p.category}</p>}
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] font-medium">{(p.ratingAverage ?? 0).toFixed(1)}</span>
                    </div>
                    {isSelected && (
                      <div className="flex gap-1.5 mt-2">
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/restaurant/${p.restaurantId}`);
                          }}
                        >
                          상세
                        </Button>
                        {p.naverPlaceUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 h-7 text-xs px-2 text-[#03C75A]"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(p.naverPlaceUrl, "_blank");
                            }}
                            data-testid="map-naver-link"
                          >
                            <ExternalLink className="w-3 h-3" /> 네이버
                          </Button>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
        </div>
      )}
    </div>
  );
}
