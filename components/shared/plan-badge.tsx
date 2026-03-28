import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PlanBadgeProps = {
  planName: string;
  variant?: "secondary" | "outline";
  className?: string;
};

export function PlanBadge({
  planName,
  variant = "secondary",
  className,
}: PlanBadgeProps) {
  return (
    <Badge variant={variant} className={cn("font-medium", className)}>
      {planName}
    </Badge>
  );
}
