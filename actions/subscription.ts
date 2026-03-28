"use server";

import { revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPayPalClient, getPayPalCurrency } from "@/lib/paypal";
import {
  SubscriptionsController,
  IntervalUnit,
  TenureType,
  PlanRequestStatus,
  ApplicationContextUserAction,
  ExperienceContextShippingPreference,
} from "@paypal/paypal-server-sdk";
import type { PlanTier } from "@/lib/generated/prisma/client";

// ─── Ensure PayPal Catalog Product exists ────────────────

async function ensurePayPalProduct(): Promise<string> {
  // Check if we already have a product ID stored
  const cached = process.env.PAYPAL_PRODUCT_ID;
  if (cached) return cached;

  // Create one via PayPal REST API (Catalog Products API is not in the SDK)
  const { getPayPalAccessToken } = await import("@/lib/paypal");
  const token = await getPayPalAccessToken();
  const baseUrl =
    (process.env.PAYPAL_MODE ?? "sandbox") === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const res = await fetch(`${baseUrl}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "NEO ID Subscription",
      description: "NEO ID smart business card platform subscription",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create PayPal product: ${text}`);
  }

  const data = await res.json();
  const productId = data.id as string;

  // Cache this in .env as PAYPAL_PRODUCT_ID to avoid re-creating on each deploy
  return productId;
}

// ─── Ensure PayPal billing plan exists ──────────────────

async function ensurePayPalPlan(
  planTier: PlanTier,
): Promise<string> {
  const plan = await db.plan.findUnique({ where: { tier: planTier } });
  if (!plan) throw new Error(`Plan ${planTier} not found`);

  // Already synced
  if (plan.paypalPlanId) return plan.paypalPlanId;

  // Enterprise is custom — no self-serve subscription
  if (planTier === "ENTERPRISE") {
    throw new Error("Enterprise plans require contacting sales");
  }

  const productId = await ensurePayPalProduct();

  const client = getPayPalClient();
  const controller = new SubscriptionsController(client);
  const currency = getPayPalCurrency();
  const price = Number(plan.price);

  const response = await controller.createBillingPlan({
    prefer: "return=representation",
    body: {
      productId,
      name: `NEO ID ${plan.name}`,
      status: PlanRequestStatus.Active,
      description: `${plan.name} — yearly subscription`,
      billingCycles: [
        {
          frequency: {
            intervalUnit: IntervalUnit.Year,
            intervalCount: 1,
          },
          tenureType: TenureType.Regular,
          sequence: 1,
          totalCycles: 0, // infinite renewal
          pricingScheme: {
            fixedPrice: {
              currencyCode: currency,
              value: price.toFixed(2),
            },
          },
        },
      ],
      paymentPreferences: {
        autoBillOutstanding: true,
        paymentFailureThreshold: 3,
      },
      taxes: {
        percentage: "15",
        inclusive: false,
      },
    },
  });

  const paypalPlanId = response.result.id;
  if (!paypalPlanId) throw new Error("PayPal did not return a plan ID");

  // Store for reuse
  await db.plan.update({
    where: { tier: planTier },
    data: { paypalPlanId },
  });

  return paypalPlanId;
}

// ─── Create subscription ────────────────────────────────

export async function createSubscription(tierStr: string) {
  const user = await ensureUser();
  const tier = tierStr as PlanTier;

  // Validate tier
  if (!["PRO", "STARTUP", "BUSINESS"].includes(tier)) {
    return { error: "Invalid plan tier" };
  }

  // Individual users can only subscribe to PRO
  if (user.accountType === "INDIVIDUAL" && tier !== "PRO") {
    return { error: "Individual users can only upgrade to Pro" };
  }

  // Company subscriptions: only owners can change plans
  if (user.accountType === "COMPANY") {
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      return { error: "Only company owners and admins can manage subscriptions" };
    }
  }

  // Check if already on this plan
  if (user.accountType === "INDIVIDUAL" && user.planId) {
    const currentPlan = await db.plan.findUnique({ where: { id: user.planId } });
    if (currentPlan?.tier === tier) {
      return { error: "Already on this plan" };
    }
  }

  if (user.accountType === "COMPANY" && user.companyId) {
    const company = await db.company.findUnique({
      where: { id: user.companyId },
      include: { plan: true },
    });
    if (company?.plan?.tier === tier) {
      return { error: "Already on this plan" };
    }
  }

  try {
    const paypalPlanId = await ensurePayPalPlan(tier);

    const client = getPayPalClient();
    const controller = new SubscriptionsController(client);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const response = await controller.createSubscription({
      prefer: "return=representation",
      body: {
        planId: paypalPlanId,
        customId: JSON.stringify({
          userId: user.id,
          tier,
          accountType: user.accountType,
          companyId: user.companyId,
        }),
        subscriber: {
          emailAddress: user.email,
          name: {
            givenName: user.name.split(" ")[0],
            surname: user.name.split(" ").slice(1).join(" ") || undefined,
          },
        },
        applicationContext: {
          brandName: "NEO ID",
          userAction: ApplicationContextUserAction.SubscribeNow,
          shippingPreference: ExperienceContextShippingPreference.NoShipping,
          returnUrl: `${baseUrl}/settings?subscription=success&tier=${tier}`,
          cancelUrl: `${baseUrl}/settings?subscription=cancelled`,
        },
      },
    });

    const subscription = response.result;
    const approvalLink = subscription.links?.find(
      (l) => l.rel === "approve",
    );

    if (!approvalLink?.href) {
      return { error: "PayPal did not return an approval URL" };
    }

    return { approvalUrl: approvalLink.href };
  } catch (error) {
    console.error("Create subscription error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create subscription";
    return { error: message };
  }
}

// ─── Activate subscription (called after PayPal redirect) ─

export async function activateSubscription(
  tierStr: string,
  subscriptionId: string,
) {
  const user = await ensureUser();
  const tier = tierStr as PlanTier;

  const plan = await db.plan.findUnique({ where: { tier } });
  if (!plan) return { error: "Plan not found" };

  const client = getPayPalClient();
  const controller = new SubscriptionsController(client);

  // Fetch the specific subscription by ID
  const response = await controller.getSubscription({ id: subscriptionId });
  const sub = response.result;

  if (!sub.id) return { error: "Subscription not found" };

  // Verify this subscription belongs to this user
  try {
    const meta = JSON.parse(sub.customId ?? "{}");
    if (meta.userId !== user.id) {
      return { error: "Subscription does not belong to this user" };
    }
  } catch {
    return { error: "Invalid subscription metadata" };
  }

  // If subscription is APPROVED but not yet ACTIVE, activate it
  const status = (sub as unknown as { status?: string }).status;
  if (status === "APPROVED") {
    await controller.activateSubscription({
      id: sub.id,
      body: { reason: "User completed approval flow" },
    });
  }

  // Calculate subscription end date (1 year from now)
  const subscriptionEndsAt = new Date();
  subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);

  // Update database
  if (user.accountType === "COMPANY" && user.companyId) {
    await db.company.update({
      where: { id: user.companyId },
      data: {
        planId: plan.id,
        maxSeats: plan.maxSeats,
        paypalSubscriptionId: sub.id,
        subscriptionEndsAt,
      },
    });
  } else {
    await db.user.update({
      where: { id: user.id },
      data: {
        planId: plan.id,
        paypalSubscriptionId: sub.id,
        subscriptionEndsAt,
      },
    });
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/profiles");

  return { success: true };
}

// ─── Cancel subscription ────────────────────────────────

export async function cancelSubscription() {
  const user = await ensureUser();

  let subscriptionId: string | null = null;

  if (user.accountType === "COMPANY" && user.companyId) {
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      return { error: "Only owners and admins can cancel subscriptions" };
    }
    const company = await db.company.findUnique({
      where: { id: user.companyId },
    });
    subscriptionId = company?.paypalSubscriptionId ?? null;
  } else {
    subscriptionId = user.paypalSubscriptionId ?? null;
  }

  if (!subscriptionId) {
    return { error: "No active subscription" };
  }

  try {
    const client = getPayPalClient();
    const controller = new SubscriptionsController(client);

    await controller.cancelSubscription({
      id: subscriptionId,
      body: { reason: "User requested cancellation" },
    });

    // Clear subscription from DB (keep plan active until period ends)
    if (user.accountType === "COMPANY" && user.companyId) {
      await db.company.update({
        where: { id: user.companyId },
        data: { paypalSubscriptionId: null },
      });
    } else {
      await db.user.update({
        where: { id: user.id },
        data: { paypalSubscriptionId: null },
      });
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return { error: "Failed to cancel subscription" };
  }
}
