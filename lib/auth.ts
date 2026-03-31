import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/constants";

export async function getSession() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  const authenticated = await isAuthenticated();
  const kindeUser = await getUser();
  return { authenticated, kindeUser };
}

export async function requireAuth() {
  const { authenticated, kindeUser } = await getSession();
  if (!authenticated || !kindeUser) {
    redirect("/api/auth/login");
  }
  return kindeUser;
}

/**
 * Find or create a User record from the Kinde session.
 * Called on every authenticated page load — upserts on first visit.
 *
 * Handles two edge cases:
 * 1. Invited users: a placeholder user exists with this email but a fake kindeId.
 *    We link the real kindeId to the existing record.
 * 2. Race conditions: concurrent calls may both try to INSERT. The second
 *    one catches the unique constraint error and falls back to a find+update.
 */
export async function ensureUser() {
  const kindeUser = await requireAuth();

  const email = kindeUser.email ?? "";
  const name =
    [kindeUser.given_name, kindeUser.family_name]
      .filter(Boolean)
      .join(" ") || email;
  const isAdmin = isAdminEmail(email);

  // Check if a user already exists by kindeId
  const existing = await db.user.findUnique({
    where: { kindeId: kindeUser.id },
    include: { company: true },
  });

  if (existing) {
    // Update on every visit to keep name/email in sync
    return db.user.update({
      where: { kindeId: kindeUser.id },
      data: {
        email,
        name,
        ...(isAdmin ? { role: "OWNER" } : {}),
      },
      include: { company: true },
    });
  }

  // Check for an invited placeholder user with this email (fake kindeId)
  const invited = await db.user.findUnique({
    where: { email },
    include: { company: true },
  });

  if (invited && invited.kindeId.startsWith("invite_")) {
    // Claim the placeholder: link real kindeId and mark ready for onboarding
    return db.user.update({
      where: { id: invited.id },
      data: {
        kindeId: kindeUser.id,
        name,
        ...(isAdmin ? { role: "OWNER" } : {}),
      },
      include: { company: true },
    });
  }

  // New user — create
  try {
    return await db.user.create({
      data: {
        kindeId: kindeUser.id,
        email,
        name,
        ...(isAdmin ? { role: "OWNER" } : {}),
      },
      include: { company: true },
    });
  } catch (e: unknown) {
    // Race condition: another request created the user first
    if (
      e instanceof Error &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      const user = await db.user.findUnique({
        where: { kindeId: kindeUser.id },
        include: { company: true },
      });
      if (user) return user;
    }
    throw e;
  }
}

export async function getCurrentUser() {
  const kindeUser = await requireAuth();
  const user = await db.user.findUnique({
    where: { kindeId: kindeUser.id },
    include: { company: true },
  });
  return user;
}

export async function requireOnboarded() {
  const user = await ensureUser();
  if (!user.onboarded) {
    redirect("/onboarding");
  }
  return user;
}

export async function requirePlatformAdmin() {
  const user = await requireOnboarded();
  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }
  return user;
}
