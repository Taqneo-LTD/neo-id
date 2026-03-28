"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/auth";
import { updateCompanySchema } from "@/lib/validators/company";

/** Ensure the current user is a company OWNER or ADMIN. Returns the user + company. */
async function requireCompanyAdmin() {
  const user = await ensureUser();
  if (user.accountType !== "COMPANY" || !user.companyId) {
    throw new Error("Not a company account");
  }
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    throw new Error("Insufficient permissions");
  }
  const company = await db.company.findUnique({
    where: { id: user.companyId },
    include: { plan: true },
  });
  if (!company) throw new Error("Company not found");
  return { user, company };
}

export async function updateCompany(formData: FormData) {
  const { company } = await requireCompanyAdmin();

  const raw: Record<string, unknown> = {};
  const nameEn = formData.get("nameEn") as string | null;
  const nameAr = formData.get("nameAr") as string | null;
  const crNumber = formData.get("crNumber") as string | null;
  const website = formData.get("website") as string | null;
  const brandColorsRaw = formData.get("brandColors") as string | null;

  if (nameEn !== null) raw.nameEn = nameEn;
  if (nameAr !== null) raw.nameAr = nameAr || undefined;
  if (crNumber !== null) raw.crNumber = crNumber || undefined;
  if (website !== null) raw.website = website || undefined;
  if (brandColorsRaw) raw.brandColors = JSON.parse(brandColorsRaw);

  const parsed = updateCompanySchema.parse(raw);

  await db.company.update({
    where: { id: company.id },
    data: parsed,
  });

  revalidatePath("/company");
}

export async function updateCompanyLogo(logoUrl: string) {
  const { company } = await requireCompanyAdmin();

  await db.company.update({
    where: { id: company.id },
    data: { logo: logoUrl },
  });

  revalidatePath("/company");
}

/**
 * Generate a shareable invite link for the company.
 * Returns the invite URL — owner/admin shares it via WhatsApp, native share, or copy.
 * The link is valid for 7 days and can be used once.
 */
export async function createInviteLink(label?: string): Promise<string> {
  const { user, company } = await requireCompanyAdmin();

  // Check seat limits
  const currentCount = await db.user.count({
    where: { companyId: company.id },
  });
  if (currentCount >= company.maxSeats) {
    throw new Error(
      `Seat limit reached (${company.maxSeats}). Upgrade your plan to add more employees.`,
    );
  }

  const invite = await db.invite.create({
    data: {
      companyId: company.id,
      createdById: user.id,
      label: label?.trim() || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const baseUrl = process.env.KINDE_SITE_URL || "http://localhost:3000";
  return `${baseUrl}/invite/${invite.token}`;
}

export async function updateEmployeeRole(
  employeeId: string,
  newRole: "ADMIN" | "MEMBER",
) {
  const { user, company } = await requireCompanyAdmin();

  const employee = await db.user.findFirst({
    where: { id: employeeId, companyId: company.id },
  });
  if (!employee) throw new Error("Employee not found");
  if (employee.role === "OWNER") throw new Error("Cannot change the owner's role");
  if (employee.id === user.id) throw new Error("Cannot change your own role");

  await db.user.update({
    where: { id: employeeId },
    data: { role: newRole },
  });

  revalidatePath("/company");
}

export async function removeEmployee(employeeId: string) {
  const { user, company } = await requireCompanyAdmin();

  const employee = await db.user.findFirst({
    where: { id: employeeId, companyId: company.id },
  });
  if (!employee) throw new Error("Employee not found");
  if (employee.role === "OWNER") throw new Error("Cannot remove the company owner");
  if (employee.id === user.id) throw new Error("Cannot remove yourself");

  await db.user.update({
    where: { id: employeeId },
    data: {
      companyId: null,
      accountType: "INDIVIDUAL",
      role: "MEMBER",
    },
  });

  revalidatePath("/company");
}
