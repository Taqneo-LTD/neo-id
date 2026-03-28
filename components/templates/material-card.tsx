"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const MATERIAL_TIERS: Record<number, { label: string; className: string }> = {
  0: { label: "Standard", className: "" },
  1: { label: "Premium", className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  2: { label: "Luxury", className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
};

type MaterialCardProps = {
  name: string;
  slug: string;
  description: string | null;
  tier: number;
  frontSvg: string;
  unitPrice: number;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function MaterialCard({
  name,
  description,
  tier,
  frontSvg,
  unitPrice,
  selected,
  onSelect,
  className,
}: MaterialCardProps) {
  const tierInfo = MATERIAL_TIERS[tier] ?? MATERIAL_TIERS[0];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-neo-teal/50 hover:shadow-md",
        selected && "border-neo-teal ring-2 ring-neo-teal/20",
        className,
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-3 right-3 z-10 flex size-6 items-center justify-center rounded-full bg-neo-teal">
          <Check className="size-3.5 text-white" />
        </div>
      )}

      {/* Card preview */}
      <div className="relative aspect-[1.6/1] w-full overflow-hidden bg-muted/50 p-4">
        <Image
          src={frontSvg}
          alt={name}
          fill
          className="object-contain p-3 transition-transform group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">{name}</h3>
          {tier > 0 && (
            <Badge variant="outline" className={cn("text-[10px]", tierInfo.className)}>
              {tierInfo.label}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        )}
        <div className="mt-auto pt-2">
          <span className="text-lg font-bold tabular-nums">{unitPrice}</span>
          <span className="ml-1 text-xs text-muted-foreground">SAR</span>
        </div>
      </div>
    </button>
  );
}
