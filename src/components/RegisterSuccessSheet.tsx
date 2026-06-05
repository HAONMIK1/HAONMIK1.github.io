import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getUserLevel, getLevelProgress } from "@/lib/levels";

interface RegisterSuccessSheetProps {
  restaurantName: string;
  earnedXp: number;
  currentXp: number;
  networkSize?: number;
  isFirstDiscovery?: boolean;
  onClose: () => void;
  onAddMore: () => void;
}

export default function RegisterSuccessSheet({
  restaurantName,
  earnedXp,
  currentXp,
  networkSize = 17,
  isFirstDiscovery = false,
  onClose,
  onAddMore,
}: RegisterSuccessSheetProps) {
  const prevXp = currentXp - earnedXp;
  const prevLevel = getUserLevel(prevXp);
  const currLevel = getUserLevel(currentXp);
  const didLevelUp = currLevel.level > prevLevel.level;
  const { percent, remaining } = getLevelProgress(currentXp);

  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setBarWidth(percent), 100);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div className="py-2 text-center space-y-5">
      {/* 이모지 + 축하 */}
      <div>
        <div className="text-6xl mb-3">{didLevelUp ? "🎊" : "🎉"}</div>
        <h2 className="text-xl font-bold text-foreground">
          {didLevelUp ? `Lv.${currLevel.level} ${currLevel.title}로 레벨업!` : "등록 완료!"}
        </h2>
        {restaurantName && (
          <p className="text-sm text-muted-foreground mt-1 truncate px-4">
            {restaurantName}
          </p>
        )}
      </div>

      {/* XP 획득 */}
      <div className="bg-primary/5 rounded-2xl p-4 mx-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl font-bold text-primary">+{earnedXp} XP</span>
          {isFirstDiscovery && (
            <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5 font-medium">
              🔍 최초 발굴 보너스
            </span>
          )}
        </div>

        {/* XP 바 */}
        <div className="text-xs text-muted-foreground mb-1.5 flex justify-between">
          <span>
            {currLevel.emoji} Lv.{currLevel.level} {currLevel.title}
          </span>
          {remaining > 0 && (
            <span>다음 레벨까지 {remaining} XP</span>
          )}
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${currLevel.bgClass} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* 네트워크 임팩트 */}
      <p className="text-sm text-muted-foreground">
        지금 내 친구{" "}
        <span className="text-foreground font-semibold">{networkSize}명</span>
        이 이 맛집을 볼 수 있어요
      </p>

      {/* 버튼 */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={onAddMore}>
          더 등록하기
        </Button>
        <Button className="flex-1" onClick={onClose}>
          확인
        </Button>
      </div>
    </div>
  );
}
