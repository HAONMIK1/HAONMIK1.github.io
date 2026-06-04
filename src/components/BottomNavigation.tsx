import { Home, TrendingUp, PlusCircle, User } from "lucide-react";
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
  { id: "rankings", label: "랭킹", icon: <TrendingUp className="w-5 h-5" />, path: "/rankings" },
  { id: "add", label: "등록", icon: <PlusCircle className="w-6 h-6" />, path: "" },
  { id: "profile", label: "프로필", icon: <User className="w-5 h-5" />, path: "/profile" },
];

function getActiveId(pathname: string): string {
  if (pathname === "/" || pathname.startsWith("/restaurant") || pathname.startsWith("/review") || pathname === "/search") return "home";
  if (pathname.startsWith("/rankings")) return "rankings";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/points")) return "profile";
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
        "fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50",
        className
      )}
      data-testid="bottom-navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-7xl mx-auto px-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg flex-1 max-w-[100px] transition-colors",
              item.id === "add"
                ? "text-primary"
                : activeId === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-testid={`nav-${item.id}`}
          >
            <div
              className={cn(
                "transition-transform",
                item.id === "add" && "scale-110",
                activeId === item.id && item.id !== "add" && "scale-105"
              )}
            >
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
