"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WizardProgress, type WizardStep } from "./wizard-progress";
import { MaterialStep } from "./steps/material-step";
import { TemplateStep } from "./steps/template-step";
import { ShippingStep } from "./steps/shipping-step";
import { ReviewStep } from "./steps/review-step";
import { PaymentStep } from "./steps/payment-step";
import { SuccessStep } from "./steps/success-step";
import { RequestStep } from "./steps/request-step";
import { RequestSuccessStep } from "./steps/request-success-step";
import { TeamCardsStep } from "./steps/team-cards-step";
import type { TemplateTier } from "@/lib/generated/prisma/client";
import { CLASSIC_BASE_PRICE } from "@/lib/pricing";
import { createCardRequest } from "@/actions/card-request";
import type { OrderInput } from "@/lib/order-helpers";

// ─── Types ───────────────────────────────────────────────

export type MaterialOption = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tier: number;
  frontSvg: string;
  backSvg: string;
  unitPrice: number;
};

export type TemplateOption = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  tier: TemplateTier;
  price: number | null;
  variants: {
    id: string;
    materialId: string;
    frontSvg: string;
    backSvg: string;
  }[];
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
};

export type TeamMember = {
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  profileId: string | null;
  profileName: string | null;
  profileSlug: string | null;
  hasExistingCard: boolean;
  request: {
    id: string;
    materialName: string;
    materialSlug: string;
    materialUnitPrice: number;
    templateName: string;
    templateTier: TemplateTier;
    templatePrice: number | null;
    variantFrontSvg: string;
    variantBackSvg: string;
  } | null;
};

export type TeamCardOverride = {
  requestId: string;
  materialId: string;
  templateId: string;
  variantId: string;
  materialSlug: string;
  materialName: string;
  materialUnitPrice: number;
  templateName: string;
  templateTier: TemplateTier;
  templatePrice: number | null;
  variantFrontSvg: string;
  variantBackSvg: string;
};

/** Card order for a member who didn't submit a request themselves */
export type MemberCardOrder = {
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  profileId: string | null;
  profileSlug: string | null;
  enabled: boolean;
  materialId: string;
  materialSlug: string;
  materialName: string;
  materialUnitPrice: number;
  templateId: string;
  templateName: string;
  templateTier: TemplateTier;
  templatePrice: number | null;
  variantId: string;
  variantFrontSvg: string;
  variantBackSvg: string;
};

export type EmptySeatCard = {
  seatIndex: number;
  enabled: boolean;
  materialId: string;
  materialSlug: string;
  materialName: string;
  materialUnitPrice: number;
  templateId: string;
  templateName: string;
  templateTier: TemplateTier;
  templatePrice: number | null;
  variantId: string;
  variantFrontSvg: string;
  variantBackSvg: string;
};

export type WizardData = {
  material: MaterialOption | null;
  template: TemplateOption | null;
  variantId: string | null;
  shipping: ShippingAddress;
  teamCardOverrides: Map<string, TeamCardOverride>;
  memberCardOrders: MemberCardOrder[];
  emptySeatCards: EmptySeatCard[];
};

type CardOrderWizardProps = {
  profileId: string;
  profileName: string;
  materials: MaterialOption[];
  templates: TemplateOption[];
  isCompany: boolean;
  companyPlanIncludesPlastic: boolean;
  userRole: "OWNER" | "ADMIN" | "MEMBER";
  teamMembers?: TeamMember[];
  companyMaxSeats?: number;
  companyEmployeeCount?: number;
  paypalClientId: string;
  paypalCurrency: string;
};

// ─── Step Definitions ────────────────────────────────────

const EMPLOYEE_STEPS: WizardStep[] = [
  { id: "material", label: "Material" },
  { id: "template", label: "Design" },
  { id: "request", label: "Request" },
  { id: "request-success", label: "Done" },
];

function getAdminSteps(hasTeamCards: boolean): WizardStep[] {
  const steps: WizardStep[] = [
    { id: "material", label: "Material" },
    { id: "template", label: "Design" },
  ];
  if (hasTeamCards) {
    steps.push({ id: "team-cards", label: "Team Cards" });
  }
  steps.push(
    { id: "shipping", label: "Shipping" },
    { id: "review", label: "Review" },
    { id: "payment", label: "Payment" },
    { id: "success", label: "Done" },
  );
  return steps;
}

const INDIVIDUAL_STEPS: WizardStep[] = [
  { id: "material", label: "Material" },
  { id: "template", label: "Design" },
  { id: "shipping", label: "Shipping" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
  { id: "success", label: "Done" },
];

const EMPTY_SHIPPING: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
};

// ─── Animation variants ─────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    filter: "blur(4px)",
  }),
};

// ─── Component ───────────────────────────────────────────

export function CardOrderWizard({
  profileId,
  profileName,
  materials,
  templates,
  isCompany,
  companyPlanIncludesPlastic,
  userRole,
  teamMembers = [],
  companyMaxSeats = 0,
  companyEmployeeCount = 0,
  paypalClientId,
  paypalCurrency,
}: CardOrderWizardProps) {
  const isEmployee = isCompany && userRole === "MEMBER";
  const isAdmin = isCompany && (userRole === "OWNER" || userRole === "ADMIN");
  const emptySeats = Math.max(0, companyMaxSeats - companyEmployeeCount);

  // Derive pending requests from teamMembers
  const membersWithRequests = teamMembers.filter((m) => m.request !== null);
  const membersWithoutRequests = teamMembers.filter(
    (m) => m.request === null && !m.hasExistingCard,
  );
  const membersWithCards = teamMembers.filter(
    (m) => m.request === null && m.hasExistingCard,
  );

  const hasTeamCards =
    isAdmin &&
    (membersWithRequests.length > 0 ||
      membersWithoutRequests.length > 0 ||
      emptySeats > 0);

  const steps = isEmployee
    ? EMPLOYEE_STEPS
    : isCompany
      ? getAdminSteps(hasTeamCards)
      : INDIVIDUAL_STEPS;

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<WizardData>({
    material: null,
    template: null,
    variantId: null,
    shipping: EMPTY_SHIPPING,
    teamCardOverrides: new Map(),
    memberCardOrders: [],
    emptySeatCards: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [payLater, setPayLater] = useState(false);

  const currentStepId = steps[stepIndex].id;
  const isSuccessStep =
    currentStepId === "success" || currentStepId === "request-success";

  function canGoNext(): boolean {
    switch (currentStepId) {
      case "material":
        return data.material !== null;
      case "template":
        return data.template !== null && data.variantId !== null;
      case "shipping": {
        const s = data.shipping;
        return !!(
          s.fullName &&
          s.phone &&
          s.addressLine1 &&
          s.city &&
          s.state &&
          s.zipCode
        );
      }
      case "team-cards":
        return true;
      case "review":
        return true;
      case "payment":
        return true;
      case "request":
        return true;
      default:
        return false;
    }
  }

  function handleNext() {
    // Employee: submit card request
    if (currentStepId === "request") {
      if (!data.material || !data.template || !data.variantId) return;
      setIsSubmitting(true);
      startTransition(async () => {
        try {
          await createCardRequest({
            profileId,
            materialId: data.material!.id,
            templateId: data.template!.id,
            variantId: data.variantId!,
          });
          setIsSubmitting(false);
          setDirection(1);
          setStepIndex((i) => i + 1);
        } catch (err) {
          console.error("Card request failed:", err);
          setIsSubmitting(false);
        }
      });
      return;
    }

    // Payment step is handled by PayPal buttons — no action here
    if (currentStepId === "payment") return;

    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function handleBack() {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function getMaterialPrice(mat: MaterialOption): number {
    if (isCompany && companyPlanIncludesPlastic) {
      if (mat.slug === "classic") return 0;
      // Upgrade cost = difference from included Classic card
      return mat.unitPrice - CLASSIC_BASE_PRICE;
    }
    return mat.unitPrice;
  }

  function getTemplatePrice(tmpl: TemplateOption): number {
    if (isCompany) return 0;
    if (tmpl.tier === "FREE") return 0;
    return tmpl.price ?? 0;
  }

  function buildOrderInput(): OrderInput | null {
    if (!data.material || !data.template || !data.variantId) return null;

    const requestOverrides: Record<string, {
      materialId: string;
      templateId: string;
      variantId: string;
      materialSlug: string;
      materialUnitPrice: number;
    }> = {};
    for (const [reqId, override] of data.teamCardOverrides) {
      requestOverrides[reqId] = {
        materialId: override.materialId,
        templateId: override.templateId,
        variantId: override.variantId,
        materialSlug: override.materialSlug,
        materialUnitPrice: override.materialUnitPrice,
      };
    }

    const enabledMemberOrders = data.memberCardOrders
      .filter((m) => m.enabled)
      .map((m) => ({
        userId: m.userId,
        profileId: m.profileId,
        profileSlug: m.profileSlug,
        materialId: m.materialId,
        materialSlug: m.materialSlug,
        materialUnitPrice: m.materialUnitPrice,
        templateId: m.templateId,
        variantId: m.variantId,
      }));

    const enabledSeatCards = data.emptySeatCards
      .filter((s) => s.enabled)
      .map((s) => ({
        materialId: s.materialId,
        materialSlug: s.materialSlug,
        materialUnitPrice: s.materialUnitPrice,
        templateId: s.templateId,
        variantId: s.variantId,
      }));

    return {
      profileId,
      materialId: data.material.id,
      templateId: data.template.id,
      variantId: data.variantId,
      materialSlug: data.material.slug,
      materialUnitPrice: data.material.unitPrice,
      templatePrice: data.template.price ?? 0,
      shipping: data.shipping,
      pendingRequestIds: membersWithRequests.map((m) => m.request!.id),
      requestOverrides,
      memberCardOrders: enabledMemberOrders,
      emptySeatCards: enabledSeatCards,
    };
  }

  function handlePaymentSuccess() {
    setDirection(1);
    setStepIndex((i) => i + 1);
  }

  function handlePayLaterSuccess() {
    setPayLater(true);
    setDirection(1);
    setStepIndex((i) => i + 1);
  }

  return (
    <div className="flex min-h-[calc(95vh-7rem)] flex-col items-center py-6">
      <div className="flex w-full max-w-4xl flex-1 flex-col">
        {/* Header */}
        {!isSuccessStep && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            {/* Back icon + centered title */}
            <div className="relative flex items-start justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-0 size-9 text-muted-foreground"
                asChild
              >
                <Link href={`/profiles/${profileId}`}>
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>

              <div className="text-center">
                <h1 className="text-xl font-semibold tracking-tight">
                  {isEmployee ? "Request NFC Card" : "Order NFC Card"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isEmployee
                    ? `Request a card for "${profileName}"`
                    : `Get a physical NFC card for "${profileName}"`}
                </p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="mt-8">
              <WizardProgress steps={steps} currentIndex={stepIndex} />
            </div>
          </motion.div>
        )}

        {/* Step content */}
        <div className="relative flex flex-1 items-start pt-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepId}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="w-full"
            >
              {currentStepId === "material" && (
                <MaterialStep
                  materials={materials}
                  selected={data.material}
                  onSelect={(mat) => {
                    setData((d) => {
                      const variant = d.template?.variants.find(
                        (v) => v.materialId === mat.id,
                      );
                      return {
                        ...d,
                        material: mat,
                        variantId: variant?.id ?? d.variantId,
                      };
                    });
                  }}
                  getMaterialPrice={getMaterialPrice}
                  isCompany={isCompany}
                  companyPlanIncludesPlastic={companyPlanIncludesPlastic}
                />
              )}
              {currentStepId === "template" && (
                <TemplateStep
                  templates={templates}
                  materials={materials}
                  selectedTemplate={data.template}
                  selectedMaterial={data.material}
                  selectedVariantId={data.variantId}
                  onSelect={(tmpl, variantId) =>
                    setData((d) => ({ ...d, template: tmpl, variantId }))
                  }
                  getTemplatePrice={getTemplatePrice}
                  isCompany={isCompany}
                />
              )}
              {currentStepId === "team-cards" && (
                <TeamCardsStep
                  membersWithRequests={membersWithRequests}
                  membersWithoutRequests={membersWithoutRequests}
                  membersWithCards={membersWithCards}
                  materials={materials}
                  templates={templates}
                  emptySeats={emptySeats}
                  companyMaxSeats={companyMaxSeats}
                  companyEmployeeCount={companyEmployeeCount}
                  adminMaterial={data.material}
                  adminTemplate={data.template}
                  adminVariantId={data.variantId}
                  profileName={profileName}
                  teamCardOverrides={data.teamCardOverrides}
                  memberCardOrders={data.memberCardOrders}
                  emptySeatCards={data.emptySeatCards}
                  onOverridesChange={(overrides) =>
                    setData((d) => ({ ...d, teamCardOverrides: overrides }))
                  }
                  onMemberCardOrdersChange={(orders) =>
                    setData((d) => ({ ...d, memberCardOrders: orders }))
                  }
                  onEmptySeatCardsChange={(seats) =>
                    setData((d) => ({ ...d, emptySeatCards: seats }))
                  }
                  getMaterialPrice={getMaterialPrice}
                  companyPlanIncludesPlastic={companyPlanIncludesPlastic}
                />
              )}
              {currentStepId === "shipping" && (
                <ShippingStep
                  address={data.shipping}
                  onChange={(shipping) =>
                    setData((d) => ({ ...d, shipping }))
                  }
                  orderSubtotal={(() => {
                    let sub =
                      (data.material ? getMaterialPrice(data.material) : 0) +
                      (data.template ? getTemplatePrice(data.template) : 0);
                    // Team card request costs
                    for (const m of membersWithRequests) {
                      const override = data.teamCardOverrides.get(m.request!.id);
                      const matPrice = override
                        ? getMaterialPrice({ unitPrice: override.materialUnitPrice, slug: override.materialSlug } as MaterialOption)
                        : getMaterialPrice({ unitPrice: m.request!.materialUnitPrice, slug: m.request!.materialSlug } as MaterialOption);
                      sub += matPrice;
                    }
                    // Member card orders (no request)
                    for (const mo of data.memberCardOrders) {
                      if (!mo.enabled) continue;
                      sub += getMaterialPrice({ unitPrice: mo.materialUnitPrice, slug: mo.materialSlug } as MaterialOption);
                    }
                    // Empty seat pre-orders
                    for (const seat of data.emptySeatCards) {
                      if (!seat.enabled) continue;
                      sub += getMaterialPrice({ unitPrice: seat.materialUnitPrice, slug: seat.materialSlug } as MaterialOption);
                    }
                    return sub;
                  })()}
                />
              )}
              {currentStepId === "review" && (
                <ReviewStep
                  data={data}
                  getMaterialPrice={getMaterialPrice}
                  getTemplatePrice={getTemplatePrice}
                  isCompany={isCompany}
                  companyPlanIncludesPlastic={companyPlanIncludesPlastic}
                  membersWithRequests={membersWithRequests}
                  teamCardOverrides={data.teamCardOverrides}
                  memberCardOrders={data.memberCardOrders}
                  emptySeatCards={data.emptySeatCards}
                />
              )}
              {currentStepId === "payment" && (() => {
                const orderInput = buildOrderInput();
                if (!orderInput) return null;
                return (
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                      currency: paypalCurrency,
                      intent: "capture",
                    }}
                  >
                    <PaymentStep
                      orderInput={orderInput}
                      onSuccess={handlePaymentSuccess}
                      onPayLaterSuccess={handlePayLaterSuccess}
                      onError={() => {}}
                    />
                  </PayPalScriptProvider>
                );
              })()}
              {currentStepId === "success" && (
                <SuccessStep profileId={profileId} payLater={payLater} />
              )}
              {currentStepId === "request" && (
                <RequestStep
                  data={data}
                  getMaterialPrice={getMaterialPrice}
                  getTemplatePrice={getTemplatePrice}
                  companyPlanIncludesPlastic={companyPlanIncludesPlastic}
                />
              )}
              {currentStepId === "request-success" && (
                <RequestSuccessStep profileId={profileId} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {!isSuccessStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-auto flex items-center justify-between pt-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={stepIndex === 0}
              className="text-muted-foreground"
            >
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back
            </Button>

            {currentStepId !== "payment" && (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canGoNext() || isSubmitting || isPending}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    {currentStepId === "request"
                      ? "Submitting..."
                      : "Processing..."}
                  </>
                ) : (
                  <>
                    {currentStepId === "request"
                      ? "Submit Request"
                      : "Continue"}
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </>
                )}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
