import { db } from "@/lib/db";
import { CLASSIC_BASE_PRICE, SHIPPING, VAT_RATE } from "@/lib/pricing";
import { getProfileUrl, generateQRCodeSvg } from "@/lib/qrcode";

// ─── Types ───────────────────────────────────────────────

export type OrderInput = {
  profileId: string;
  materialId: string;
  templateId: string;
  variantId: string;
  materialSlug: string;
  materialUnitPrice: number;
  templatePrice: number;
  shipping: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  pendingRequestIds: string[];
  requestOverrides?: Record<
    string,
    {
      materialId: string;
      templateId: string;
      variantId: string;
      materialSlug: string;
      materialUnitPrice: number;
    }
  >;
  memberCardOrders?: {
    userId: string;
    profileId: string | null;
    profileSlug: string | null;
    materialId: string;
    materialSlug: string;
    materialUnitPrice: number;
    templateId: string;
    variantId: string;
  }[];
  emptySeatCards?: {
    materialId: string;
    materialSlug: string;
    materialUnitPrice: number;
    templateId: string;
    variantId: string;
  }[];
};

export type OrderTotals = {
  subtotal: number;
  shippingCost: number;
  vat: number;
  total: number;
};

// ─── Helpers ─────────────────────────────────────────────

export function materialSlugToCardType(slug: string) {
  if (slug === "classic") return "PLASTIC" as const;
  if (slug === "artisan") return "WOOD" as const;
  return "METAL" as const;
}

export async function generateUniqueSlug(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
): Promise<string> {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let attempt = 0; attempt < 10; attempt++) {
    const parts = [];
    for (let i = 0; i < 3; i++) {
      let seg = "";
      for (let j = 0; j < 4; j++) {
        seg += chars[Math.floor(Math.random() * chars.length)];
      }
      parts.push(seg);
    }
    const slug = `neo-${parts.join("-")}`;
    const existing = await tx.profile.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  return `neo-${Date.now().toString(36)}`;
}

// ─── Calculate Order Total ───────────────────────────────

export async function calculateOrderTotal(
  input: OrderInput,
  isCompany: boolean,
  includesPlastic: boolean,
  isAdmin: boolean,
): Promise<OrderTotals> {
  // Own card price
  const ownMatPrice =
    isCompany && includesPlastic
      ? input.materialSlug === "classic"
        ? 0
        : input.materialUnitPrice - CLASSIC_BASE_PRICE
      : input.materialUnitPrice;
  const ownTmplPrice = isCompany ? 0 : input.templatePrice;

  const overrides = input.requestOverrides ?? {};
  const memberCardOrders = input.memberCardOrders ?? [];
  const emptySeatCards = input.emptySeatCards ?? [];

  // Employee card costs (from pending requests)
  let employeeSubtotal = 0;
  if (isCompany && isAdmin && input.pendingRequestIds.length > 0) {
    const requests = await db.cardRequest.findMany({
      where: { id: { in: input.pendingRequestIds }, status: "PENDING" },
      include: { material: true },
    });
    for (const req of requests) {
      const ov = overrides[req.id];
      const matSlug = ov?.materialSlug ?? req.material.slug;
      const matUnitPrice =
        ov?.materialUnitPrice ?? Number(req.material.unitPrice);
      const matPrice = includesPlastic
        ? matSlug === "classic"
          ? 0
          : matUnitPrice - CLASSIC_BASE_PRICE
        : matUnitPrice;
      employeeSubtotal += matPrice;
    }
  }

  // Member card order costs
  let memberSubtotal = 0;
  for (const mo of memberCardOrders) {
    const matPrice = includesPlastic
      ? mo.materialSlug === "classic"
        ? 0
        : mo.materialUnitPrice - CLASSIC_BASE_PRICE
      : mo.materialUnitPrice;
    memberSubtotal += matPrice;
  }

  // Empty seat card costs
  let seatSubtotal = 0;
  for (const seat of emptySeatCards) {
    const matPrice = includesPlastic
      ? seat.materialSlug === "classic"
        ? 0
        : seat.materialUnitPrice - CLASSIC_BASE_PRICE
      : seat.materialUnitPrice;
    seatSubtotal += matPrice;
  }

  const subtotal =
    ownMatPrice + ownTmplPrice + employeeSubtotal + memberSubtotal + seatSubtotal;
  const shippingCost =
    subtotal >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.STANDARD;
  const beforeVat = subtotal + shippingCost;
  const vat = Math.round(beforeVat * VAT_RATE * 100) / 100;
  const total = beforeVat + vat;

  return { subtotal, shippingCost, vat, total };
}

// ─── Create Order Cards (inside transaction) ─────────────

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

export async function createOrderCards(
  tx: TxClient,
  orderId: string,
  userId: string,
  input: OrderInput,
  isCompany: boolean,
  isAdmin: boolean,
  includesPlastic: boolean,
  companyId: string | null,
) {
  const overrides = input.requestOverrides ?? {};
  const memberCardOrders = input.memberCardOrders ?? [];
  const emptySeatCards = input.emptySeatCards ?? [];

  // Owner/individual's own card
  const ownProfile = await tx.profile.findUnique({
    where: { id: input.profileId },
    select: { slug: true },
  });
  if (!ownProfile) throw new Error("Profile not found");

  const ownProfileUrl = getProfileUrl(ownProfile.slug);
  const ownQrCodeSvg = await generateQRCodeSvg(ownProfile.slug);

  await tx.card.create({
    data: {
      cardType: materialSlugToCardType(input.materialSlug),
      materialId: input.materialId,
      profileId: input.profileId,
      orderId,
      status: "PENDING",
      profileUrl: ownProfileUrl,
      qrCodeSvg: ownQrCodeSvg,
    },
  });

  // Employee cards from pending requests
  if (isCompany && isAdmin && input.pendingRequestIds.length > 0 && companyId) {
    const requests = await tx.cardRequest.findMany({
      where: {
        id: { in: input.pendingRequestIds },
        companyId,
        status: "PENDING",
      },
      include: {
        material: true,
        template: true,
        profile: { select: { slug: true } },
      },
    });

    // Apply overrides
    for (const req of requests) {
      const ov = overrides[req.id];
      if (ov) {
        await tx.cardRequest.update({
          where: { id: req.id },
          data: {
            materialId: ov.materialId,
            templateId: ov.templateId,
            variantId: ov.variantId,
          },
        });
      }
    }

    // Create cards + update requests
    for (const req of requests) {
      const ov = overrides[req.id];
      const empProfileUrl = getProfileUrl(req.profile.slug);
      const empQrCodeSvg = await generateQRCodeSvg(req.profile.slug);
      const finalMaterialSlug = ov?.materialSlug ?? req.material.slug;

      const card = await tx.card.create({
        data: {
          cardType: materialSlugToCardType(finalMaterialSlug),
          materialId: ov?.materialId ?? req.materialId,
          profileId: req.profileId,
          orderId,
          status: "PENDING",
          profileUrl: empProfileUrl,
          qrCodeSvg: empQrCodeSvg,
        },
      });

      await tx.cardRequest.update({
        where: { id: req.id },
        data: {
          status: "ORDERED",
          orderId,
          cardId: card.id,
        },
      });
    }
  }

  // Member cards (admin ordering for members without requests)
  for (const mo of memberCardOrders) {
    let profileId = mo.profileId;
    let slug = mo.profileSlug;

    if (!profileId) {
      slug = await generateUniqueSlug(tx);
      const placeholder = await tx.profile.create({
        data: {
          slug,
          name: "Reserved NEO ID",
          isPlaceholder: true,
          isPublished: false,
          userId: mo.userId,
        },
      });
      profileId = placeholder.id;
    }

    const memberProfileUrl = getProfileUrl(slug!);
    const memberQrCodeSvg = await generateQRCodeSvg(slug!);

    await tx.card.create({
      data: {
        cardType: materialSlugToCardType(mo.materialSlug),
        materialId: mo.materialId,
        profileId: profileId!,
        orderId,
        status: "PENDING",
        profileUrl: memberProfileUrl,
        qrCodeSvg: memberQrCodeSvg,
      },
    });
  }

  // Empty seat pre-orders
  for (const seat of emptySeatCards) {
    const slug = await generateUniqueSlug(tx);

    const placeholder = await tx.profile.create({
      data: {
        slug,
        name: "Reserved NEO ID",
        isPlaceholder: true,
        isPublished: false,
        userId,
      },
    });

    const seatProfileUrl = getProfileUrl(slug);
    const seatQrCodeSvg = await generateQRCodeSvg(slug);

    await tx.card.create({
      data: {
        cardType: materialSlugToCardType(seat.materialSlug),
        materialId: seat.materialId,
        profileId: placeholder.id,
        orderId,
        status: "PENDING",
        profileUrl: seatProfileUrl,
        qrCodeSvg: seatQrCodeSvg,
      },
    });
  }
}
