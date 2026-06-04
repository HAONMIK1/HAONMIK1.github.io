import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import { NakNakLogo } from "@/components/NakNakLogo";
import { Search, UserPlus, Check, Loader2, Sparkles, Users } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders(): Record<string, string> {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface SuggestedUser {
  id: string;
  nickname: string;
  reviewCount?: number;
  followerCount?: number;
}

const FALLBACK_SUGGESTED: SuggestedUser[] = [
  { id: "s1", nickname: "쩝쩝박사", reviewCount: 124, followerCount: 980 },
  { id: "s2", nickname: "강남미식가", reviewCount: 87, followerCount: 540 },
  { id: "s3", nickname: "혼밥의신", reviewCount: 65, followerCount: 410 },
  { id: "s4", nickname: "데이트맛집헌터", reviewCount: 52, followerCount: 320 },
  { id: "s5", nickname: "야식대장", reviewCount: 43, followerCount: 210 },
];

export default function OnboardingFriends() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<SuggestedUser[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  // 초대자 정보 (가입 시 1촌 자동 연결된 사람) — /users/me 에서 노출되면 표시
  const { data: me } = useQuery({
    queryKey: ["user", "me", "onboarding"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("내 정보 조회 실패");
      return res.json();
    },
    retry: false,
  });

  const inviterName: string | null = me?.data?.inviterNickname ?? me?.inviterNickname ?? null;

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/users/search?keyword=${encodeURIComponent(keyword)}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) throw new Error("검색 실패");
      const body = await res.json();
      const list: SuggestedUser[] = body.data ?? body ?? [];
      setSearchResults(list);
    } catch {
      // 백엔드 미연동 시 mock 필터
      setSearchResults(
        FALLBACK_SUGGESTED.filter((u) => u.nickname.includes(keyword.trim()))
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollow = async (user: SuggestedUser) => {
    if (followedIds.has(user.id)) return;
    setPendingId(user.id);
    try {
      await apiRequest("POST", "/api/v1/follows", { targetUserId: user.id });
    } catch {
      // 백엔드 미연동이어도 UX 흐름은 유지
    } finally {
      setFollowedIds((prev) => new Set(prev).add(user.id));
      setPendingId(null);
      toast({ title: `${user.nickname}님을 팔로우했어요`, description: "이제 이 분의 맛집이 피드에 보여요!" });
    }
  };

  const list = searchResults ?? FALLBACK_SUGGESTED;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-10 pb-6 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <NakNakLogo size={56} />
          </div>
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {inviterName ? `${inviterName}님의 초대로 시작했어요!` : "초대를 통해 시작했어요!"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            벌써 지인들의 맛집을<br />볼 수 있어요 🎉
          </h1>
          <p className="text-sm text-muted-foreground">
            친구를 더 팔로우하면 3촌까지의 맛집이 더 풍성해져요
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-xl mx-auto w-full space-y-6">
        {/* 검색 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="닉네임으로 친구 찾기"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
              data-testid="input-search-friends"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching} data-testid="button-search">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "검색"}
          </Button>
        </div>

        {/* 추천/검색 목록 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground">
              {searchResults ? "검색 결과" : "이런 쩝쩝박사는 어때요?"}
            </h2>
          </div>

          {list.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              검색 결과가 없어요
            </Card>
          ) : (
            <div className="space-y-2">
              {list.map((user) => {
                const followed = followedIds.has(user.id);
                return (
                  <Card key={user.id} className="p-3 flex items-center gap-3" data-testid={`suggested-${user.id}`}>
                    <Avatar className="w-11 h-11">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.nickname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{user.nickname}</p>
                      <p className="text-xs text-muted-foreground">
                        리뷰 {user.reviewCount ?? 0} · 팔로워 {user.followerCount ?? 0}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={followed ? "outline" : "default"}
                      onClick={() => handleFollow(user)}
                      disabled={pendingId === user.id}
                      data-testid={`button-follow-${user.id}`}
                    >
                      {pendingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : followed ? (
                        <><Check className="w-4 h-4 mr-1" /> 팔로잉</>
                      ) : (
                        <><UserPlus className="w-4 h-4 mr-1" /> 팔로우</>
                      )}
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* 친구 초대 */}
        <Button variant="outline" className="w-full gap-2" onClick={() => setShowInvite(true)} data-testid="button-invite">
          <UserPlus className="w-4 h-4" />
          카카오톡으로 친구 초대하기
        </Button>
      </div>

      {/* 하단 CTA */}
      <div className="sticky bottom-0 bg-background border-t px-4 py-4">
        <div className="max-w-xl mx-auto">
          <Button
            size="lg"
            className="w-full text-base"
            onClick={() => setLocation("/")}
            data-testid="button-explore"
          >
            바로 둘러보기
          </Button>
        </div>
      </div>

      <InviteFriendDialog open={showInvite} onOpenChange={setShowInvite} />
    </div>
  );
}
