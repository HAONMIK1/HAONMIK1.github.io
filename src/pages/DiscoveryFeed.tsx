import { useState } from "react";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import { Button } from "@/components/ui/button";
import { Plus, UtensilsCrossed } from "lucide-react";

interface DiscoveryFeedProps {
  onNavigate?: (id: string) => void;
}

export default function DiscoveryFeed({ onNavigate }: DiscoveryFeedProps = {}) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader onInviteFriendClick={() => setShowInviteDialog(true)} />

      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-24">
          <UtensilsCrossed className="w-14 h-14 mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="text-xl font-bold text-foreground mb-2">아직 등록된 맛집이 없어요</h1>
          <p className="text-sm text-muted-foreground mb-6">
            가장 먼저 맛집을 등록하고 첫 후기를 남겨보세요
          </p>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => onNavigate?.("add")}
            data-testid="button-go-add"
          >
            <Plus className="w-4 h-4" />
            맛집 등록하기
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
