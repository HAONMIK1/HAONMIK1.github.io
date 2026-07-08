import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Bell } from "lucide-react";

interface NotificationsPageProps {
  onNavigate?: (id: string) => void;
}

export default function NotificationsPage({ onNavigate }: NotificationsPageProps = {}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />

      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">알림</h1>
        </div>

        <div className="text-center py-20 text-muted-foreground">
          <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg font-medium mb-1">준비 중인 기능이에요</p>
          <p className="text-sm">알림 기능은 곧 만나보실 수 있어요</p>
        </div>
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
