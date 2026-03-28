import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, Sparkles } from "lucide-react";
import type { TemplateTier } from "@/lib/generated/prisma/client";

const TIER_CONFIG: Record<TemplateTier, {
  label: string;
  variant: "default" | "secondary" | "outline";
  icon: React.ComponentType<{ className?: string }> | null;
}> = {
  FREE: { label: "Free", variant: "secondary", icon: null },
  PREMIUM: { label: "Premium", variant: "default", icon: Crown },
  CUSTOM: { label: "Custom", variant: "outline", icon: Sparkles },
};

type TierBadgeProps = {
  tier: TemplateTier;
  className?: string;
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("font-medium", className)}>
      {Icon && <Icon className="mr-1 size-3" />}
      {config.label}
    </Badge>
  );
}
