"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Wand2,
  CheckCheck,
  XCircle,
  CreditCard,
  Check,
  Clock,
} from "lucide-react";
import { CLASSIC_BASE_PRICE } from "@/lib/pricing";
import type {
  MaterialOption,
  TemplateOption,
  TeamMember,
  TeamCardOverride,
  MemberCardOrder,
  EmptySeatCard,
} from "../card-order-wizard";

// ─── Types ───────────────────────────────────────────────

type TeamCardsStepProps = {
  membersWithRequests: TeamMember[];
  membersWithoutRequests: TeamMember[];
  membersWithCards: TeamMember[];
  materials: MaterialOption[];
  templates: TemplateOption[];
  emptySeats: number;
  companyMaxSeats: number;
  companyEmployeeCount: number;
  adminMaterial: MaterialOption | null;
  adminTemplate: TemplateOption | null;
  adminVariantId: string | null;
  profileName: string;
  teamCardOverrides: Map<string, TeamCardOverride>;
  memberCardOrders: MemberCardOrder[];
  emptySeatCards: EmptySeatCard[];
  onOverridesChange: (overrides: Map<string, TeamCardOverride>) => void;
  onMemberCardOrdersChange: (orders: MemberCardOrder[]) => void;
  onEmptySeatCardsChange: (seats: EmptySeatCard[]) => void;
  getMaterialPrice: (mat: MaterialOption) => number;
  companyPlanIncludesPlastic: boolean;
};

// ─── Helpers ─────────────────────────────────────────────

function findVariant(
  templates: TemplateOption[],
  templateId: string,
  materialId: string,
) {
  const tmpl = templates.find((t) => t.id === templateId);
  if (!tmpl) return null;
  return tmpl.variants.find((v) => v.materialId === materialId) ?? tmpl.variants[0] ?? null;
}

function getEffectiveMaterialPrice(
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

// ─── Component ───────────────────────────────────────────

export function TeamCardsStep({
  membersWithRequests,
  membersWithoutRequests,
  membersWithCards,
  materials,
  templates,
  emptySeats,
  companyMaxSeats,
  companyEmployeeCount,
  adminMaterial,
  adminTemplate,
  adminVariantId,
  profileName,
  teamCardOverrides,
  memberCardOrders,
  emptySeatCards,
  onOverridesChange,
  onMemberCardOrdersChange,
  onEmptySeatCardsChange,
  getMaterialPrice,
  companyPlanIncludesPlastic,
}: TeamCardsStepProps) {
  // ─── Initialize member card orders for members without requests ──
  useEffect(() => {
    if (
      membersWithoutRequests.length > 0 &&
      memberCardOrders.length === 0 &&
      adminMaterial &&
      adminTemplate
    ) {
      const variant = findVariant(templates, adminTemplate.id, adminMaterial.id);
      const orders: MemberCardOrder[] = membersWithoutRequests.map((m) => ({
        userId: m.userId,
        userName: m.userName,
        userAvatarUrl: m.userAvatarUrl,
        profileId: m.profileId,
        profileSlug: m.profileSlug,
        enabled: false,
        materialId: adminMaterial.id,
        materialSlug: adminMaterial.slug,
        materialName: adminMaterial.name,
        materialUnitPrice: adminMaterial.unitPrice,
        templateId: adminTemplate.id,
        templateName: adminTemplate.name,
        templateTier: adminTemplate.tier,
        templatePrice: adminTemplate.price,
        variantId: variant?.id ?? "",
        variantFrontSvg: variant?.frontSvg ?? "",
        variantBackSvg: variant?.backSvg ?? "",
      }));
      onMemberCardOrdersChange(orders);
    }
  }, [membersWithoutRequests, memberCardOrders.length, adminMaterial, adminTemplate, templates, onMemberCardOrdersChange]);

  // ─── Initialize empty seat cards ──
  useEffect(() => {
    if (emptySeats > 0 && emptySeatCards.length === 0 && adminMaterial && adminTemplate) {
      const variant = findVariant(templates, adminTemplate.id, adminMaterial.id);
      const seats: EmptySeatCard[] = Array.from({ length: emptySeats }, (_, i) => ({
        seatIndex: i,
        enabled: false,
        materialId: adminMaterial.id,
        materialSlug: adminMaterial.slug,
        materialName: adminMaterial.name,
        materialUnitPrice: adminMaterial.unitPrice,
        templateId: adminTemplate.id,
        templateName: adminTemplate.name,
        templateTier: adminTemplate.tier,
        templatePrice: adminTemplate.price,
        variantId: variant?.id ?? "",
        variantFrontSvg: variant?.frontSvg ?? "",
        variantBackSvg: variant?.backSvg ?? "",
      }));
      onEmptySeatCardsChange(seats);
    }
  }, [emptySeats, emptySeatCards.length, adminMaterial, adminTemplate, templates, onEmptySeatCardsChange]);

  // ─── Request Override Handlers ──────────────────────────

  const handleRequestMaterialChange = useCallback(
    (reqId: string, member: TeamMember, materialId: string) => {
      const mat = materials.find((m) => m.id === materialId);
      if (!mat || !member.request) return;
      const req = member.request;

      const existing = teamCardOverrides.get(reqId);
      const templateId = existing?.templateId ?? templates.find((t) => t.name === req.templateName)?.id ?? templates[0]?.id ?? "";
      const tmpl = templates.find((t) => t.id === templateId);
      const variant = findVariant(templates, templateId, materialId);

      const newOverrides = new Map(teamCardOverrides);
      newOverrides.set(reqId, {
        requestId: reqId,
        materialId: mat.id,
        materialSlug: mat.slug,
        materialName: mat.name,
        materialUnitPrice: mat.unitPrice,
        templateId,
        templateName: tmpl?.name ?? req.templateName,
        templateTier: tmpl?.tier ?? req.templateTier,
        templatePrice: tmpl?.price ?? req.templatePrice,
        variantId: variant?.id ?? "",
        variantFrontSvg: variant?.frontSvg ?? req.variantFrontSvg,
        variantBackSvg: variant?.backSvg ?? req.variantBackSvg,
      });
      onOverridesChange(newOverrides);
    },
    [materials, templates, teamCardOverrides, onOverridesChange],
  );

  const handleRequestTemplateChange = useCallback(
    (reqId: string, member: TeamMember, templateId: string) => {
      const tmpl = templates.find((t) => t.id === templateId);
      if (!tmpl || !member.request) return;
      const req = member.request;

      const existing = teamCardOverrides.get(reqId);
      const materialId = existing?.materialId ?? materials.find((m) => m.slug === req.materialSlug)?.id ?? materials[0]?.id ?? "";
      const variant = findVariant(templates, templateId, materialId);

      const newOverrides = new Map(teamCardOverrides);
      newOverrides.set(reqId, {
        requestId: reqId,
        materialId,
        materialSlug: existing?.materialSlug ?? req.materialSlug,
        materialName: existing?.materialName ?? req.materialName,
        materialUnitPrice: existing?.materialUnitPrice ?? req.materialUnitPrice,
        templateId: tmpl.id,
        templateName: tmpl.name,
        templateTier: tmpl.tier,
        templatePrice: tmpl.price,
        variantId: variant?.id ?? "",
        variantFrontSvg: variant?.frontSvg ?? "",
        variantBackSvg: variant?.backSvg ?? "",
      });
      onOverridesChange(newOverrides);
    },
    [materials, templates, teamCardOverrides, onOverridesChange],
  );

  // ─── Member Card Order Handlers ─────────────────────────

  const handleMemberToggle = useCallback(
    (userId: string, enabled: boolean) => {
      const updated = memberCardOrders.map((m) =>
        m.userId === userId ? { ...m, enabled } : m,
      );
      onMemberCardOrdersChange(updated);
    },
    [memberCardOrders, onMemberCardOrdersChange],
  );

  const handleMemberMaterialChange = useCallback(
    (userId: string, materialId: string) => {
      const mat = materials.find((m) => m.id === materialId);
      if (!mat) return;
      const updated = memberCardOrders.map((m) => {
        if (m.userId !== userId) return m;
        const variant = findVariant(templates, m.templateId, materialId);
        return {
          ...m,
          materialId: mat.id,
          materialSlug: mat.slug,
          materialName: mat.name,
          materialUnitPrice: mat.unitPrice,
          variantId: variant?.id ?? "",
          variantFrontSvg: variant?.frontSvg ?? "",
          variantBackSvg: variant?.backSvg ?? "",
        };
      });
      onMemberCardOrdersChange(updated);
    },
    [materials, templates, memberCardOrders, onMemberCardOrdersChange],
  );

  const handleMemberTemplateChange = useCallback(
    (userId: string, templateId: string) => {
      const tmpl = templates.find((t) => t.id === templateId);
      if (!tmpl) return;
      const updated = memberCardOrders.map((m) => {
        if (m.userId !== userId) return m;
        const variant = findVariant(templates, templateId, m.materialId);
        return {
          ...m,
          templateId: tmpl.id,
          templateName: tmpl.name,
          templateTier: tmpl.tier,
          templatePrice: tmpl.price,
          variantId: variant?.id ?? "",
          variantFrontSvg: variant?.frontSvg ?? "",
          variantBackSvg: variant?.backSvg ?? "",
        };
      });
      onMemberCardOrdersChange(updated);
    },
    [templates, memberCardOrders, onMemberCardOrdersChange],
  );

  // ─── Empty Seat Handlers ───────────────────────────────

  const handleSeatToggle = useCallback(
    (seatIndex: number, enabled: boolean) => {
      const updated = emptySeatCards.map((s) =>
        s.seatIndex === seatIndex ? { ...s, enabled } : s,
      );
      onEmptySeatCardsChange(updated);
    },
    [emptySeatCards, onEmptySeatCardsChange],
  );

  const handleSeatMaterialChange = useCallback(
    (seatIndex: number, materialId: string) => {
      const mat = materials.find((m) => m.id === materialId);
      if (!mat) return;
      const updated = emptySeatCards.map((s) => {
        if (s.seatIndex !== seatIndex) return s;
        const variant = findVariant(templates, s.templateId, materialId);
        return {
          ...s,
          materialId: mat.id, materialSlug: mat.slug, materialName: mat.name,
          materialUnitPrice: mat.unitPrice,
          variantId: variant?.id ?? "",
          variantFrontSvg: variant?.frontSvg ?? "",
          variantBackSvg: variant?.backSvg ?? "",
        };
      });
      onEmptySeatCardsChange(updated);
    },
    [materials, templates, emptySeatCards, onEmptySeatCardsChange],
  );

  const handleSeatTemplateChange = useCallback(
    (seatIndex: number, templateId: string) => {
      const tmpl = templates.find((t) => t.id === templateId);
      if (!tmpl) return;
      const updated = emptySeatCards.map((s) => {
        if (s.seatIndex !== seatIndex) return s;
        const variant = findVariant(templates, templateId, s.materialId);
        return {
          ...s,
          templateId: tmpl.id, templateName: tmpl.name, templateTier: tmpl.tier,
          templatePrice: tmpl.price,
          variantId: variant?.id ?? "",
          variantFrontSvg: variant?.frontSvg ?? "",
          variantBackSvg: variant?.backSvg ?? "",
        };
      });
      onEmptySeatCardsChange(updated);
    },
    [templates, emptySeatCards, onEmptySeatCardsChange],
  );

  const handleToggleAllSeats = useCallback(
    (enabled: boolean) => {
      onEmptySeatCardsChange(emptySeatCards.map((s) => ({ ...s, enabled })));
    },
    [emptySeatCards, onEmptySeatCardsChange],
  );

  const handleToggleAllMembers = useCallback(
    (enabled: boolean) => {
      onMemberCardOrdersChange(memberCardOrders.map((m) => ({ ...m, enabled })));
    },
    [memberCardOrders, onMemberCardOrdersChange],
  );

  // ─── Bulk Apply ────────────────────────────────────────

  const handleBulkApplyAll = useCallback(
    (materialId: string, templateId: string) => {
      const mat = materials.find((m) => m.id === materialId);
      const tmpl = templates.find((t) => t.id === templateId);
      if (!mat || !tmpl) return;
      const variant = findVariant(templates, templateId, materialId);

      // Apply to request overrides
      const newOverrides = new Map<string, TeamCardOverride>();
      for (const member of membersWithRequests) {
        if (!member.request) continue;
        newOverrides.set(member.request.id, {
          requestId: member.request.id,
          materialId: mat.id, materialSlug: mat.slug, materialName: mat.name,
          materialUnitPrice: mat.unitPrice,
          templateId: tmpl.id, templateName: tmpl.name, templateTier: tmpl.tier,
          templatePrice: tmpl.price,
          variantId: variant?.id ?? "",
          variantFrontSvg: variant?.frontSvg ?? "",
          variantBackSvg: variant?.backSvg ?? "",
        });
      }
      onOverridesChange(newOverrides);

      // Apply to member card orders
      onMemberCardOrdersChange(memberCardOrders.map((m) => ({
        ...m,
        materialId: mat.id, materialSlug: mat.slug, materialName: mat.name,
        materialUnitPrice: mat.unitPrice,
        templateId: tmpl.id, templateName: tmpl.name, templateTier: tmpl.tier,
        templatePrice: tmpl.price,
        variantId: variant?.id ?? "",
        variantFrontSvg: variant?.frontSvg ?? "",
        variantBackSvg: variant?.backSvg ?? "",
      })));

      // Apply to empty seats
      onEmptySeatCardsChange(emptySeatCards.map((s) => ({
        ...s,
        materialId: mat.id, materialSlug: mat.slug, materialName: mat.name,
        materialUnitPrice: mat.unitPrice,
        templateId: tmpl.id, templateName: tmpl.name, templateTier: tmpl.tier,
        templatePrice: tmpl.price,
        variantId: variant?.id ?? "",
        variantFrontSvg: variant?.frontSvg ?? "",
        variantBackSvg: variant?.backSvg ?? "",
      })));
    },
    [materials, templates, membersWithRequests, memberCardOrders, emptySeatCards, onOverridesChange, onMemberCardOrdersChange, onEmptySeatCardsChange],
  );

  // ─── Computed ──────────────────────────────────────────

  const filledSeats = companyEmployeeCount;
  const enabledMemberCount = memberCardOrders.filter((m) => m.enabled).length;
  const enabledSeatCount = emptySeatCards.filter((s) => s.enabled).length;
  const allMembersEnabled = memberCardOrders.length > 0 && enabledMemberCount === memberCardOrders.length;
  const allSeatsEnabled = emptySeatCards.length > 0 && enabledSeatCount === emptySeatCards.length;

  // Admin's variant for display
  const adminVariant = adminMaterial && adminTemplate
    ? findVariant(templates, adminTemplate.id, adminMaterial.id)
    : null;

  const totalActionableItems =
    membersWithRequests.length + membersWithoutRequests.length + emptySeats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Team Cards
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {filledSeats} of {companyMaxSeats} seats filled.
          {" "}Choose which team members and open seats to include in this order.
        </p>
      </div>

      {/* Bulk apply row */}
      {totalActionableItems > 1 && (
        <BulkApplyRow
          materials={materials}
          templates={templates}
          defaultMaterialId={adminMaterial?.id}
          defaultTemplateId={adminTemplate?.id}
          onApply={handleBulkApplyAll}
          label="Set material & design for all"
        />
      )}

      {/* ── Your Card (Admin) ── */}
      {adminMaterial && adminTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
            {adminVariant && (
              <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-muted/30">
                <Image
                  src={adminVariant.frontSvg}
                  alt="Your card"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">You — {profileName}</p>
              <p className="text-xs text-muted-foreground">
                {adminMaterial.name} · {adminTemplate.name}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 text-[10px] text-neo-teal border-neo-teal/30">
              <Check className="mr-1 size-2.5" />
              Your card
            </Badge>
          </div>
        </motion.div>
      )}

      {/* ── Section 1: Members who requested a card ── */}
      {membersWithRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Clock className="size-3.5 text-neo-teal" />
                Requested a card
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  {membersWithRequests.length}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                These members requested a card. They will be included in your order automatically. You can change their material or design.
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-0 divide-y">
              {membersWithRequests.map((member) => {
                const req = member.request!;
                const override = teamCardOverrides.get(req.id);
                const currentMatId = override?.materialId ?? materials.find((m) => m.slug === req.materialSlug)?.id ?? "";
                const currentTmplId = override?.templateId ?? templates.find((t) => t.name === req.templateName)?.id ?? "";
                const matPrice = getEffectiveMaterialPrice(
                  override?.materialUnitPrice ?? req.materialUnitPrice,
                  override?.materialSlug ?? req.materialSlug,
                  companyPlanIncludesPlastic,
                );

                return (
                  <div key={req.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-muted/30">
                      <Image
                        src={override?.variantFrontSvg ?? req.variantFrontSvg}
                        alt={`${member.userName}'s card`}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{member.userName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.profileName ?? member.profileSlug}
                      </p>
                    </div>

                    <Select
                      value={currentMatId}
                      onValueChange={(v) => handleRequestMaterialChange(req.id, member, v)}
                    >
                      <SelectTrigger className="h-8 w-[110px] text-xs">
                        <SelectValue placeholder="Material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={currentTmplId}
                      onValueChange={(v) => handleRequestTemplateChange(req.id, member, v)}
                    >
                      <SelectTrigger className="h-8 w-[100px] text-xs">
                        <SelectValue placeholder="Design" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id} className="text-xs">
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">
                      {matPrice === 0 ? (
                        <span className="text-neo-teal">Free</span>
                      ) : (
                        <>{matPrice} SAR</>
                      )}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Section 2: Members without a card request ── */}
      {membersWithoutRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <UserPlus className="size-3.5 text-neo-teal" />
                  No card yet
                  <Badge variant="secondary" className="text-[10px]">
                    {membersWithoutRequests.length}
                  </Badge>
                </CardTitle>
                {memberCardOrders.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleToggleAllMembers(!allMembersEnabled)}
                  >
                    {allMembersEnabled ? (
                      <><XCircle className="mr-1 size-3" /> Deselect All</>
                    ) : (
                      <><CheckCheck className="mr-1 size-3" /> Select All</>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                These members haven&apos;t requested a card. Toggle them on to order a card on their behalf — a NEO ID will be created for them.
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-0 divide-y">
              {memberCardOrders.map((order) => {
                const matPrice = getEffectiveMaterialPrice(
                  order.materialUnitPrice,
                  order.materialSlug,
                  companyPlanIncludesPlastic,
                );

                return (
                  <div
                    key={order.userId}
                    className={cn(
                      "flex items-center gap-3 py-3 transition-opacity first:pt-0 last:pb-0",
                      !order.enabled && "opacity-50",
                    )}
                  >
                    <Switch
                      checked={order.enabled}
                      onCheckedChange={(checked) =>
                        handleMemberToggle(order.userId, checked)
                      }
                    />

                    <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-muted/30">
                      {order.variantFrontSvg && (
                        <Image
                          src={order.variantFrontSvg}
                          alt={`${order.userName}'s card`}
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{order.userName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.profileSlug
                          ? `neo-id.com/p/${order.profileSlug}`
                          : "NEO ID will be created"}
                      </p>
                    </div>

                    <Select
                      value={order.materialId}
                      onValueChange={(v) => handleMemberMaterialChange(order.userId, v)}
                      disabled={!order.enabled}
                    >
                      <SelectTrigger className="h-8 w-[110px] text-xs">
                        <SelectValue placeholder="Material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={order.templateId}
                      onValueChange={(v) => handleMemberTemplateChange(order.userId, v)}
                      disabled={!order.enabled}
                    >
                      <SelectTrigger className="h-8 w-[100px] text-xs">
                        <SelectValue placeholder="Design" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id} className="text-xs">
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">
                      {!order.enabled ? (
                        <span className="text-muted-foreground">—</span>
                      ) : matPrice === 0 ? (
                        <span className="text-neo-teal">Free</span>
                      ) : (
                        <>{matPrice} SAR</>
                      )}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Section 3: Members who already have a card ── */}
      {membersWithCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CreditCard className="size-3.5" />
                Already have a card
                <Badge variant="outline" className="text-[10px]">
                  {membersWithCards.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-0 divide-y">
              {membersWithCards.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-3 py-3 opacity-50 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.userName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.profileName ?? member.profileSlug}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    <Check className="mr-1 size-2.5" />
                    Card active
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Section 4: Empty seats ── */}
      {emptySeats > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Users className="size-3.5 text-neo-teal" />
                  Open seats
                  <Badge variant="secondary" className="text-[10px]">
                    {emptySeats}
                  </Badge>
                </CardTitle>
                {emptySeatCards.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleToggleAllSeats(!allSeatsEnabled)}
                  >
                    {allSeatsEnabled ? (
                      <><XCircle className="mr-1 size-3" /> Deselect All</>
                    ) : (
                      <><CheckCheck className="mr-1 size-3" /> Select All</>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Pre-order cards for seats you haven&apos;t filled yet. A placeholder NEO ID will be created — you can assign it to a team member later.
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-0 divide-y">
              {emptySeatCards.map((seat) => {
                const matPrice = getEffectiveMaterialPrice(
                  seat.materialUnitPrice,
                  seat.materialSlug,
                  companyPlanIncludesPlastic,
                );

                return (
                  <div
                    key={seat.seatIndex}
                    className={cn(
                      "flex items-center gap-3 py-3 transition-opacity first:pt-0 last:pb-0",
                      !seat.enabled && "opacity-50",
                    )}
                  >
                    <Switch
                      checked={seat.enabled}
                      onCheckedChange={(checked) =>
                        handleSeatToggle(seat.seatIndex, checked)
                      }
                    />

                    <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-muted/30">
                      {seat.variantFrontSvg && (
                        <Image
                          src={seat.variantFrontSvg}
                          alt={`Open seat ${seat.seatIndex + 1}`}
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        Open seat {seat.seatIndex + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Placeholder NEO ID
                      </p>
                    </div>

                    <Select
                      value={seat.materialId}
                      onValueChange={(v) => handleSeatMaterialChange(seat.seatIndex, v)}
                      disabled={!seat.enabled}
                    >
                      <SelectTrigger className="h-8 w-[110px] text-xs">
                        <SelectValue placeholder="Material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={seat.templateId}
                      onValueChange={(v) => handleSeatTemplateChange(seat.seatIndex, v)}
                      disabled={!seat.enabled}
                    >
                      <SelectTrigger className="h-8 w-[100px] text-xs">
                        <SelectValue placeholder="Design" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id} className="text-xs">
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">
                      {!seat.enabled ? (
                        <span className="text-muted-foreground">—</span>
                      ) : matPrice === 0 ? (
                        <span className="text-neo-teal">Free</span>
                      ) : (
                        <>{matPrice} SAR</>
                      )}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ─── Bulk Apply Row ──────────────────────────────────────

function BulkApplyRow({
  materials,
  templates,
  defaultMaterialId,
  defaultTemplateId,
  onApply,
  label,
}: {
  materials: MaterialOption[];
  templates: TemplateOption[];
  defaultMaterialId?: string;
  defaultTemplateId?: string;
  onApply: (materialId: string, templateId: string) => void;
  label: string;
}) {
  const [bulkMatId, setBulkMatId] = useState(defaultMaterialId ?? materials[0]?.id ?? "");
  const [bulkTmplId, setBulkTmplId] = useState(defaultTemplateId ?? templates[0]?.id ?? "");

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
      <Wand2 className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>

      <Select value={bulkMatId} onValueChange={setBulkMatId}>
        <SelectTrigger className="h-7 w-[100px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {materials.map((m) => (
            <SelectItem key={m.id} value={m.id} className="text-xs">
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={bulkTmplId} onValueChange={setBulkTmplId}>
        <SelectTrigger className="h-7 w-[90px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id} className="text-xs">
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="secondary"
        size="sm"
        className="h-7 text-xs"
        onClick={() => onApply(bulkMatId, bulkTmplId)}
      >
        Apply
      </Button>
    </div>
  );
}
