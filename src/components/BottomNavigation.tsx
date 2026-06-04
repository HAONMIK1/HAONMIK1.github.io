import { Home, TrendingUp, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavigationProps {
  onNavigate?: (id: string) => void;
  className?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "홈", icon: <Home className="w-5 h-5" /> },
  { id: "rankings", label: "랭킹", icon: <TrendingUp className="w-5 h-5" /> },
  { id: "add", label: "등록", icon: <PlusCircle className="w-6 h-6" /> },
  { id: "profile", label: "프로필", icon: <User className="w-5 h-5" /> },
];

export default function BottomNavigation({ onNavigate, className }: BottomNavigationProps) {
  const [activeId, setActiveId] = useState("home");

  const handleClick = (id: string) => {
    setActiveId(id);
    onNavigate?.(id);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50",
        className
      )}
      data-testid="bottom-navigation"
    >
      <div className="flex justify-around items-center gap-2 h-16 max-w-7xl mx-auto px-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg flex-1 max-w-[100px] hover-elevate active-elevate-2 transition-colors",
              activeId === item.id
                ? "text-primary"
                : "text-muted-foreground"
            )}
            data-testid={`nav-${item.id}`}
          >
            <div className={cn(item.id === "add" && "scale-110")}>
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
