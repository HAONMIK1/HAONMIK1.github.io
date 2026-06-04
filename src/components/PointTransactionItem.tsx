import { ArrowUpRight, ArrowDownRight, Plus, Image as ImageIcon, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointTransactionItemProps {
  id: string;
  type: "earn" | "spend";
  description: string;
  amount: number;
  timestamp: string;
  icon?: "restaurant" | "review" | "receipt" | "referral";
  className?: string;
}

export default function PointTransactionItem({
  id,
  type,
  description,
  amount,
  timestamp,
  icon = "restaurant",
  className,
}: PointTransactionItemProps) {
  const getIcon = () => {
    switch (icon) {
      case "review":
        return <ImageIcon className="w-5 h-5" />;
      case "receipt":
        return <Receipt className="w-5 h-5" />;
      case "referral":
        return <ArrowUpRight className="w-5 h-5" />;
      default:
        return <Plus className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={cn("flex items-center gap-3 p-4", className)}
      data-testid={`transaction-${id}`}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full",
        type === "earn" ? "bg-green-500/10" : "bg-red-500/10"
      )}>
        <div className={cn(
          type === "earn" ? "text-green-600" : "text-red-600"
        )}>
          {getIcon()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{description}</p>
        <p className="text-sm text-muted-foreground">{timestamp}</p>
      </div>

      <div className={cn(
        "font-semibold text-lg",
        type === "earn" ? "text-green-600" : "text-red-600"
      )}>
        {type === "earn" ? "+" : "-"}{amount.toLocaleString('ko-KR')}P
      </div>
    </div>
  );
}
