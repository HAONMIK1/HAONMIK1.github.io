import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NakNakLogo } from "@/components/NakNakLogo";
import { Lock, Users, UtensilsCrossed, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: Lock,
    title: "초대받은 사람만 들어올 수 있어요",
    description: "낙낙은 아무나 가입할 수 없어요. 지인의 초대를 받아야만 시작할 수 있는 폐쇄형 앱이에요.",
  },
  {
    icon: Users,
    title: "1촌, 2촌, 3촌 지인 네트워크",
    description: "나와 가까운 사람부터 지인의 지인까지, 관계 거리에 따라 맛집 후기를 볼 수 있어요.",
  },
  {
    icon: UtensilsCrossed,
    title: "직접 가본 사람의 진짜 후기",
    description: "광고나 낯선 사람의 리뷰 대신, 내가 아는 사람이 실제로 다녀온 맛집만 모아 보여줘요.",
  },
];

export default function OnboardingIntro() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col">
      <div className="flex-1 px-4 py-10 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <NakNakLogo size={64} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">낙낙은 이런 앱이에요</h1>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <Card key={i} className="p-4 flex items-start gap-4" data-testid={`onboarding-intro-step-${i}`}>
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-1">{step.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t px-4 py-4">
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            className="w-full text-base gap-2"
            onClick={() => setLocation("/onboarding/register")}
            data-testid="button-onboarding-next"
          >
            시작하기
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
