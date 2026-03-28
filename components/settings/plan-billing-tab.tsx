"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Info, Users, CreditCard, Zap, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlanCard } from "@/components/settings/plan-card";
import {
  createSubscription,
  activateSubscription,
} from "@/actions/subscription";

// ─── Types ─────────────────────────────────────────────

export type SerializedPlan = {
  id: string;
  tier: string;
  name: string;
  price: number;
  maxSeats: number;
  maxProfilesPerSeat: number;
  includesPlasticCard: boolean;
  features: Record<string, unknown> | null;
};

export type PlanBillingData = {
  accountType: "INDIVIDUAL" | "COMPANY";
  role: "OWNER" | "ADMIN" | "MEMBER";
  currentPlanTier: string | null;
  currentPlanName: string;
  profileCount: number;
  profileLimit: number;
  companyName: string | null;
  employeeCount: number;
  seatCount: number;
  maxSeats: number;
  availablePlans: SerializedPlan[];
};

// ─── Feature Lists ──────────────────────────────────────

const INDIVIDUAL_FEATURES: Record<string, string[]> = {
  FREE: [
    "Up to 3 NEO IDs",
    "Free card templates",
    "Basic analytics (views)",
    "Buy physical cards at full price",
    "Community support",
  ],
  PRO: [
    "Unlimited NEO IDs",
    "All premium templates included",
    "Advanced analytics (views, taps, device)",
    "Buy physical cards at full price",
    "Priority email support",
  ],
};

const COMPANY_FEATURES: Record<string, string[]> = {
  STARTUP: [
    "5 NEO ID seats",
    "All templates included",
    "Basic analytics",
    "Logo + brand colors",
    "Email support",
  ],
  BUSINESS: [
    "25 NEO ID seats",
    "All templates included",
    "Advanced analytics",
    "Full company branding",
    "Bulk ordering",
    "Priority email + chat support",
  ],
  ENTERPRISE: [
    "Custom seat count",
    "All templates + custom design",
    "Full analytics suite + export",
    "White-label branding",
    "Bulk ordering",
    "Dedicated account manager + phone support",
  ],
};

// ─── Component ──────────────────────────────────────────

export function PlanBillingTab({ data }: { data: PlanBillingData }) {
  const {
    accountType,
    role,
    currentPlanTier,
    currentPlanName,
    profileCount,
    profileLimit,
    companyName,
    employeeCount,
    seatCount,
    maxSeats,
    availablePlans,
  } = data;

  const isCompany = accountType === "COMPANY";
  const isEmployee = isCompany && role === "MEMBER";
  const isUnlimited = !isCompany && profileLimit === 0;

  // Handle PayPal return redirect
  const searchParams = useSearchParams();
  const [activating, setActivating] = useState(false);
  const [activationMessage, setActivationMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const subscription = searchParams.get("subscription");
    const tier = searchParams.get("tier");
    const subscriptionId = searchParams.get("subscription_id");

    if (subscription === "success" && tier && subscriptionId && !activating) {
      setActivating(true);
      setActivationMessage("Activating your subscription...");

      activateSubscription(tier, subscriptionId).then((result) => {
        setActivating(false);
        if (result.success) {
          setActivationMessage("Subscription activated successfully!");
          // Clear URL params
          window.history.replaceState({}, "", "/settings");
        } else {
          setActivationMessage(result.error ?? "Activation failed");
        }
      });
    } else if (subscription === "cancelled") {
      setActivationMessage("Subscription was cancelled.");
      window.history.replaceState({}, "", "/settings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-10">
      {/* ── Activation banner ─────────────────────────── */}
      {activationMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-neo-teal/30 bg-neo-teal/5 p-4 text-sm">
          {activating && <Loader2 className="size-4 animate-spin text-neo-teal" />}
          <span>{activationMessage}</span>
        </div>
      )}

      {/* ── Current Plan Card ─────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-neo-teal/10">
              <Image
                src="/brandings/logo-icon.svg"
                alt="NEO ID"
                width={24}
                height={24}
              />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentPlanName}
                <Badge variant="secondary" className="text-xs">
                  {currentPlanTier ?? "Free"}
                </Badge>
              </CardTitle>
              <CardDescription>
                {isCompany
                  ? `Your company is on the ${currentPlanName} plan`
                  : `You're on the ${currentPlanName} plan`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Usage bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isCompany ? "Seats used" : "NEO IDs used"}
              </span>
              <span className="font-medium">
                {isCompany
                  ? `${seatCount}/${maxSeats}`
                  : isUnlimited
                    ? `${profileCount} (Unlimited)`
                    : `${profileCount}/${profileLimit}`}
              </span>
            </div>

            {!isUnlimited && (
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-neo-teal transition-all"
                  style={{
                    width: `${Math.min(
                      ((isCompany ? seatCount : profileCount) /
                        (isCompany ? maxSeats : profileLimit)) *
                        100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Company-specific stats */}
          {isCompany && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="size-4" />
                {employeeCount} team member{employeeCount !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="size-4" />
                {seatCount} seat{seatCount !== 1 ? "s" : ""} active
              </span>
            </div>
          )}

          {/* Subscription status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="size-4" />
            {currentPlanTier
              ? "Subscription active. Renewal date will appear here"
              : "No active subscription"}
          </div>

          {/* Employee notice */}
          {isEmployee && companyName && (
            <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                Managed by <strong>{companyName}</strong>. Contact your account
                administrator to change plans.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Plan Cards Grid ───────────────────────────── */}
      {!isEmployee && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Available Plans
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the plan that fits your needs
            </p>
          </div>

          {isCompany ? (
            <CompanyPlans
              availablePlans={availablePlans}
              currentPlanTier={currentPlanTier}
            />
          ) : (
            <IndividualPlans currentPlanTier={currentPlanTier} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Upgrade handler ─────────────────────────────────────

function useUpgradeHandler() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(tier: string) {
    setLoading(tier);
    setError(null);

    const result = await createSubscription(tier);

    if (result.error) {
      setError(result.error);
      setLoading(null);
      return;
    }

    if (result.approvalUrl) {
      // Redirect to PayPal
      window.location.href = result.approvalUrl;
      return;
    }

    setLoading(null);
  }

  return { loading, error, handleUpgrade };
}

// ─── Individual Plans ────────────────────────────────────

function IndividualPlans({
  currentPlanTier,
}: {
  currentPlanTier: string | null;
}) {
  const { loading, error, handleUpgrade } = useUpgradeHandler();

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
        <PlanCard
          name="Free"
          price={0}
          priceLabel="Free"
          features={INDIVIDUAL_FEATURES.FREE}
          isCurrentPlan={!currentPlanTier}
          isMostPopular={false}
          includesCards={false}
          ctaLabel={!currentPlanTier ? "Current Plan" : "Downgrade"}
          ctaVariant="outline"
          ctaDisabled={!currentPlanTier || loading !== null}
          tier="FREE"
        />
        <PlanCard
          name="Pro"
          price={29}
          features={INDIVIDUAL_FEATURES.PRO}
          isCurrentPlan={currentPlanTier === "PRO"}
          isMostPopular={true}
          includesCards={false}
          ctaLabel={
            loading === "PRO"
              ? "Redirecting..."
              : currentPlanTier === "PRO"
                ? "Current Plan"
                : "Upgrade to Pro"
          }
          ctaVariant={currentPlanTier === "PRO" ? "outline" : "default"}
          ctaDisabled={currentPlanTier === "PRO" || loading !== null}
          ctaAction={() => handleUpgrade("PRO")}
          tier="PRO"
        />
      </div>
    </div>
  );
}

// ─── Company Plans ───────────────────────────────────────

function CompanyPlans({
  availablePlans,
  currentPlanTier,
}: {
  availablePlans: SerializedPlan[];
  currentPlanTier: string | null;
}) {
  const { loading, error, handleUpgrade } = useUpgradeHandler();

  const companyTiers = ["STARTUP", "BUSINESS", "ENTERPRISE"] as const;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {companyTiers.map((tier) => {
          const plan = availablePlans.find((p) => p.tier === tier);
          const isCurrent = currentPlanTier === tier;
          const features = COMPANY_FEATURES[tier] ?? [];
          const isEnterprise = tier === "ENTERPRISE";
          const isBusiness = tier === "BUSINESS";

          const currentIndex = currentPlanTier
            ? companyTiers.indexOf(
                currentPlanTier as (typeof companyTiers)[number],
              )
            : -1;
          const tierIndex = companyTiers.indexOf(tier);
          const isDowngrade = currentIndex > tierIndex;

          let ctaLabel = `Upgrade to ${plan?.name ?? tier}`;
          if (loading === tier) ctaLabel = "Redirecting...";
          else if (isCurrent) ctaLabel = "Current Plan";
          else if (isEnterprise) ctaLabel = "Contact Sales";
          else if (isDowngrade) ctaLabel = "Downgrade";

          return (
            <PlanCard
              key={tier}
              name={plan?.name ?? tier}
              price={plan?.price ?? 0}
              priceLabel={isEnterprise ? "Custom" : undefined}
              features={features}
              isCurrentPlan={isCurrent}
              isMostPopular={isBusiness}
              includesCards={plan?.includesPlasticCard ?? true}
              cardCount={plan?.maxSeats ?? 0}
              ctaLabel={ctaLabel}
              ctaVariant={isCurrent || isDowngrade ? "outline" : "default"}
              ctaDisabled={isCurrent || loading !== null}
              ctaAction={
                isEnterprise
                  ? () => window.open("mailto:hello@neo-id.com", "_blank")
                  : () => handleUpgrade(tier)
              }
              tier={tier}
            />
          );
        })}
      </div>
    </div>
  );
}
