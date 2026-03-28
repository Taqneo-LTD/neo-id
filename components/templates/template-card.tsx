import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { TierBadge } from "@/components/templates/tier-badge";
import type { TemplateTier } from "@/lib/generated/prisma/client";

type TemplateCardProps = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  tier: TemplateTier;
  price: number | null;
  materialsCount: number;
  className?: string;
};

export function TemplateCard({
  id,
  name,
  thumbnail,
  tier,
  price,
  materialsCount,
  className,
}: TemplateCardProps) {
  return (
    <Link href={`/neo-card/${id}`} className="flex">
      <Card className={cn("flex w-full flex-col transition-colors hover:border-neo-teal/50", className)}>
        {/* Thumbnail */}
        <div className="relative aspect-[1.6/1] w-full overflow-hidden rounded-t-xl bg-muted/50">
          <Image
            src={thumbnail}
            alt={name}
            fill
            className="object-contain p-4"
          />
        </div>

        <CardHeader>
          <CardTitle className="text-base">{name}</CardTitle>
          <CardAction>
            <TierBadge tier={tier} className="text-[11px]" />
          </CardAction>
        </CardHeader>

        <CardContent className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {materialsCount} material{materialsCount !== 1 ? "s" : ""}
          </span>
          {tier === "PREMIUM" && price != null ? (
            <span className="text-sm font-semibold tabular-nums">
              {price} <span className="text-xs font-normal text-muted-foreground">SAR</span>
            </span>
          ) : tier === "FREE" ? (
            <span className="text-sm font-semibold text-neo-teal">Free</span>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
