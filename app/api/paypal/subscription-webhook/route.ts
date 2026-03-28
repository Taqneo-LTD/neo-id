import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { PlanTier } from "@/lib/generated/prisma/client";

// ─── PayPal Subscription Webhook Handler ─────────────────
//
// Configure this URL in PayPal Dashboard → Webhooks:
//   POST /api/paypal/subscription-webhook
//
// Events to subscribe to:
//   BILLING.SUBSCRIPTION.ACTIVATED
//   BILLING.SUBSCRIPTION.CANCELLED
//   BILLING.SUBSCRIPTION.SUSPENDED
//   BILLING.SUBSCRIPTION.EXPIRED
//   PAYMENT.SALE.COMPLETED

type WebhookEvent = {
  event_type: string;
  resource: {
    id?: string;
    custom_id?: string;
    status?: string;
    billing_info?: {
      next_billing_time?: string;
    };
  };
};

type SubscriptionMeta = {
  userId: string;
  tier: PlanTier;
  accountType: string;
  companyId?: string | null;
};

function parseMeta(customId: string | undefined): SubscriptionMeta | null {
  if (!customId) return null;
  try {
    return JSON.parse(customId);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // NOTE: In production, verify the webhook signature using
  // the PayPal Webhook ID (process.env.PAYPAL_WEBHOOK_ID).
  // For now, we process all events.

  try {
    const event = (await req.json()) as WebhookEvent;
    const { event_type, resource } = event;
    const meta = parseMeta(resource.custom_id);

    console.log(`[PayPal Webhook] ${event_type}`, resource.id);

    switch (event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        if (!meta) break;

        const plan = await db.plan.findUnique({
          where: { tier: meta.tier },
        });
        if (!plan) break;

        const subscriptionEndsAt = resource.billing_info?.next_billing_time
          ? new Date(resource.billing_info.next_billing_time)
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        if (meta.accountType === "COMPANY" && meta.companyId) {
          await db.company.update({
            where: { id: meta.companyId },
            data: {
              planId: plan.id,
              maxSeats: plan.maxSeats,
              paypalSubscriptionId: resource.id,
              subscriptionEndsAt,
            },
          });
        } else {
          await db.user.update({
            where: { id: meta.userId },
            data: {
              planId: plan.id,
              paypalSubscriptionId: resource.id,
              subscriptionEndsAt,
            },
          });
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        // Renewal payment — extend subscription
        if (!meta) break;

        const nextBilling = new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        );

        if (meta.accountType === "COMPANY" && meta.companyId) {
          await db.company.update({
            where: { id: meta.companyId },
            data: { subscriptionEndsAt: nextBilling },
          });
        } else {
          await db.user.update({
            where: { id: meta.userId },
            data: { subscriptionEndsAt: nextBilling },
          });
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        if (!meta) break;

        // Clear subscription ID but keep plan active until expiry
        if (meta.accountType === "COMPANY" && meta.companyId) {
          await db.company.update({
            where: { id: meta.companyId },
            data: { paypalSubscriptionId: null },
          });
        } else {
          await db.user.update({
            where: { id: meta.userId },
            data: { paypalSubscriptionId: null },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
