import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getAvatarColorClass } from "@/lib/avatarColor";

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
  imageUrl?: string;
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
  const [spotlightUserId, setSpotlightUserId] = useState<number | null>(null);
  const [followingSet, setFollowingSet] = useState<Set<number>>(new Set(followingIds));
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setFollowingSet(new Set(followingIds));
  }, [followingIds]);

  // 맛집 하나에 여러 후기가 있을 수 있어, 마커에는 대표로 첫 리뷰어의 아바타를 보여준다.
  const reviewerByRestaurant = useMemo(() => {
    const map = new Map<string, ReviewListItem>();
    reviewItems?.forEach((item) => {
      if (!map.has(item.restaurantId)) map.set(item.restaurantId, item);
    });
    return map;
  }, [reviewItems]);

  // 지도 위 아바타 스택용 — 피드에 등장하는 고유 리뷰어 목록
  const uniqueReviewers = useMemo(() => {
    const seen = new Map<number, ReviewListItem>();
    reviewItems?.forEach((item) => {
      if (!seen.has(item.userId)) seen.set(item.userId, item);
    });
    return Array.from(seen.values());
  }, [reviewItems]);

  // 스포트라이트 중이면 그 사람이 후기 남긴 맛집 ID 집합
  const spotlightRestaurantIds = useMemo(() => {
    if (spotlightUserId === null) return null;
    const ids = new Set<string>();
    reviewItems?.forEach((item) => {
      if (item.userId === spotlightUserId) ids.add(item.restaurantId);
    });
    return ids;
  }, [spotlightUserId, reviewItems]);

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

  // 마커 아이콘: 평소엔 전부 같은 모양의 작은 점으로 통일해서 인원이 많아도 지도가 정신없어 보이지
  // 않게 하고, 선택된 마커 하나만 그 리뷰어의 색/이니셜 아바타로 확대해 "누구인지"를 보여준다.
  // 아바타 스택에서 사람을 고르면(스포트라이트) 그 사람 맛집만 아바타 칩으로 강조하고 나머지는 흐리게.
  const buildIcon = (naver: any, place: MapPlace, isSelected: boolean) => {
    const spotlightUser =
      spotlightUserId !== null ? uniqueReviewers.find((u) => u.userId === spotlightUserId) : undefined;
    const inSpotlight = spotlightRestaurantIds?.has(place.restaurantId) ?? false;
    const reviewer = (inSpotlight && spotlightUser) || reviewerByRestaurant.get(place.restaurantId);
    // Tailwind JIT는 동적 클래스명을 못 잡으므로 테두리는 inline style로 지정한다.
    const avatarChip = (nickname: string, px: number, borderPx: number) => ({
      content: `<div style="width:${px}px;height:${px}px;border:${borderPx}px solid white" class="rounded-full ${getAvatarColorClass(
        nickname
      )} shadow-xl flex items-center justify-center text-white font-bold ${
        px >= 36 ? "text-sm" : "text-[11px]"
      } select-none">${nickname.charAt(0)}</div>`,
      size: new naver.maps.Size(px, px),
      anchor: new naver.maps.Point(px / 2, px / 2),
    });

    if (isSelected) {
      return reviewer
        ? avatarChip(reviewer.nickname, 40, 3)
        : {
            content: `<div style="width:22px;height:22px" class="rounded-full bg-primary border-[3px] border-white shadow-xl"></div>`,
            size: new naver.maps.Size(22, 22),
            anchor: new naver.maps.Point(11, 11),
          };
    }

    if (spotlightRestaurantIds !== null) {
      if (inSpotlight && spotlightUser) {
        return avatarChip(spotlightUser.nickname, 28, 2);
      }
      // 스포트라이트에서 제외된 맛집 — 흐린 회색 점
      return {
        content: `<div style="width:12px;height:12px" class="rounded-full bg-gray-400/40 border border-white/70"></div>`,
        size: new naver.maps.Size(12, 12),
        anchor: new naver.maps.Point(6, 6),
      };
    }

    return {
      content: `<div style="width:14px;height:14px" class="rounded-full bg-primary/80 border-2 border-white shadow-md"></div>`,
      size: new naver.maps.Size(14, 14),
      anchor: new naver.maps.Point(7, 7),
    };
  };

  // 마커 갱신 (선택된 네트워크 필터에 따라 상위(DiscoveryFeed)에서 이미 걸러진 places가 내려온다)
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;
    const { naver } = window;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new naver.maps.LatLngBounds();
    places.forEach((p) => {
      const pos = new naver.maps.LatLng(p.lat, p.lng);
      const marker = new naver.maps.Marker({
        position: pos,
        map: mapInstance.current,
        title: p.name,
        icon: buildIcon(naver, p, p.restaurantId === selectedId),
      });
      naver.maps.Event.addListener(marker, "click", () => focusPlace(p, { panMap: false }));
      markersRef.current.push(marker);
      bounds.extend(pos);
    });
    if (places.length > 0) mapInstance.current.fitBounds(bounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, places]);

  // 선택/스포트라이트가 바뀌면 마커를 다시 그리지 않고 아이콘만 교체
  useEffect(() => {
    if (!mapReady || !window.naver) return;
    const { naver } = window;
    markersRef.current.forEach((marker, i) => {
      const place = places[i];
      if (!place) return;
      marker.setIcon(buildIcon(naver, place, place.restaurantId === selectedId));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, spotlightUserId, reviewerByRestaurant]);

  // 필터가 바뀌어 선택된 장소가 목록에서 사라지면 선택 해제
  useEffect(() => {
    if (selectedId && !places.some((p) => p.restaurantId === selectedId)) {
      setSelectedId(null);
    }
  }, [places, selectedId]);

  // 필터가 바뀌어 스포트라이트 대상이 피드에서 사라지면 스포트라이트 해제
  useEffect(() => {
    if (spotlightUserId !== null && !uniqueReviewers.some((u) => u.userId === spotlightUserId)) {
      setSpotlightUserId(null);
    }
  }, [uniqueReviewers, spotlightUserId]);

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

  const MAX_STACK_AVATARS = 5;
  const visibleCarouselItems =
    spotlightUserId !== null
      ? reviewItems?.filter((item) => item.userId === spotlightUserId)
      : reviewItems;

  return (
    <div className={cn("relative", className)}>
      {/* 지도 — 목록을 옆에 따로 두지 않고 하단에 오버레이 캐러셀로 겹쳐서 보여준다 (좁은 화면 대응) */}
      <div ref={mapRef} className={cn("w-full rounded-2xl overflow-hidden", heightClass)} data-testid="map-canvas" />

      {/* 리뷰어 아바타 스택 — 탭하면 그 사람 맛집만 스포트라이트 */}
      {uniqueReviewers.length > 0 && (
        <div
          className="absolute top-3 left-3 z-10 flex items-center rounded-full bg-card/90 backdrop-blur-sm shadow-md px-2 py-1.5"
          data-testid="map-reviewer-stack"
        >
          <div className="flex -space-x-2">
            {uniqueReviewers.slice(0, MAX_STACK_AVATARS).map((reviewer) => {
              const isSpotlit = spotlightUserId === reviewer.userId;
              return (
                <button
                  key={reviewer.userId}
                  type="button"
                  onClick={() =>
                    setSpotlightUserId((prev) => (prev === reviewer.userId ? null : reviewer.userId))
                  }
                  className={cn(
                    "rounded-full transition-transform",
                    isSpotlit && "scale-110 z-10 relative"
                  )}
                  aria-label={`${reviewer.nickname} 맛집 보기`}
                  data-testid={`map-spotlight-${reviewer.userId}`}
                >
                  <Avatar
                    className={cn(
                      "w-8 h-8 ring-2 shadow-sm",
                      isSpotlit ? "ring-primary" : "ring-white",
                      spotlightUserId !== null && !isSpotlit && "opacity-45"
                    )}
                  >
                    <AvatarFallback
                      className={cn(getAvatarColorClass(reviewer.nickname), "text-white text-[11px] font-bold")}
                    >
                      {reviewer.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              );
            })}
          </div>
          {uniqueReviewers.length > MAX_STACK_AVATARS && (
            <span className="ml-1.5 text-[11px] font-semibold text-muted-foreground">
              +{uniqueReviewers.length - MAX_STACK_AVATARS}
            </span>
          )}
          {spotlightUserId !== null && (
            <span className="ml-2 text-xs font-semibold text-primary truncate max-w-[80px]">
              {uniqueReviewers.find((u) => u.userId === spotlightUserId)?.nickname}
            </span>
          )}
        </div>
      )}

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
          {visibleCarouselItems
            ? visibleCarouselItems.map((item) => {
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
                      "shrink-0 w-[200px] snap-start p-3 cursor-pointer shadow-lg transition-colors border-none",
                      isSelected ? "ring-2 ring-primary bg-card" : "bg-card/95 backdrop-blur-sm"
                    )}
                    onClick={() => place && focusPlace(place)}
                    data-testid={`map-overlay-item-${item.reviewId}`}
                  >
                    {/* 맛집 사진 — 있으면 카드가 훨씬 풍성해 보인다 */}
                    {place?.imageUrl && (
                      <div className="h-20 w-full rounded-lg overflow-hidden mb-2.5 bg-muted">
                        <img src={place.imageUrl} alt={item.restaurantName} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* 1순위: 맛집 이름 + 별점 */}
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-sm font-bold truncate">{item.restaurantName}</p>
                      <span className="flex items-center gap-0.5 text-xs font-semibold shrink-0">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {item.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* 2순위: 작성자 — 작고 은은하게 */}
                    <div
                      className="flex items-center gap-1.5 mt-2.5 min-w-0 group/author"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/profile/${item.userId}`);
                      }}
                      data-testid={`map-overlay-nickname-${item.userId}`}
                    >
                      <Avatar className="w-5 h-5 shrink-0">
                        <AvatarFallback
                          className={cn(getAvatarColorClass(item.nickname), "text-white text-[9px] font-bold")}
                        >
                          {item.nickname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground truncate group-hover/author:text-foreground group-hover/author:underline">
                        {item.nickname}
                      </p>
                    </div>

                    {/* 선택됐을 때만 액션 노출 — 평소엔 정보만, 필요할 때만 버튼 */}
                    {isSelected && (
                      <div className="flex items-center gap-1.5 mt-3">
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
                        {myUserId !== item.userId && (
                          <Button
                            size="sm"
                            variant={isFollowing ? "secondary" : "outline"}
                            className="h-7 text-xs px-2"
                            onClick={(e) => handleToggleFollow(e, item.userId)}
                            data-testid={`button-follow-${item.userId}`}
                          >
                            {isFollowing ? "팔로잉" : "팔로우"}
                          </Button>
                        )}
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
