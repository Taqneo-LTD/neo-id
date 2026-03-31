"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/auth";
import { createOrderCards, type OrderInput } from "@/lib/order-helpers";

// ─── Valid status transitions ────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID"],
  PENDING_CONTACT: ["PAID"],
  PAID: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
};

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
  const auditLog = Array.isArray(existingMeta.statusLog)
    ? existingMeta.statusLog
    : [];

  // PENDING_CONTACT > PAID: create cards from stored metadata
  if (
    (order.status === "PENDING_CONTACT" || order.status === "PENDING") &&
    newStatus === "PAID"
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
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          trackingNo: trackingNo || undefined,
          metadata: { ...existingMeta, statusLog: [...auditLog, auditEntry] },
        },
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
  } else {
    // Normal status transition
    await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus as "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED",
        ...(trackingNo ? { trackingNo } : {}),
        metadata: { ...existingMeta, statusLog: [...auditLog, auditEntry] },
      },
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/orders");

  return { success: true };
}
