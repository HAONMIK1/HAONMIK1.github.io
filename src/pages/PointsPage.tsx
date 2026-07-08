import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Coins } from "lucide-react";

interface PointsPageProps {
  onNavigate?: (id: string) => void;
}

export default function PointsPage({ onNavigate }: PointsPageProps = {}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10">
            <Coins className="w-6 h-6 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">포인트</h1>
        </div>

        <div className="text-center py-20 text-muted-foreground">
          <Coins className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg font-medium mb-1">준비 중인 기능이에요</p>
          <p className="text-sm">포인트 기능은 곧 만나보실 수 있어요</p>
        </div>
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
