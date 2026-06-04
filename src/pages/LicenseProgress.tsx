import { useState } from "react";
import { useLocation } from "wouter";
import TopHeader from "@/components/TopHeader";
import BottomNavigation from "@/components/BottomNavigation";
import LicenseCard from "@/components/LicenseCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Crown, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LicenseProgressProps {
  onNavigate?: (id: string) => void;
}

export default function LicenseProgress({ onNavigate }: LicenseProgressProps = {}) {
  const [activeTab, setActiveTab] = useState("current");

  //todo: remove mock functionality
  const currentProgress = {
    id: "explorer",
    title: "맛집러",
    description: "새로운 맛집을 발굴하고 공유하는 탐험가",
    icon: "star" as const,
    requirements: [
      { label: "맛집 등록", current: 3, target: 5, completed: false },
      { label: "사진 업로드", current: 10, target: 10, completed: true },
      { label: "영수증 인증", current: 1, target: 3, completed: false },
    ],
  };

  const allLicenses = [
    {
      id: "reviewer",
      title: "맛집 평론가",
      description: "정확하고 신뢰할 수 있는 리뷰를 작성하는 전문가",
      icon: "crown" as const,
      requirements: [
        { label: "맛집 등록", current: 3, target: 10, completed: false },
        { label: "후기 작성", current: 8, target: 20, completed: false },
        { label: "팔로워", current: 45, target: 100, completed: false },
      ],
    },
    {
      id: "explorer",
      title: "맛집러",
      description: "새로운 맛집을 발굴하고 공유하는 탐험가",
      icon: "star" as const,
      requirements: [
        { label: "맛집 등록", current: 3, target: 5, completed: false },
        { label: "사진 업로드", current: 10, target: 10, completed: true },
        { label: "영수증 인증", current: 1, target: 3, completed: false },
      ],
    },
  ];

  const completedRequirements = currentProgress.requirements.filter(r => r.completed).length;
  const totalRequirements = currentProgress.requirements.length;
  const progressPercentage = (completedRequirements / totalRequirements) * 100;

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">라이센스</h1>
            <p className="text-sm text-muted-foreground">진정한 쩝쩝박사 되기</p>
          </div>
        </div>

        {/* Current Achievement Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge variant="default" className="mb-2">
                <Target className="w-3 h-3 mr-1" />
                진행 중
              </Badge>
              <h2 className="text-xl font-bold text-foreground">
                {currentProgress.title} 도전 중
              </h2>
              <p className="text-sm text-muted-foreground">
                {completedRequirements} / {totalRequirements} 조건 달성
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary mb-1">
                {Math.round(progressPercentage)}%
              </div>
              <p className="text-xs text-muted-foreground">완료</p>
            </div>
          </div>

          <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span>조금만 더 힘내세요! 곧 라이센스를 획득할 수 있어요</span>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="current" className="flex-1" data-testid="tab-current">
              진행 중
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1" data-testid="tab-all-licenses">
              모든 라이센스
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-4 space-y-4">
            <LicenseCard
              {...currentProgress}
              unlocked={true}
              onClick={() => {}}
            />

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                빠르게 달성하는 방법
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">맛집 2곳 더 등록하기</p>
                    <p className="text-sm text-muted-foreground">사진과 함께 등록하면 각 1,500P 획득</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">영수증 2개 더 인증하기</p>
                    <p className="text-sm text-muted-foreground">각 5,000P 획득, 총 10,000P!</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="mt-4 grid gap-4 md:grid-cols-2">
            {allLicenses.map((license) => (
              <LicenseCard
                key={license.id}
                {...license}
                unlocked={true}
                selected={license.id === currentProgress.id}
                onClick={() => {}}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* Rewards Preview */}
        <Card className="p-6 bg-accent/30">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            라이센스 획득 시 혜택
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 프로필에 공식 라이센스 배지 표시</li>
            <li>• 랭킹에서 우선 노출 및 신뢰도 상승</li>
            <li>• 특별 이벤트 및 보상 우선 참여</li>
            <li>• 더 높은 등급의 라이센스 도전 가능</li>
          </ul>
        </Card>
      </div>

      <BottomNavigation onNavigate={onNavigate} />
    </div>
  );
}
