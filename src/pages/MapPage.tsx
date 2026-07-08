import { useLocation } from "wouter";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Map, Search } from "lucide-react";

interface MapPageProps {
  onNavigate?: (id: string) => void;
}

export default function MapPage({ onNavigate }: MapPageProps = {}) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader onSearchClick={() => setLocation("/search")} />

      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-24">
          <Map className="w-14 h-14 mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="text-xl font-bold text-foreground mb-2">준비 중인 기능이에요</h1>
          <p className="text-sm text-muted-foreground mb-6">
            지도로 맛집 찾기는 곧 만나보실 수 있어요
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

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
