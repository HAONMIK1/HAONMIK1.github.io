import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  label: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export default function CategoryBadge({ label, variant = "secondary", className }: CategoryBadgeProps) {
  return (
    <Badge variant={variant} className={cn("text-xs font-medium", className)} data-testid={`badge-${label}`}>
      {label}
    </Badge>
  );
}
