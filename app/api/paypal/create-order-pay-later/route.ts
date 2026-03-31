import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateOrderTotal } from "@/lib/order-helpers";
import { orderInputSchema } from "@/lib/validators/order";

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

    // Calculate total server-side
    const totals = await calculateOrderTotal(
      input,
      isCompany,
      includesPlastic,
      isAdmin,
    );

    // Create order with PENDING_CONTACT status (no PayPal, no card creation)
    const order = await db.order.create({
      data: {
        userId: user.id,
        totalAmount: totals.total,
        shippingAddr: input.shipping,
        status: "PENDING_CONTACT",
        metadata: input,
      },
    });

    revalidatePath("/orders");

    return NextResponse.json({
      dbOrderId: order.id,
      total: totals.total,
    });
  } catch (error: unknown) {
    console.error("Pay-later order error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
