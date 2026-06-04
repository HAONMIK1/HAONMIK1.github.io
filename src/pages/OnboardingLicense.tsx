import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LicenseCard from "@/components/LicenseCard";
import { Sparkles, Trophy, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function OnboardingLicense() {
  const [, setLocation] = useLocation();
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);

  //todo: remove mock functionality
  const licenses = [
    {
      id: "reviewer",
      title: "맛집 평론가",
      description: "정확하고 신뢰할 수 있는 리뷰를 작성하는 전문가",
      icon: "crown" as const,
      requirements: [
        { label: "맛집 등록", current: 0, target: 10, completed: false },
        { label: "후기 작성", current: 0, target: 20, completed: false },
        { label: "팔로워", current: 0, target: 100, completed: false },
      ],
    },
    {
      id: "explorer",
      title: "맛집러",
      description: "새로운 맛집을 발굴하고 공유하는 탐험가",
      icon: "star" as const,
      requirements: [
        { label: "맛집 등록", current: 0, target: 5, completed: false },
        { label: "사진 업로드", current: 0, target: 10, completed: false },
        { label: "영수증 인증", current: 0, target: 3, completed: false },
      ],
    },
  ];

  const handleStart = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-12 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            진정한 쩝쩝박사가<br />되어보세요!
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
            낙낙에서 활동하고 라이센스를 획득하면<br />
            전문 평론가로 인정받을 수 있어요
          </p>

          <Card className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-accent/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              가입 보너스 1,000P 지급됨!
            </span>
          </Card>
        </div>
      </div>

      {/* License Selection */}
      <div className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            목표 라이센스 선택
          </h2>
          <p className="text-muted-foreground">
            원하는 라이센스를 선택하고 달성해보세요. 나중에 변경할 수 있어요!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {licenses.map((license) => (
            <LicenseCard
              key={license.id}
              {...license}
              unlocked={true}
              selected={selectedLicense === license.id}
              onClick={() => setSelectedLicense(license.id)}
            />
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">500P+</div>
            <p className="text-sm text-muted-foreground">맛집 등록마다</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">5,000P</div>
            <p className="text-sm text-muted-foreground">영수증 인증</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">Top 10</div>
            <p className="text-sm text-muted-foreground">랭킹 보상</p>
          </Card>
        </div>

        {/* Achievement Tips */}
        <Card className="p-6 bg-accent/30 mb-8">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            라이센스 획득 팁
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 사진과 함께 맛집을 등록하면 1,500P를 획득해요</li>
            <li>• 영수증을 인증하면 5,000P를 한 번에 받을 수 있어요</li>
            <li>• 친구를 초대하면 추가 포인트와 팔로워가 늘어나요</li>
            <li>• 주간/월간 랭킹에 들면 특별 보상을 받을 수 있어요</li>
            <li>• 라이센스를 획득하면 공식 배지와 함께 신뢰도가 올라가요</li>
          </ul>
        </Card>

        {/* CTA Button */}
        <div className="sticky bottom-0 bg-background pt-4 pb-6 border-t">
          <Button
            size="lg"
            className="w-full gap-2 text-lg"
            onClick={handleStart}
            disabled={!selectedLicense}
            data-testid="button-start-journey"
          >
            {selectedLicense ? (
              <>
                시작하기
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              "목표 라이센스를 선택하세요"
            )}
          </Button>
          {selectedLicense && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              선택한 라이센스: <span className="font-semibold text-foreground">
                {licenses.find(l => l.id === selectedLicense)?.title}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
