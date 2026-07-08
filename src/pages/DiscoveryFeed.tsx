import { useState } from "react";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Search, UtensilsCrossed } from "lucide-react";

interface DiscoveryFeedProps {
  onNavigate?: (id: string) => void;
}

export default function DiscoveryFeed({ onNavigate }: DiscoveryFeedProps = {}) {
  const [, setLocation] = useLocation();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader
        onInviteFriendClick={() => setShowInviteDialog(true)}
        onSearchClick={() => setLocation("/search")}
      />

      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-24">
          <UtensilsCrossed className="w-14 h-14 mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="text-xl font-bold text-foreground mb-2">맛집을 검색해보세요</h1>
          <p className="text-sm text-muted-foreground mb-6">
            이름이나 주소로 검색하고, 없으면 직접 등록해보세요
          </p>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => setLocation("/search")}
            data-testid="button-go-search"
          >
            <Search className="w-4 h-4" />
            맛집 검색하러 가기
          </Button>
        </div>
      </div>

      <InviteFriendDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
