import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import DiscoveryFeed from "@/pages/DiscoveryFeed";
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
import OnboardingIntro from "@/pages/OnboardingIntro";
import OnboardingRegister from "@/pages/OnboardingRegister";
import SavedRestaurantsPage from "@/pages/SavedRestaurantsPage";
import NotificationsPage from "@/pages/NotificationsPage";

// 맛집 등록(필수) 온보딩을 마쳐야 넘어갈 수 있는 최소 등록 개수.
// OnboardingRegister.tsx의 REQUIRED_COUNT와 반드시 동일해야 한다.
const ONBOARDING_REQUIRED_REVIEWS = 3;

// 보호된 라우트 컴포넌트
// 로그인 여부뿐 아니라, 온보딩 중 맛집 등록(필수)을 마치지 않고 이탈했다가
// 다시 들어온 경우에도 /onboarding/register로 돌려보낸다. (온보딩 완료 여부를
// 서버에 별도 저장하지 않고, "리뷰가 3개 이상인가"로 판단한다 — 새 필드 없이
// 기존 데이터로 충분하기 때문.)
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

  const { data: reviewCount, isLoading: isCheckingOnboarding, isError: onboardingCheckFailed } = useQuery({
    queryKey: ["user", "me", "reviews", "count"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/users/me/reviews");
      const json = await res.json();
      return (json.data?.totalElements ?? json.data?.content?.length ?? 0) as number;
    },
    enabled: isAuthenticated === true,
    retry: false,
    staleTime: 0,
  });

  const onboardingIncomplete =
    isAuthenticated === true &&
    !onboardingCheckFailed &&
    reviewCount !== undefined &&
    reviewCount < ONBOARDING_REQUIRED_REVIEWS;

  useEffect(() => {
    if (onboardingIncomplete) {
      setLocation("/onboarding/register");
    }
  }, [onboardingIncomplete]);

  if (isAuthenticated === null || (isAuthenticated && isCheckingOnboarding)) {
    // 토큰 확인 중이거나 온보딩 완료 여부 확인 중
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || onboardingIncomplete) {
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
      case "add":
        setShowAddDialog(true);
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
        <Route path="/onboarding/intro">
          {() => <OnboardingIntro />}
        </Route>
        <Route path="/onboarding/register">
          {() => <OnboardingRegister />}
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
        <Route path="/profile">
          {() => (
            <ProtectedRoute>
              <UserProfilePage onNavigate={handleNavigation} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/profile/:id">
          {(params) => (
            <ProtectedRoute>
              <UserProfilePage onNavigate={handleNavigation} userId={params.id} />
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
