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
import { Search, UserPlus, Loader2, Sparkles, Users } from "lucide-react";

interface SuggestedUser {
  id: string;
  nickname: string;
}

export default function OnboardingFriends() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<SuggestedUser[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  // 초대자 정보 (가입 시 1촌 자동 연결된 사람) — /users/me 에서 노출되면 표시
  const { data: me } = useQuery({
    queryKey: ["user", "me", "onboarding"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/users/me");
      return res.json();
    },
    retry: false,
  });

  const inviterName: string | null = me?.data?.inviterNickname ?? me?.inviterNickname ?? null;

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    try {
      const res = await apiRequest("GET", `/api/v1/users/search?keyword=${encodeURIComponent(keyword)}`);
      const body = await res.json();
      const list: SuggestedUser[] = body.data ?? [];
      setSearchResults(list);
    } catch {
      setSearchResults([]);
      toast({ title: "검색 실패", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollow = (user: SuggestedUser) => {
    toast({
      title: "팔로우 기능은 준비 중이에요",
      description: `${user.nickname}님을 팔로우하는 기능은 곧 추가될 예정이에요.`,
    });
  };

  const list = searchResults ?? [];

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
            친구를 초대해보세요<br />(선택 사항이에요)
          </h1>
          <p className="text-sm text-muted-foreground">
            친구를 3명 이상 초대하면 1촌부터 3촌까지의 맛집이 더 풍성해져요
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

        {/* 검색 결과 */}
        {searchResults !== null && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground">검색 결과</h2>
            </div>

            {list.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground text-sm">
                검색 결과가 없어요
              </Card>
            ) : (
              <div className="space-y-2">
                {list.map((user) => (
                  <Card key={user.id} className="p-3 flex items-center gap-3" data-testid={`suggested-${user.id}`}>
                    <Avatar className="w-11 h-11">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.nickname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="flex-1 min-w-0 font-semibold truncate">{user.nickname}</p>
                    <Button
                      size="sm"
                      onClick={() => handleFollow(user)}
                      data-testid={`button-follow-${user.id}`}
                    >
                      <UserPlus className="w-4 h-4 mr-1" /> 팔로우
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

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
