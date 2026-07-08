import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import DiscoveryFeed from "@/pages/DiscoveryFeed";
import RankingsPage from "@/pages/RankingsPage";
import UserProfilePage from "@/pages/UserProfilePage";
import PointsPage from "@/pages/PointsPage";
import OnboardingLicense from "@/pages/OnboardingLicense";
import LicenseProgress from "@/pages/LicenseProgress";
import AddRestaurantDialog from "@/components/AddRestaurantDialog";
import LoginPage from "@/pages/LoginPage";
import KakaoCallbackPage from "@/pages/KakaoCallbackPage";
import SetNicknamePage from "@/pages/SetNicknamePage";
import RestaurantDetailPage from "@/pages/RestaurantDetailPage";
import OnboardingFriends from "@/pages/OnboardingFriends";
import MapPage from "@/pages/MapPage";
import SavedRestaurantsPage from "@/pages/SavedRestaurantsPage";
import NotificationsPage from "@/pages/NotificationsPage";

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLocation("/login");
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(true);
  }, []); // 의존성 배열을 비워서 한 번만 실행

  if (isAuthenticated === null) {
    // 토큰 확인 중
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // 리다이렉트 중
  }

  return <>{children}</>;
}

function Router() {
  const [, setLocation] = useLocation();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleNavigation = (id: string) => {
    switch (id) {
      case "home":
        setLocation("/");
        break;
      case "rankings":
        setLocation("/rankings");
        break;
      case "add":
        setShowAddDialog(true);
        break;
      case "map":
        setLocation("/map");
        break;
      case "saved":
        setLocation("/saved");
        break;
      case "notifications":
        setLocation("/notifications");
        break;
      case "activity":
        setLocation("/points");
        break;
      case "profile":
        setLocation("/profile");
        break;
    }
  };

  const handleRestaurantAdded = (restaurant: any) => {
    if (restaurant?.id) setLocation(`/restaurant/${restaurant.id}`);
  };

  return (
    <>
      <Switch>
        <Route path="/login">
          {() => <LoginPage onNavigate={handleNavigation} />}
        </Route>
        <Route path="/kakao/callback">
          {() => <KakaoCallbackPage onNavigate={handleNavigation} />}
        </Route>
        <Route path="/set-nickname">
          {() => <SetNicknamePage onNavigate={handleNavigation} />}
        </Route>
        <Route path="/onboarding/friends">
          {() => <OnboardingFriends />}
        </Route>
        <Route path="/">
          {() => (
            <ProtectedRoute>
              <DiscoveryFeed onNavigate={handleNavigation} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/map">
          {() => (
            <ProtectedRoute>
              <MapPage onNavigate={handleNavigation} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/saved">
          {() => (
            <ProtectedRoute>
              <SavedRestaurantsPage onNavigate={handleNavigation} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/notifications">
          {() => (
            <ProtectedRoute>
              <NotificationsPage onNavigate={handleNavigation} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/restaurant/:id">
          {(params) => (
            <ProtectedRoute>
              <RestaurantDetailPage onNavigate={handleNavigation} restaurantId={params.id} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/invite/:code">
          {(params) => <LoginPage onNavigate={handleNavigation} inviteCode={params.code} />}
        </Route>
        <Route path="/onboarding">
          {() => (
            <ProtectedRoute>
              <OnboardingLicense />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/license">
          {() => (
            <ProtectedRoute>
              <LicenseProgress onNavigate={handleNavigation} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/rankings">
          {() => (
            <ProtectedRoute>
              <RankingsPage onNavigate={handleNavigation} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/profile">
          {() => (
            <ProtectedRoute>
              <UserProfilePage onNavigate={handleNavigation} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/profile/:id">
          {() => (
            <ProtectedRoute>
              <UserProfilePage onNavigate={handleNavigation} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/points">
          {() => (
            <ProtectedRoute>
              <PointsPage onNavigate={handleNavigation} />
            </ProtectedRoute>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
      
      <AddRestaurantDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onRestaurantAdded={handleRestaurantAdded}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
