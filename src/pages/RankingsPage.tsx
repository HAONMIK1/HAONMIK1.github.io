import { useLocation } from "wouter";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Trophy } from "lucide-react";

interface RankingsPageProps {
  onNavigate?: (id: string) => void;
}

export default function RankingsPage({ onNavigate }: RankingsPageProps = {}) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader onSearchClick={() => setLocation("/search")} />

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">랭킹</h1>
            <p className="text-sm text-muted-foreground">쩝쩝박사 리더보드</p>
          </div>
        </div>

        <div className="text-center py-20 text-muted-foreground">
          <Trophy className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg font-medium mb-1">준비 중인 기능이에요</p>
          <p className="text-sm">랭킹 기능은 곧 만나보실 수 있어요</p>
        </div>
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
