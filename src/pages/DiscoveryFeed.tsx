import { useState } from "react";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import InviteFriendDialog from "@/components/InviteFriendDialog";
import { cn } from "@/lib/utils";
import { UtensilsCrossed } from "lucide-react";

type NetworkFilter = "1st" | "2nd" | "3rd";

interface DiscoveryFeedProps {
  onNavigate?: (id: string) => void;
}

export default function DiscoveryFeed({ onNavigate }: DiscoveryFeedProps = {}) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>("1st");

  // 팔로우/피드 기능은 아직 백엔드에 없어서 실제 데이터는 항상 비어있다.
  // 화면 구조만 먼저 갖춰두고, 백엔드에 피드 API가 생기면 여기에 연결한다.
  const restaurants: any[] = [];

  const filterLabel = { "1st": "1촌", "2nd": "2촌", "3rd": "3촌+" }[networkFilter];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader onInviteFriendClick={() => setShowInviteDialog(true)} />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <section>
          <div className="grid grid-cols-3 gap-2">
            {(["1st", "2nd", "3rd"] as NetworkFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setNetworkFilter(filter)}
                className={cn(
                  "py-3 px-4 rounded-lg border-2 transition-all hover-elevate active-elevate-2",
                  networkFilter === filter
                    ? "bg-primary/10 dark:bg-primary/20 border-primary text-primary"
                    : "bg-card border-border"
                )}
                data-testid={`filter-${filter}`}
              >
                <div className="text-center text-sm font-semibold">
                  {{ "1st": "1촌", "2nd": "2촌", "3rd": "3촌+" }[filter]}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">{filterLabel} 맛집</h2>

          {restaurants.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium mb-1">아직 표시할 맛집이 없어요</p>
              <p className="text-sm">친구를 팔로우하면 이곳에 맛집이 모여요</p>
            </div>
          ) : null}
        </section>
      </div>

      <InviteFriendDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
