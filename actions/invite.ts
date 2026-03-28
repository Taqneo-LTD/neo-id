"use server";

import { db } from "@/lib/db";
import { ensureUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Accept an invite link — joins the authenticated user to the company.
 * Returns { success, error, companyName }.
 */
export async function acceptInvite(token: string): Promise<{
  success: boolean;
  error?: string;
  companyName?: string;
}> {
  const user = await ensureUser();

  const invite = await db.invite.findUnique({
    where: { token },
    include: { company: true },
  });

  if (!invite) {
    return { success: false, error: "This invite link is invalid." };
  }

  if (invite.usedAt) {
    return { success: false, error: "This invite link has already been used." };
  }

  if (new Date() > invite.expiresAt) {
    return { success: false, error: "This invite link has expired. Ask your company admin for a new one." };
  }

  // Already in this company
  if (user.companyId === invite.companyId) {
    return { success: true, companyName: invite.company.nameEn };
  }

  // Already in another company
  if (user.companyId) {
    return {
      success: false,
      error: "You already belong to another company. Leave your current company first.",
    };
  }

  // Check seat limit
  const currentCount = await db.user.count({
    where: { companyId: invite.companyId },
  });
  if (currentCount >= invite.company.maxSeats) {
    return {
      success: false,
      error: "This company has reached its seat limit. Ask the admin to upgrade their plan.",
    };
  }

  // Join the company + mark invite as used
  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: {
        companyId: invite.companyId,
        accountType: "COMPANY",
        role: "MEMBER",
        onboarded: true,
      },
    }),
    db.invite.update({
      where: { id: invite.id },
      data: {
        usedAt: new Date(),
        usedById: user.id,
      },
    }),
  ]);

  revalidatePath("/company");
  revalidatePath("/dashboard");

  return { success: true, companyName: invite.company.nameEn };
}
