import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPayPalClient } from "@/lib/paypal";
import { createOrderCards } from "@/lib/order-helpers";
import { captureOrderSchema } from "@/lib/validators/order";
import type { OrderInput } from "@/lib/order-helpers";
import { OrdersController } from "@paypal/paypal-server-sdk";

export async function POST(req: Request) {
  try {
    const user = await ensureUser();
    const body = await req.json();
    const { paypalOrderId, dbOrderId } = captureOrderSchema.parse(body);

    // Verify DB order
    const order = await db.order.findUnique({
      where: { id: dbOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (order.paymentId !== paypalOrderId) {
      return NextResponse.json(
        { error: "Payment ID mismatch" },
        { status: 400 },
      );
    }

    // Idempotency: already paid
    if (order.status === "PAID") {
      return NextResponse.json({ success: true });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Order is not in PENDING state" },
        { status: 400 },
      );
    }

    // Capture payment via PayPal
    const client = getPayPalClient();
    const ordersController = new OrdersController(client);

    const captureResponse = await ordersController.captureOrder({
      id: paypalOrderId,
    });

    const captureResult = captureResponse.result;

    if (captureResult.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${captureResult.status}` },
        { status: 400 },
      );
    }

    // Verify captured amount matches
    const capturedAmount =
      captureResult.purchaseUnits?.[0]?.payments?.captures?.[0]?.amount;
    if (capturedAmount) {
      const capturedValue = parseFloat(capturedAmount.value ?? "0");
      const expectedValue = Number(order.totalAmount);
      if (Math.abs(capturedValue - expectedValue) > 0.01) {
        console.error(
          `Amount mismatch: captured ${capturedValue}, expected ${expectedValue}`,
        );
        return NextResponse.json(
          { error: "Payment amount mismatch" },
          { status: 400 },
        );
      }
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

    // Read wizard input from metadata (field added via schema, requires prisma generate)
    const input = (order as unknown as { metadata: unknown }).metadata as OrderInput;
    if (!input || !input.profileId) {
      return NextResponse.json(
        { error: "Order metadata missing" },
        { status: 500 },
      );
    }

    // Transaction: mark PAID + create cards
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: dbOrderId },
        data: { status: "PAID" },
      });

      await createOrderCards(
        tx,
        dbOrderId,
        user.id,
        input,
        isCompany,
        isAdmin,
        includesPlastic,
        user.companyId,
      );
    });

    revalidatePath(`/profiles/${input.profileId}`);
    revalidatePath("/orders");
    if (isCompany) revalidatePath("/company");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PayPal capture-order error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to capture payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
