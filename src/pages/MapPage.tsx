import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Map } from "lucide-react";

interface MapPageProps {
  onNavigate?: (id: string) => void;
}

export default function MapPage({ onNavigate }: MapPageProps = {}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />

      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-24">
          <Map className="w-14 h-14 mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="text-xl font-bold text-foreground mb-2">준비 중인 기능이에요</h1>
          <p className="text-sm text-muted-foreground">
            지도로 맛집 찾기는 곧 만나보실 수 있어요
          </p>
        </div>
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
