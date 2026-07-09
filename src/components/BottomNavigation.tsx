import { Home, TrendingUp, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface BottomNavigationProps {
  onNavigate?: (id: string) => void;
  className?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "홈", icon: <Home className="w-5 h-5" />, path: "/" },
  { id: "add", label: "등록", icon: <Plus className="w-6 h-6" strokeWidth={2.5} />, path: "" },
  { id: "rankings", label: "랭킹", icon: <TrendingUp className="w-5 h-5" />, path: "/rankings" },
  { id: "profile", label: "프로필", icon: <User className="w-5 h-5" />, path: "/profile" },
];

function getActiveId(pathname: string): string {
  if (pathname === "/" || pathname.startsWith("/restaurant") || pathname.startsWith("/review")) return "home";
  if (pathname.startsWith("/rankings")) return "rankings";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/points")) return "profile";
  if (pathname.startsWith("/saved")) return "profile";
  if (pathname.startsWith("/license")) return "profile";
  return "home";
}

export default function BottomNavigation({ onNavigate, className }: BottomNavigationProps) {
  const [location] = useLocation();
  const activeId = getActiveId(location);

  const handleClick = (id: string) => {
    onNavigate?.(id);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
      data-testid="bottom-navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          // 중앙 '등록' 버튼 — 토스풍 강조 액션
          if (item.id === "add") {
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className="flex flex-col items-center justify-center flex-1 max-w-[100px]"
                data-testid={`nav-${item.id}`}
                aria-label="맛집 등록"
              >
                <div className="flex items-center justify-center w-12 h-12 -mt-1 rounded-2xl bg-primary text-primary-foreground shadow-md active:scale-95 transition-transform">
                  {item.icon}
                </div>
              </button>
            );
          }

          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl flex-1 max-w-[100px]",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={`nav-${item.id}`}
            >
              <div className={cn("transition-transform", active && "scale-105")}>
                {item.icon}
              </div>
              <span className={cn("text-[11px]", active ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
