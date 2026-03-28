import { db } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/pricing";

export type ProfileLimitResult = {
  allowed: boolean;
  current: number;
  limit: number; // 0 = unlimited
  planName: string;
};

/**
 * Check whether a user can create another NEO ID (profile).
 *
 * Company users:
 *   - Company MUST have a paid plan (no free company plan).
 *   - OWNER / ADMIN: can create profiles up to company plan's maxSeats.
 *   - MEMBER: can create max 1 profile on their own (if owner hasn't created one
 *     for them yet), still subject to the company-wide seat limit.
 *   - Seat limit counts ALL profiles across all employees in the company.
 *
 * Individual users:
 *   - Free: up to 3 NEO IDs (PLAN_LIMITS.INDIVIDUAL_FREE.maxNeoIds)
 *   - Pro: unlimited (maxNeoIds = 0)
 */
export async function checkProfileLimit(
  userId: string,
): Promise<ProfileLimitResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      company: {
        include: {
          plan: true,
          employees: { select: { id: true } },
        },
      },
      plan: true,
    },
  });

  if (!user) {
    return { allowed: false, current: 0, limit: 0, planName: "Unknown" };
  }

  // ─── Company user ─────────────────────────────────────
  if (user.accountType === "COMPANY") {
    const company = user.company;
    const plan = company?.plan;

    // No plan = not allowed (no free company plan exists)
    if (!plan) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        planName: "No Plan",
      };
    }

    // Count non-placeholder profiles across the entire company
    const companyUserIds =
      company?.employees.map((e) => e.id) ?? [];
    const companyProfileCount = await db.profile.count({
      where: { userId: { in: companyUserIds }, isPlaceholder: false },
    });

    const maxSeats = plan.maxSeats;
    const planName = plan.name;

    // MEMBER: can only create 1 profile on their own
    if (user.role === "MEMBER") {
      const myProfileCount = await db.profile.count({
        where: { userId, isPlaceholder: false },
      });
      if (myProfileCount >= 1) {
        return {
          allowed: false,
          current: companyProfileCount,
          limit: maxSeats,
          planName,
        };
      }
    }

    return {
      allowed: companyProfileCount < maxSeats,
      current: companyProfileCount,
      limit: maxSeats,
      planName,
    };
  }

  // ─── Individual user ──────────────────────────────────
  const profileCount = await db.profile.count({ where: { userId } });

  const maxNeoIds = user.plan
    ? (user.plan.maxProfilesPerSeat === 0 ? 0 : user.plan.maxProfilesPerSeat)
    : PLAN_LIMITS.INDIVIDUAL_FREE.maxNeoIds;

  const planName = user.plan?.name ?? "Free";

  // 0 = unlimited
  if (maxNeoIds === 0) {
    return { allowed: true, current: profileCount, limit: 0, planName };
  }

  return {
    allowed: profileCount < maxNeoIds,
    current: profileCount,
    limit: maxNeoIds,
    planName,
  };
}
