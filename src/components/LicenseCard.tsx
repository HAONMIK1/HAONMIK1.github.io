import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LicenseRequirement {
  label: string;
  current: number;
  target: number;
  completed: boolean;
}

interface LicenseCardProps {
  title: string;
  description: string;
  icon: "crown" | "star";
  requirements: LicenseRequirement[];
  unlocked?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function LicenseCard({
  title,
  description,
  icon,
  requirements,
  unlocked = false,
  selected = false,
  onClick,
  className,
}: LicenseCardProps) {
  const IconComponent = icon === "crown" ? Crown : Star;

  return (
    <Card
      className={cn(
        "p-6 cursor-pointer transition-all relative overflow-hidden",
        unlocked ? "hover-elevate active-elevate-2" : "opacity-60",
        selected && "border-primary border-2",
        className
      )}
      onClick={unlocked ? onClick : undefined}
      data-testid={`license-card-${title}`}
    >
      {!unlocked && (
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          "flex items-center justify-center w-16 h-16 rounded-full",
          unlocked ? "bg-primary/10" : "bg-muted"
        )}>
          <IconComponent className={cn(
            "w-8 h-8",
            unlocked ? "text-primary" : "text-muted-foreground"
          )} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            {unlocked && (
              <Badge variant="default" className="gap-1">
                획득 가능
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {requirements.map((req, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{req.label}</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-medium",
                  req.completed ? "text-green-600" : "text-muted-foreground"
                )}>
                  {req.current} / {req.target}
                </span>
                {req.completed && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all",
                  req.completed ? "bg-green-600" : "bg-primary"
                )}
                style={{ width: `${Math.min((req.current / req.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
