"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/auth";
import { createOrderCards, type OrderInput } from "@/lib/order-helpers";
import type { OrderStatus } from "@/types";
import type { InputJsonValue } from "@/lib/generated/prisma/internal/prismaNamespace";

// ─── Valid status transitions ────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "FREE_SERVE", "CANCELLED"],
  PENDING_CONTACT: ["PAID", "FREE_SERVE", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  FREE_SERVE: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
};

const ALL_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PENDING_CONTACT",
  "PAID",
  "FREE_SERVE",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

// ─── Helpers ────────────────────────────────────────────

function revalidateOrderPaths(orderId: string) {
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/orders");
}

function buildMeta(existing: Record<string, unknown>, auditEntry?: Record<string, unknown>): InputJsonValue {
  if (!auditEntry) return existing as InputJsonValue;
  const log = Array.isArray(existing.statusLog) ? existing.statusLog : [];
  return { ...existing, statusLog: [...log, auditEntry] } as InputJsonValue;
}

// ─── Cancel cards helper ────────────────────────────────

async function cancelOrderCards(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  orderId: string,
) {
  await tx.card.updateMany({
    where: {
      orderId,
      status: { notIn: ["SHIPPED", "DELIVERED", "ACTIVE"] },
    },
    data: { status: "CANCELLED" },
  });
}

// ─── Update order status ─────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  trackingNo?: string,
  vendorNotes?: string,
) {
  const admin = await requirePlatformAdmin();

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: { include: { company: true } } },
  });

  if (!order) return { error: "Order not found" };

  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(newStatus)) {
    return { error: `Cannot transition from ${order.status} to ${newStatus}` };
  }

  // Tracking number required for SHIPPED
  if (newStatus === "SHIPPED" && !trackingNo?.trim()) {
    return { error: "Tracking number is required when marking as shipped" };
  }

  // Build audit log entry
  const auditEntry = {
    from: order.status,
    to: newStatus,
    by: admin.email,
    at: new Date().toISOString(),
    ...(trackingNo ? { trackingNo } : {}),
    ...(vendorNotes ? { vendorNotes } : {}),
  };

  const existingMeta = (order.metadata as Record<string, unknown>) ?? {};
  const updatedMeta = buildMeta(existingMeta, auditEntry);

  // PENDING/PENDING_CONTACT > PAID or FREE_SERVE: create cards from stored metadata
  if (
    (order.status === "PENDING_CONTACT" || order.status === "PENDING") &&
    (newStatus === "PAID" || newStatus === "FREE_SERVE")
  ) {
    const input = existingMeta as unknown as OrderInput;
    if (!input?.profileId) {
      return { error: "Order metadata missing, cannot create cards" };
    }

    const user = order.user;
    const isCompany = user.accountType === "COMPANY" && !!user.companyId;
    const isAdmin = user.role === "OWNER" || user.role === "ADMIN";
    let includesPlastic = false;

    if (isCompany && user.companyId) {
      const company = await db.company.findUnique({
        where: { id: user.companyId },
        include: { plan: { select: { includesPlasticCard: true } } },
      });
      includesPlastic = company?.plan?.includesPlasticCard ?? false;
    }

    await db.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        metadata: updatedMeta,
      };
      if (newStatus === "FREE_SERVE") {
        updateData.isFreeServe = true;
      }
      if (trackingNo) {
        updateData.trackingNo = trackingNo;
      }

      await tx.order.update({
        where: { id: orderId },
        data: updateData as Parameters<typeof tx.order.update>[0]["data"],
      });

      await createOrderCards(
        tx,
        orderId,
        user.id,
        input,
        isCompany,
        isAdmin,
        includesPlastic,
        user.companyId,
      );
    });
  } else if (newStatus === "CANCELLED") {
    // Cancel: soft-cancel unshipped cards
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          metadata: updatedMeta,
        },
      });
      await cancelOrderCards(tx, orderId);
    });
  } else {
    // Normal status transition
    await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus as "PAID" | "FREE_SERVE" | "PROCESSING" | "SHIPPED" | "DELIVERED",
        ...(trackingNo ? { trackingNo } : {}),
        metadata: updatedMeta,
      },
    });
  }

  revalidateOrderPaths(orderId);
  return { success: true };
}

// ─── Update order details (total, paymentId, trackingNo) ─

export async function updateOrderDetails(
  orderId: string,
  data: { totalAmount?: number; paymentId?: string; trackingNo?: string },
) {
  const admin = await requirePlatformAdmin();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found" };

  if (data.totalAmount !== undefined && data.totalAmount < 0) {
    return { error: "Total amount cannot be negative" };
  }

  const existingMeta = (order.metadata as Record<string, unknown>) ?? {};
  const auditEntries: Record<string, unknown>[] = [];
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};

  if (data.totalAmount !== undefined && Number(order.totalAmount) !== data.totalAmount) {
    updateData.totalAmount = data.totalAmount;
    auditEntries.push({
      action: "editTotal",
      from: String(order.totalAmount),
      to: String(data.totalAmount),
      by: admin.email,
      at: now,
    });
  }

  if (data.paymentId !== undefined && order.paymentId !== data.paymentId) {
    updateData.paymentId = data.paymentId || null;
    auditEntries.push({
      action: "editPaymentId",
      from: order.paymentId ?? "",
      to: data.paymentId,
      by: admin.email,
      at: now,
    });
  }

  if (data.trackingNo !== undefined && order.trackingNo !== data.trackingNo) {
    updateData.trackingNo = data.trackingNo || null;
    auditEntries.push({
      action: "editTracking",
      from: order.trackingNo ?? "",
      to: data.trackingNo,
      by: admin.email,
      at: now,
    });
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true }; // nothing changed
  }

  let meta: InputJsonValue = existingMeta as InputJsonValue;
  for (const entry of auditEntries) {
    meta = buildMeta(meta as Record<string, unknown>, entry);
  }
  updateData.metadata = meta;

  await db.order.update({
    where: { id: orderId },
    data: updateData,
  });

  revalidateOrderPaths(orderId);
  return { success: true };
}

// ─── Update shipping address ─────────────────────────────

export async function updateOrderShipping(
  orderId: string,
  address: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  },
) {
  const admin = await requirePlatformAdmin();

  if (!address.fullName?.trim() || !address.phone?.trim() || !address.addressLine1?.trim() || !address.city?.trim() || !address.state?.trim() || !address.zipCode?.trim()) {
    return { error: "All required address fields must be filled" };
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found" };

  const existingMeta = (order.metadata as Record<string, unknown>) ?? {};
  const updatedMeta = buildMeta(existingMeta, {
    action: "editShipping",
    by: admin.email,
    at: new Date().toISOString(),
  });

  await db.order.update({
    where: { id: orderId },
    data: {
      shippingAddr: address,
      metadata: updatedMeta,
    },
  });

  revalidateOrderPaths(orderId);
  return { success: true };
}

// ─── Update admin notes ─────────────────────────────────

export async function updateOrderAdminNotes(
  orderId: string,
  notes: string,
) {
  await requirePlatformAdmin();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found" };

  const existingMeta = (order.metadata as Record<string, unknown>) ?? {};

  await db.order.update({
    where: { id: orderId },
    data: {
      metadata: { ...existingMeta, adminNotes: notes } as InputJsonValue,
    },
  });

  revalidateOrderPaths(orderId);
  return { success: true };
}

// ─── Cancel order ────────────────────────────────────────

export async function cancelOrder(orderId: string) {
  const admin = await requirePlatformAdmin();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "Order not found" };

  if (order.status === "DELIVERED") {
    return { error: "Cannot cancel a delivered order" };
  }
  if (order.status === "CANCELLED") {
    return { error: "Order is already cancelled" };
  }

  const existingMeta = (order.metadata as Record<string, unknown>) ?? {};
  const updatedMeta = buildMeta(existingMeta, {
    action: "cancel",
    from: order.status,
    to: "CANCELLED",
    by: admin.email,
    at: new Date().toISOString(),
  });

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        metadata: updatedMeta,
      },
    });
    await cancelOrderCards(tx, orderId);
  });

  revalidateOrderPaths(orderId);
  return { success: true };
}

// ─── Delete order ────────────────────────────────────────

export async function deleteOrder(orderId: string) {
  await requirePlatformAdmin();

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      cards: { select: { id: true, status: true } },
    },
  });
  if (!order) return { error: "Order not found" };

  const allowedStatuses = ["PENDING", "PENDING_CONTACT", "CANCELLED", "FREE_SERVE"];
  if (!allowedStatuses.includes(order.status)) {
    return { error: `Cannot delete an order with status ${order.status}. Only PENDING, PENDING_CONTACT, CANCELLED, or FREE_SERVE orders can be deleted.` };
  }

  // For FREE_SERVE: block if any cards are shipped/delivered/active
  const hasShippedCards = order.cards.some((c) =>
    ["SHIPPED", "DELIVERED", "ACTIVE"].includes(c.status),
  );
  if (hasShippedCards) {
    return { error: "Cannot delete: some cards have already been shipped or delivered" };
  }

  await db.$transaction(async (tx) => {
    // Unlink card requests
    await tx.cardRequest.updateMany({
      where: { orderId },
      data: { orderId: null, cardId: null, status: "CANCELLED" },
    });
    // Delete cards
    await tx.card.deleteMany({ where: { orderId } });
    // Delete order
    await tx.order.delete({ where: { id: orderId } });
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/orders");
  redirect("/admin/orders");
}

// ─── Force order status override ─────────────────────────

export async function forceOrderStatus(
  orderId: string,
  newStatus: string,
  reason: string,
) {
  const admin = await requirePlatformAdmin();

  if (!reason?.trim()) {
    return { error: "A reason is required for force status override" };
  }

  if (!ALL_ORDER_STATUSES.includes(newStatus as OrderStatus)) {
    return { error: `Invalid status: ${newStatus}` };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: { include: { company: true } } },
  });
  if (!order) return { error: "Order not found" };

  if (order.status === newStatus) {
    return { error: "Order is already in this status" };
  }

  const existingMeta = (order.metadata as Record<string, unknown>) ?? {};
  const auditEntry = {
    action: "forceOverride",
    from: order.status,
    to: newStatus,
    by: admin.email,
    at: new Date().toISOString(),
    reason: reason.trim(),
  };
  const updatedMeta = buildMeta(existingMeta, auditEntry);

  // Force to PAID/FREE_SERVE from PENDING/PENDING_CONTACT: create cards
  const needsCardCreation =
    (order.status === "PENDING" || order.status === "PENDING_CONTACT") &&
    (newStatus === "PAID" || newStatus === "FREE_SERVE");

  // Force to CANCELLED: soft-cancel cards
  const needsCardCancel = newStatus === "CANCELLED";

  if (needsCardCreation) {
    const input = existingMeta as unknown as OrderInput;
    if (!input?.profileId) {
      return { error: "Order metadata missing, cannot create cards" };
    }

    const user = order.user;
    const isCompany = user.accountType === "COMPANY" && !!user.companyId;
    const isAdmin = user.role === "OWNER" || user.role === "ADMIN";
    let includesPlastic = false;

    if (isCompany && user.companyId) {
      const company = await db.company.findUnique({
        where: { id: user.companyId },
        include: { plan: { select: { includesPlasticCard: true } } },
      });
      includesPlastic = company?.plan?.includesPlasticCard ?? false;
    }

    await db.$transaction(async (tx) => {
      const forceData: Record<string, unknown> = {
        status: newStatus,
        metadata: updatedMeta,
      };
      if (newStatus === "FREE_SERVE") {
        forceData.isFreeServe = true;
      }

      await tx.order.update({
        where: { id: orderId },
        data: forceData as Parameters<typeof tx.order.update>[0]["data"],
      });
      await createOrderCards(
        tx,
        orderId,
        user.id,
        input,
        isCompany,
        isAdmin,
        includesPlastic,
        user.companyId,
      );
    });
  } else if (needsCardCancel) {
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED", metadata: updatedMeta },
      });
      await cancelOrderCards(tx, orderId);
    });
  } else {
    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus as OrderStatus, metadata: updatedMeta },
    });
  }

  revalidateOrderPaths(orderId);
  return { success: true };
}
