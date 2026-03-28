"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/auth";
import { createCardRequestSchema } from "@/lib/validators/card-request";
import { getProfileUrl, generateQRCodeSvg } from "@/lib/qrcode";


// ─── Helpers ────────────────────────────────────────────

async function requireCompanyUser() {
  const user = await ensureUser();
  if (user.accountType !== "COMPANY" || !user.companyId) {
    throw new Error("Not a company account");
  }
  return user;
}

async function requireCompanyAdmin() {
  const user = await requireCompanyUser();
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    throw new Error("Insufficient permissions");
  }
  return user;
}

// ─── Employee: Submit Card Request ──────────────────────

export async function createCardRequest(input: {
  profileId: string;
  materialId: string;
  templateId: string;
  variantId: string;
}) {
  const user = await requireCompanyUser();
  const data = createCardRequestSchema.parse(input);

  // Verify profile belongs to this user
  const profile = await db.profile.findFirst({
    where: { id: data.profileId, userId: user.id },
  });
  if (!profile) throw new Error("Profile not found");

  // Generate profile URL and QR code
  const profileUrl = getProfileUrl(profile.slug);
  const qrCodeSvg = await generateQRCodeSvg(profile.slug);

  // Check no existing active request for this profile
  const existing = await db.cardRequest.findUnique({
    where: { profileId: data.profileId },
  });
  if (existing && existing.status === "PENDING") {
    throw new Error("A card request already exists for this profile");
  }

  // Upsert: replace old requests (cancelled/rejected/ordered)
  if (existing) {
    await db.cardRequest.update({
      where: { id: existing.id },
      data: {
        status: "PENDING",
        materialId: data.materialId,
        templateId: data.templateId,
        variantId: data.variantId,
        profileUrl,
        qrCodeSvg,
        rejectionNote: null,
        orderId: null,
        cardId: null,
      },
    });
  } else {
    await db.cardRequest.create({
      data: {
        profileId: data.profileId,
        userId: user.id,
        companyId: user.companyId!,
        materialId: data.materialId,
        templateId: data.templateId,
        variantId: data.variantId,
        profileUrl,
        qrCodeSvg,
      },
    });
  }

  revalidatePath(`/profiles/${data.profileId}`);
  return { success: true };
}

// ─── Employee: Cancel Own Request ───────────────────────

export async function cancelCardRequest(requestId: string) {
  const user = await requireCompanyUser();

  const request = await db.cardRequest.findFirst({
    where: { id: requestId, userId: user.id, status: "PENDING" },
  });
  if (!request) throw new Error("Request not found or cannot be cancelled");

  await db.cardRequest.update({
    where: { id: requestId },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/profiles/${request.profileId}`);
  return { success: true };
}

// ─── Admin/Owner: Get Pending Requests ──────────────────

export async function getPendingCardRequests() {
  const user = await requireCompanyAdmin();

  return db.cardRequest.findMany({
    where: { companyId: user.companyId!, status: "PENDING" },
    include: {
      profile: { select: { id: true, name: true, slug: true } },
      user: { select: { id: true, name: true, avatarUrl: true } },
      material: {
        select: {
          id: true,
          name: true,
          slug: true,
          unitPrice: true,
          frontSvg: true,
        },
      },
      template: {
        select: { id: true, name: true, tier: true, price: true },
      },
      variant: {
        select: { id: true, frontSvg: true, backSvg: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

// ─── Admin/Owner: Reject Request ────────────────────────

export async function rejectCardRequest(
  requestId: string,
  note?: string,
) {
  const user = await requireCompanyAdmin();

  const request = await db.cardRequest.findFirst({
    where: { id: requestId, companyId: user.companyId!, status: "PENDING" },
  });
  if (!request) throw new Error("Request not found");

  await db.cardRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", rejectionNote: note ?? null },
  });

  revalidatePath(`/profiles/${request.profileId}`);
  revalidatePath("/company");
  return { success: true };
}

// ─── Get Card Request Status for Profile ────────────────

export async function getCardRequestForProfile(profileId: string) {
  const user = await ensureUser();

  const request = await db.cardRequest.findUnique({
    where: { profileId },
    include: {
      variant: { select: { frontSvg: true } },
      material: { select: { name: true } },
      template: { select: { name: true } },
    },
  });

  if (!request) return null;

  // Verify access: own request, or admin/owner of the company
  const isOwn = request.userId === user.id;
  const isAdmin =
    (user.role === "OWNER" || user.role === "ADMIN") &&
    user.companyId === request.companyId;

  if (!isOwn && !isAdmin) return null;

  return {
    id: request.id,
    status: request.status,
    materialName: request.material.name,
    templateName: request.template.name,
    variantFrontSvg: request.variant.frontSvg,
    rejectionNote: request.rejectionNote,
  };
}
