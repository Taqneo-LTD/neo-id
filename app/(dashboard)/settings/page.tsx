import { requireOnboarded } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/pricing";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import type { PlanBillingData, SerializedPlan } from "@/components/settings/plan-billing-tab";

export default async function SettingsPage() {
  const user = await requireOnboarded();

  const isCompany = user.accountType === "COMPANY" && !!user.companyId;

  // Fetch all plans for plan cards
  const allPlans = await db.plan.findMany({ orderBy: { price: "asc" } });

  const serializedPlans: SerializedPlan[] = allPlans.map((p) => ({
    id: p.id,
    tier: p.tier,
    name: p.name,
    price: Number(p.price),
    maxSeats: p.maxSeats,
    maxProfilesPerSeat: p.maxProfilesPerSeat,
    includesPlasticCard: p.includesPlasticCard,
    features: p.features as Record<string, unknown> | null,
  }));

  let data: PlanBillingData;

  if (isCompany) {
    // ── Company user ──────────────────────────────────
    const company = await db.company.findUnique({
      where: { id: user.companyId! },
      include: {
        plan: true,
        employees: { select: { id: true } },
      },
    });

    const employeeIds = company?.employees.map((e) => e.id) ?? [];
    const seatCount = await db.profile.count({
      where: { userId: { in: employeeIds }, isPlaceholder: false },
    });

    const plan = company?.plan;

    data = {
      accountType: "COMPANY",
      role: user.role as "OWNER" | "ADMIN" | "MEMBER",
      currentPlanTier: plan?.tier ?? null,
      currentPlanName: plan?.name ?? "No Plan",
      profileCount: seatCount,
      profileLimit: plan?.maxSeats ?? 0,
      companyName: company?.nameEn ?? null,
      employeeCount: employeeIds.length,
      seatCount,
      maxSeats: company?.maxSeats ?? plan?.maxSeats ?? 0,
      availablePlans: serializedPlans,
    };
  } else {
    // ── Individual user ───────────────────────────────
    const userWithPlan = await db.user.findUnique({
      where: { id: user.id },
      include: { plan: true },
    });

    const profileCount = await db.profile.count({
      where: { userId: user.id },
    });

    const plan = userWithPlan?.plan;
    const maxNeoIds = plan
      ? plan.maxProfilesPerSeat === 0
        ? 0
        : plan.maxProfilesPerSeat
      : PLAN_LIMITS.INDIVIDUAL_FREE.maxNeoIds;

    data = {
      accountType: "INDIVIDUAL",
      role: user.role as "OWNER" | "ADMIN" | "MEMBER",
      currentPlanTier: plan?.tier ?? null,
      currentPlanName: plan?.name ?? "Free",
      profileCount,
      profileLimit: maxNeoIds,
      companyName: null,
      employeeCount: 0,
      seatCount: 0,
      maxSeats: 0,
      availablePlans: serializedPlans,
    };
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account and subscription"
      />
      <SettingsPageClient data={data} />
    </div>
  );
}
