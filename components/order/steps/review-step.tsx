"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CardPreview } from "@/components/templates/card-preview";
import { TierBadge } from "@/components/templates/tier-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ClipboardList,
  CreditCard,
  Info,
  MapPin,
  Package,
  Users,
} from "lucide-react";
import { CLASSIC_BASE_PRICE, SHIPPING, VAT_RATE } from "@/lib/pricing";
import { DEFAULT_COUNTRY } from "@/constants/profile";
import type {
  WizardData,
  MaterialOption,
  TemplateOption,
  TeamMember,
  TeamCardOverride,
  MemberCardOrder,
  EmptySeatCard,
} from "../card-order-wizard";

type ReviewStepProps = {
  data: WizardData;
  getMaterialPrice: (mat: MaterialOption) => number;
  getTemplatePrice: (tmpl: TemplateOption) => number;
  isCompany: boolean;
  companyPlanIncludesPlastic: boolean;
  membersWithRequests?: TeamMember[];
  teamCardOverrides?: Map<string, TeamCardOverride>;
  memberCardOrders?: MemberCardOrder[];
  emptySeatCards?: EmptySeatCard[];
};

// ─── Helpers ────────────────────────────────────────────

function getEffectiveMatPrice(
  unitPrice: number,
  slug: string,
  includesPlastic: boolean,
): number {
  if (includesPlastic) {
    if (slug === "classic") return 0;
    return unitPrice - CLASSIC_BASE_PRICE;
  }
  return unitPrice;
}

// ─── Component ──────────────────────────────────────────

export function ReviewStep({
  data,
  getMaterialPrice,
  getTemplatePrice,
  isCompany,
  companyPlanIncludesPlastic,
  membersWithRequests = [],
  teamCardOverrides = new Map(),
  memberCardOrders = [],
  emptySeatCards = [],
}: ReviewStepProps) {
  const { material, template, shipping } = data;
  if (!material || !template) return null;

  // Admin's own card cost
  const materialPrice = getMaterialPrice(material);
  const templatePrice = getTemplatePrice(template);
  const ownIsUpgrade =
    isCompany && companyPlanIncludesPlastic && material.slug !== "classic";

  // Employee request costs (with overrides applied)
  const requestCosts = membersWithRequests.map((member) => {
    const req = member.request!;
    const override = teamCardOverrides.get(req.id);
    const matSlug = override?.materialSlug ?? req.materialSlug;
    const matName = override?.materialName ?? req.materialName;
    const matUnitPrice = override?.materialUnitPrice ?? req.materialUnitPrice;
    const tmplName = override?.templateName ?? req.templateName;
    const frontSvg = override?.variantFrontSvg ?? req.variantFrontSvg;
    return {
      id: req.id,
      userName: member.userName,
      materialSlug: matSlug,
      materialName: matName,
      materialUnitPrice: matUnitPrice,
      templateName: tmplName,
      variantFrontSvg: frontSvg,
      materialCost: getEffectiveMatPrice(matUnitPrice, matSlug, companyPlanIncludesPlastic),
      templateCost: 0,
    };
  });

  // Member card order costs (admin ordering for members without requests)
  const enabledMembers = memberCardOrders.filter((m) => m.enabled);
  const memberCosts = enabledMembers.map((m) => ({
    ...m,
    materialCost: getEffectiveMatPrice(m.materialUnitPrice, m.materialSlug, companyPlanIncludesPlastic),
    templateCost: 0,
  }));

  // Empty seat costs
  const enabledSeats = emptySeatCards.filter((s) => s.enabled);
  const seatCosts = enabledSeats.map((seat) => ({
    ...seat,
    materialCost: getEffectiveMatPrice(seat.materialUnitPrice, seat.materialSlug, companyPlanIncludesPlastic),
    templateCost: 0,
  }));

  // Total across all cards
  const allCardsCost =
    materialPrice +
    templatePrice +
    requestCosts.reduce((sum, r) => sum + r.materialCost + r.templateCost, 0) +
    memberCosts.reduce((sum, m) => sum + m.materialCost + m.templateCost, 0) +
    seatCosts.reduce((sum, s) => sum + s.materialCost + s.templateCost, 0);

  const shippingCost =
    allCardsCost >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.STANDARD;
  const beforeVat = allCardsCost + shippingCost;
  const vat = Math.round(beforeVat * VAT_RATE * 100) / 100;
  const total = beforeVat + vat;

  const totalCards = 1 + membersWithRequests.length + enabledMembers.length + enabledSeats.length;

  // Find variant for admin's card preview
  const variant =
    template.variants.find((v) => v.materialId === material.id) ??
    template.variants[0];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Review Your Order</h2>
        <p className="text-sm text-muted-foreground">
          {totalCards > 1
            ? `${totalCards} cards — confirm everything before payment`
            : "Confirm everything looks good before proceeding to payment"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Details */}
        <div className="space-y-4">
          {/* Admin's card preview */}
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
                  className="mx-auto max-w-md"
                />
              </CardContent>
            </Card>
          )}

          {/* Admin's order details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="size-4 text-neo-teal" />
                Your Order Details
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4">
              {/* NEO Card logo */}
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-neo-teal/20 via-neo-sky/20 to-neo-lime/20">
                  <Image
                    src="/brandings/logo-icon.svg"
                    alt="NEO"
                    width={24}
                    height={24}
                    className="size-6"
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
                  <div className="relative size-12 overflow-hidden rounded-lg bg-muted/50">
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
                  <div className="relative size-12 overflow-hidden rounded-lg bg-muted/50">
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

          {/* Employee card requests */}
          {membersWithRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4 text-neo-teal" />
                  Team Card Requests
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {membersWithRequests.length} card
                    {membersWithRequests.length > 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-0 divide-y">
                {requestCosts.map((req) => {
                  const reqIsUpgrade =
                    companyPlanIncludesPlastic &&
                    req.materialSlug !== "classic";
                  const reqTotal = req.materialCost + req.templateCost;

                  return (
                    <div key={req.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      {/* Card SVG thumbnail */}
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted/30">
                        <Image
                          src={req.variantFrontSvg}
                          alt={`${req.userName}'s card`}
                          fill
                          className="object-contain"
                        />
                      </div>

                      {/* Employee info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {req.userName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {req.materialName}
                          {reqIsUpgrade && (
                            <span className="text-[10px]">
                              {" "}(upgrade)
                            </span>
                          )}
                          {" · "}
                          {req.templateName}
                        </p>
                      </div>

                      {/* Cost */}
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {reqTotal === 0 ? (
                          <span className="text-neo-teal">Free</span>
                        ) : (
                          <>{reqTotal} SAR</>
                        )}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Member cards (admin-ordered for members without requests) */}
          {enabledMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4 text-neo-teal" />
                  Member Cards
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {enabledMembers.length} card
                    {enabledMembers.length > 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-0 divide-y">
                {memberCosts.map((m) => {
                  const mIsUpgrade =
                    companyPlanIncludesPlastic &&
                    m.materialSlug !== "classic";
                  const mTotal = m.materialCost + m.templateCost;
                  return (
                    <div key={m.userId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted/30">
                        {m.variantFrontSvg && (
                          <Image
                            src={m.variantFrontSvg}
                            alt={`${m.userName}'s card`}
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{m.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.materialName}
                          {mIsUpgrade && <span className="text-[10px]"> (upgrade)</span>}
                          {" · "}{m.templateName}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {mTotal === 0 ? (
                          <span className="text-neo-teal">Free</span>
                        ) : (
                          <>{mTotal} SAR</>
                        )}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Pre-ordered seat cards */}
          {enabledSeats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4 text-neo-teal" />
                  Pre-ordered Seat Cards
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {enabledSeats.length} card
                    {enabledSeats.length > 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-0 divide-y">
                {seatCosts.map((seat) => {
                  const seatIsUpgrade =
                    companyPlanIncludesPlastic &&
                    seat.materialSlug !== "classic";
                  const seatTotal = seat.materialCost + seat.templateCost;

                  return (
                    <div key={seat.seatIndex} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted/30">
                        {seat.variantFrontSvg && (
                          <Image
                            src={seat.variantFrontSvg}
                            alt={`Seat ${seat.seatIndex + 1}`}
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          Seat {seat.seatIndex + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {seat.materialName}
                          {seatIsUpgrade && (
                            <span className="text-[10px]"> (upgrade)</span>
                          )}
                          {" · "}
                          {seat.templateName}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {seatTotal === 0 ? (
                          <span className="text-neo-teal">Free</span>
                        ) : (
                          <>{seatTotal} SAR</>
                        )}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Order Summary + Shipping Address */}
        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-4 text-neo-teal" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3">
              {/* Admin's card */}
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Your card
              </p>
              {ownIsUpgrade ? (
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

              {/* Employee cards breakdown */}
              {requestCosts.length > 0 && (
                <>
                  <Separator />
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Requested cards ({requestCosts.length})
                  </p>
                  {requestCosts.map((req) => {
                    const reqIsUpgrade =
                      companyPlanIncludesPlastic &&
                      req.materialSlug !== "classic";
                    const reqTotal = req.materialCost + req.templateCost;
                    return (
                      <div key={req.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm text-muted-foreground">
                            {req.userName}
                          </span>
                          <span className="shrink-0 text-sm tabular-nums">
                            {reqTotal === 0 ? (
                              <span className="text-neo-teal">Free</span>
                            ) : (
                              `${reqTotal} SAR`
                            )}
                          </span>
                        </div>
                        {reqIsUpgrade ? (
                          <div className="flex items-center gap-1">
                            <p className="text-[11px] tabular-nums text-muted-foreground">
                              {req.materialName}: {req.materialUnitPrice} −{" "}
                              {CLASSIC_BASE_PRICE} ={" "}
                              <span className="font-medium text-foreground">
                                {req.materialCost} SAR
                              </span>
                            </p>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="size-3 shrink-0 cursor-help text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-[220px]"
                                >
                                  {req.userName}&apos;s plan includes a free
                                  Classic card worth {CLASSIC_BASE_PRICE} SAR.
                                  That amount has been deducted from their{" "}
                                  {req.materialName} card.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ) : (
                          <p className="text-[11px] text-muted-foreground">
                            {req.materialName} · {req.templateName}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* Member cards breakdown */}
              {memberCosts.length > 0 && (
                <>
                  <Separator />
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Member cards ({memberCosts.length})
                  </p>
                  {memberCosts.map((m) => {
                    const mTotal = m.materialCost + m.templateCost;
                    return (
                      <div key={m.userId} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm text-muted-foreground">
                            {m.userName}
                          </span>
                          <span className="shrink-0 text-sm tabular-nums">
                            {mTotal === 0 ? (
                              <span className="text-neo-teal">Free</span>
                            ) : (
                              `${mTotal} SAR`
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {m.materialName} · {m.templateName}
                        </p>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Empty seat cards breakdown */}
              {seatCosts.length > 0 && (
                <>
                  <Separator />
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Pre-ordered seats ({seatCosts.length})
                  </p>
                  {seatCosts.map((seat) => {
                    const seatIsUpgrade =
                      companyPlanIncludesPlastic &&
                      seat.materialSlug !== "classic";
                    const seatTotal = seat.materialCost + seat.templateCost;
                    return (
                      <div key={seat.seatIndex} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm text-muted-foreground">
                            Seat {seat.seatIndex + 1}
                          </span>
                          <span className="shrink-0 text-sm tabular-nums">
                            {seatTotal === 0 ? (
                              <span className="text-neo-teal">Free</span>
                            ) : (
                              `${seatTotal} SAR`
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {seat.materialName}
                          {seatIsUpgrade && " (upgrade)"}
                          {" · "}
                          {seat.templateName}
                        </p>
                      </div>
                    );
                  })}
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Subtotal
                  {totalCards > 1 && (
                    <span className="text-[10px]"> ({totalCards} cards)</span>
                  )}
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {allCardsCost} SAR
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Shipping
                  {shippingCost === 0 && (
                    <Badge variant="secondary" className="ml-1.5 text-[10px]">
                      Free
                    </Badge>
                  )}
                </span>
                <span className="text-sm tabular-nums">
                  {shippingCost === 0 ? (
                    <span className="text-neo-teal">Free</span>
                  ) : (
                    `${shippingCost} SAR`
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">VAT (15%)</span>
                <span className="text-sm tabular-nums">
                  {vat.toFixed(2)} SAR
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold tabular-nums">
                  {total.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    SAR
                  </span>
                </span>
              </div>

              {isCompany && (
                <div className="rounded-lg bg-neo-teal/5 px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">
                    Company plan benefits applied — material and template
                    discounts included
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4 text-neo-teal" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent>
              <div className="text-sm">
                <p className="font-medium">{shipping.fullName}</p>
                <p className="text-muted-foreground">
                  {DEFAULT_COUNTRY.dialCode} {shipping.phone}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {shipping.addressLine1}
                  {shipping.addressLine2 && <>, {shipping.addressLine2}</>}
                </p>
                <p className="text-muted-foreground">
                  {shipping.city}, {shipping.state} {shipping.zipCode}
                </p>
                <p className="text-muted-foreground">{DEFAULT_COUNTRY.name}</p>
              </div>
              {totalCards > 1 && (
                <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">
                    All {totalCards} cards will be shipped to this address.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
