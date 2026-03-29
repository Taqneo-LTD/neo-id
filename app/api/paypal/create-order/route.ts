import { NextResponse } from "next/server";
import { ensureUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPayPalClient, getPayPalCurrency } from "@/lib/paypal";
import { calculateOrderTotal } from "@/lib/order-helpers";
import { orderInputSchema } from "@/lib/validators/order";
import { OrdersController, CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";

export async function POST(req: Request) {
  try {
    const user = await ensureUser();
    const body = await req.json();
    const input = orderInputSchema.parse(body);

    // Verify profile belongs to user
    const profile = await db.profile.findFirst({
      where: { id: input.profileId, userId: user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Determine company context
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

    // Calculate total server-side (never trust client)
    const totals = await calculateOrderTotal(
      input,
      isCompany,
      includesPlastic,
      isAdmin,
    );

    // Shared order data factory (metadata requires prisma generate after schema change)
    const orderData = (status: "PENDING" | "PAID", amount: number) =>
      ({
        userId: user.id,
        totalAmount: amount,
        shippingAddr: input.shipping,
        status,
        metadata: input,
      }) as Parameters<typeof db.order.create>[0]["data"];

    // Free order — skip PayPal, create PAID order + cards immediately
    if (totals.total === 0) {
      const { createOrderCards } = await import("@/lib/order-helpers");
      const order = await db.$transaction(async (tx) => {
        const ord = await tx.order.create({ data: orderData("PAID", 0) });
        await createOrderCards(
          tx,
          ord.id,
          user.id,
          input,
          isCompany,
          isAdmin,
          includesPlastic,
          user.companyId,
        );
        return ord;
      });

      return NextResponse.json({
        paypalOrderId: null,
        dbOrderId: order.id,
        free: true,
      });
    }

    // Create PENDING order in DB
    const order = await db.order.create({
      data: orderData("PENDING", totals.total),
    });

    // Create PayPal order
    const client = getPayPalClient();
    const ordersController = new OrdersController(client);

    const paypalResponse = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: getPayPalCurrency(),
              value: totals.total.toFixed(2),
            },
            referenceId: order.id,
          },
        ],
      },
    });

    const paypalOrderId = paypalResponse.result.id;

    // Link PayPal order ID to DB order
    await db.order.update({
      where: { id: order.id },
      data: { paymentId: paypalOrderId },
    });

    return NextResponse.json({
      paypalOrderId,
      dbOrderId: order.id,
      free: false,
    });
  } catch (error: unknown) {
    console.error("PayPal create-order error:", error);
    let message = "Failed to create order";
    if (error instanceof Error) {
      message = error.message;
    }
    // PayPal SDK errors have details in the body property
    const body = (error as { body?: string })?.body;
    if (body) {
      try {
        const parsed = JSON.parse(body);
        message = parsed.message || parsed.error_description || message;
        console.error("PayPal error details:", parsed);
      } catch {
        message = body;
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
