"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CardPreview } from "@/components/templates/card-preview";
import { TierBadge } from "@/components/templates/tier-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClipboardList, CreditCard, Info, Package, Send } from "lucide-react";
import { CLASSIC_BASE_PRICE } from "@/lib/pricing";
import type { WizardData, MaterialOption, TemplateOption } from "../card-order-wizard";

type RequestStepProps = {
  data: WizardData;
  getMaterialPrice: (mat: MaterialOption) => number;
  getTemplatePrice: (tmpl: TemplateOption) => number;
  companyPlanIncludesPlastic: boolean;
};

export function RequestStep({
  data,
  getMaterialPrice,
  getTemplatePrice,
  companyPlanIncludesPlastic,
}: RequestStepProps) {
  const { material, template } = data;
  if (!material || !template) return null;

  const materialPrice = getMaterialPrice(material);
  const templatePrice = getTemplatePrice(template);
  const isUpgrade = companyPlanIncludesPlastic && material.slug !== "classic";

  const variant =
    template.variants.find((v) => v.materialId === material.id) ??
    template.variants[0];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Request Your Card</h2>
        <p className="text-sm text-muted-foreground">
          Review your selections and submit a request to your company admin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left: Preview + Details */}
        <div className="space-y-4">
          {/* Card Preview */}
          {variant && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="size-4 text-neo-teal" />
                  Your Card
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent>
                <CardPreview
                  frontSvg={variant.frontSvg}
                  backSvg={variant.backSvg}
                  alt={`${template.name} on ${material.name}`}
                  className="mx-auto max-w-sm"
                />
              </CardContent>
            </Card>
          )}

          {/* Selections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="size-4 text-neo-teal" />
                Selections
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3">
              {/* NEO Card */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-neo-teal/20 via-neo-sky/20 to-neo-lime/20">
                  <Image
                    src="/brandings/logo-icon.svg"
                    alt="NEO"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">NEO Card</p>
                  <p className="text-xs text-muted-foreground">
                    NFC-enabled smart business card
                  </p>
                </div>
              </div>

              <Separator />

              {/* Material */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-lg bg-muted/50">
                    <Image
                      src={material.frontSvg}
                      alt={material.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{material.name} Card</p>
                    <p className="text-xs text-muted-foreground">
                      {material.description}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {materialPrice === 0 ? (
                    <span className="text-neo-teal">Free</span>
                  ) : (
                    <>{materialPrice} SAR</>
                  )}
                </span>
              </div>

              <Separator />

              {/* Template */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 overflow-hidden rounded-lg bg-muted/50">
                    <Image
                      src={template.thumbnail}
                      alt={template.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{template.name}</p>
                      <TierBadge tier={template.tier} className="text-[10px]" />
                    </div>
                    <p className="text-xs text-muted-foreground">Template</p>
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {templatePrice === 0 ? (
                    <span className="text-neo-teal">Free</span>
                  ) : (
                    <>{templatePrice} SAR</>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Info note */}
          <div className="flex items-start gap-3 rounded-xl border border-neo-teal/20 bg-neo-teal/5 px-4 py-3">
            <Send className="mt-0.5 size-4 shrink-0 text-neo-teal" />
            <div className="text-sm">
              <p className="font-medium">What happens next?</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your request will be sent to your company admin for approval.
                Once approved, your card will be included in the company&apos;s
                next bulk order.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Cost Summary */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-4 text-neo-teal" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3">
              {/* Material */}
              {isUpgrade ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Classic Card
                    </span>
                    <span className="text-sm tabular-nums text-neo-teal">
                      Included
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Upgrade to {material.name}
                    </span>
                    <span className="text-sm tabular-nums">
                      {materialPrice} SAR
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] tabular-nums text-muted-foreground">
                      {material.unitPrice} − {CLASSIC_BASE_PRICE} SAR ={" "}
                      <span className="font-medium text-foreground">
                        {materialPrice} SAR
                      </span>
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3 shrink-0 cursor-help text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px]">
                          Your plan includes a free Classic card worth{" "}
                          {CLASSIC_BASE_PRICE} SAR. That amount has been
                          deducted from your {material.name} card.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {material.name} Card
                  </span>
                  <span className="text-sm tabular-nums">
                    {materialPrice === 0 ? (
                      <span className="text-neo-teal">Free</span>
                    ) : (
                      `${materialPrice} SAR`
                    )}
                  </span>
                </div>
              )}

              {/* Template */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Template ({template.name})
                </span>
                <span className="text-sm tabular-nums">
                  {templatePrice === 0 ? (
                    <span className="text-neo-teal">Free</span>
                  ) : (
                    `${templatePrice} SAR`
                  )}
                </span>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Card Cost</span>
                <span className="text-base font-bold tabular-nums">
                  {materialPrice + templatePrice === 0 ? (
                    <span className="text-neo-teal">Free</span>
                  ) : (
                    <>
                      {materialPrice + templatePrice}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        SAR
                      </span>
                    </>
                  )}
                </span>
              </div>

              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-[11px] text-muted-foreground">
                  Shipping &amp; VAT will be handled by your company admin
                  when placing the order.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
