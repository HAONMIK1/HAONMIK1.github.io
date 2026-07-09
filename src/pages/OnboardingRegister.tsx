import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import AddRestaurantDialog from "@/components/AddRestaurantDialog";
import { NakNakLogo } from "@/components/NakNakLogo";
import { apiRequest } from "@/lib/queryClient";
import { Check, Plus, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const REQUIRED_COUNT = 3;

export default function OnboardingRegister() {
  const [, setLocation] = useLocation();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: reviews } = useQuery({
    queryKey: ["user", "me", "reviews"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/users/me/reviews");
      const json = await res.json();
      return (json.data?.content ?? []) as { id: number }[];
    },
    retry: false,
  });

  const count = Math.min(reviews?.length ?? 0, REQUIRED_COUNT);
  const isDone = count >= REQUIRED_COUNT;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col">
      <div className="flex-1 px-4 py-10 max-w-md mx-auto w-full text-center">
        <div className="flex justify-center mb-3">
          <NakNakLogo size={64} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">맛집 3곳을 등록해주세요</h1>
        <p className="text-sm text-muted-foreground mb-8">
          내가 아는 맛집을 등록해야 지인들도 낙낙을 이용할 수 있어요.
          <br />
          최소 3곳을 등록하면 다음 단계로 넘어갈 수 있어요.
        </p>

        <div className="flex items-center justify-center gap-3 mb-8">
          {Array.from({ length: REQUIRED_COUNT }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all",
                i < count
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-border text-muted-foreground"
              )}
              data-testid={`register-slot-${i}`}
            >
              {i < count ? <Check className="w-6 h-6" /> : <UtensilsCrossed className="w-5 h-5" />}
            </div>
          ))}
        </div>

        <p className="text-sm font-semibold text-foreground mb-6">{count}/{REQUIRED_COUNT}곳 등록 완료</p>

        {!isDone && (
          <Button
            size="lg"
            className="gap-2"
            onClick={() => setShowAddDialog(true)}
            data-testid="button-register-restaurant"
          >
            <Plus className="w-4 h-4" />
            맛집 등록하기
          </Button>
        )}
      </div>

      <div className="sticky bottom-0 bg-background border-t px-4 py-4">
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            className="w-full text-base"
            disabled={!isDone}
            onClick={() => setLocation("/onboarding/friends")}
            data-testid="button-onboarding-next"
          >
            {isDone ? "다음" : `${REQUIRED_COUNT - count}곳 더 등록해주세요`}
          </Button>
        </div>
      </div>

      <AddRestaurantDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onRestaurantAdded={() => setShowAddDialog(false)}
      />
    </div>
  );
}
