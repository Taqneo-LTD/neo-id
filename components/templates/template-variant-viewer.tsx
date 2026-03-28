"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CardPreview } from "@/components/templates/card-preview";
import { Layers, Package } from "lucide-react";
import type { TemplateTier } from "@/lib/generated/prisma/client";

const MATERIAL_TIERS: Record<number, string> = {
  0: "Standard",
  1: "Premium",
  2: "Luxury",
};

type Variant = {
  id: string;
  frontSvg: string;
  backSvg: string;
  material: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    tier: number;
    unitPrice: number;
  };
};

type TemplateVariantViewerProps = {
  templateName: string;
  variants: Variant[];
  price: number | null;
  tier: TemplateTier;
};

export function TemplateVariantViewer({
  templateName,
  variants,
  price,
  tier,
}: TemplateVariantViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = variants[activeIndex];

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Package className="size-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          No material variants available for this template
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Left: Card preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="size-5 text-neo-teal" />
            {templateName} — {active.material.name}
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <CardPreview
            frontSvg={active.frontSvg}
            backSvg={active.backSvg}
            alt={`${templateName} on ${active.material.name}`}
            className="mx-auto max-w-lg"
          />
        </CardContent>
      </Card>

      {/* Right: Material selector */}
      <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Material</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-2">
            {variants.map((variant, i) => {
              const mat = variant.material;
              const isActive = i === activeIndex;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all",
                    isActive
                      ? "border-neo-teal bg-neo-teal/5 ring-1 ring-neo-teal/20"
                      : "border-border hover:border-neo-teal/30 hover:bg-muted/50",
                  )}
                >
                  <div>
                    <p className={cn("text-sm font-medium", isActive && "text-neo-teal")}>
                      {mat.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {MATERIAL_TIERS[mat.tier] ?? "Standard"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {mat.unitPrice}{" "}
                    <span className="text-xs font-normal text-muted-foreground">SAR</span>
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Pricing summary */}
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Template</span>
              <span className="text-sm font-medium">
                {tier === "FREE" ? (
                  <span className="text-neo-teal">Free</span>
                ) : price != null ? (
                  <>{price} SAR</>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Material</span>
              <span className="text-sm font-medium">{active.material.unitPrice} SAR</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total per card</span>
              <span className="text-base font-bold tabular-nums">
                {(price ?? 0) + active.material.unitPrice}{" "}
                <span className="text-xs font-normal text-muted-foreground">SAR</span>
              </span>
            </div>

            {active.material.unitPrice >= 95 && (
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-[11px] text-muted-foreground">
                  Bulk pricing available — 50+ cards from{" "}
                  <span className="font-medium text-foreground">
                    {active.material.unitPrice <= 95 ? "80" : "150"} SAR
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
