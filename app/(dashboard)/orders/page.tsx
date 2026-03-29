import { redirect } from "next/navigation";
import { requireOnboarded } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import {
  OrdersPageClient,
  type OrderItem,
} from "@/components/order/orders-page-client";

export default async function OrdersPage() {
  const user = await requireOnboarded();

  // Company employees cannot access orders — they request cards instead
  const isCompanyEmployee =
    user.accountType === "COMPANY" &&
    user.role !== "OWNER" &&
    user.role !== "ADMIN";

  if (isCompanyEmployee) {
    redirect("/dashboard");
  }

  const isCompanyAdmin =
    user.accountType === "COMPANY" &&
    (user.role === "OWNER" || user.role === "ADMIN");

  // Fetch orders — company admins see all company member orders too
  const whereClause = isCompanyAdmin
    ? {
        OR: [
          { userId: user.id },
          ...(user.companyId
            ? [{ user: { companyId: user.companyId } }]
            : []),
        ],
      }
    : { userId: user.id };

  const dbOrders = await db.order.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, email: true, avatarUrl: true } },
      cards: {
        include: {
          material: { select: { name: true, slug: true, frontSvg: true } },
          profile: { select: { name: true, slug: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute stats
  const allCards = dbOrders.flatMap((o) => o.cards);
  const stats = {
    totalOrders: dbOrders.length,
    activeCards: allCards.filter((c) => c.status === "ACTIVE").length,
    inTransit: allCards.filter(
      (c) => c.status === "SHIPPED" || c.status === "PRINTING",
    ).length,
  };

  // Serialize for client component
  const orders: OrderItem[] = dbOrders.map((o) => ({
    id: o.id,
    totalAmount: Number(o.totalAmount),
    currency: o.currency,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    trackingNo: o.trackingNo,
    paymentId: o.paymentId,
    shippingAddr: o.shippingAddr as OrderItem["shippingAddr"],
    orderedBy: {
      name: o.user.name,
      email: o.user.email,
      avatarUrl: o.user.avatarUrl,
      isSelf: o.userId === user.id,
    },
    cards: o.cards.map((c) => ({
      id: c.id,
      cardType: c.cardType,
      status: c.status,
      nfcId: c.nfcId,
      materialName: c.material?.name ?? "Standard",
      materialSlug: c.material?.slug ?? "classic",
      materialFrontSvg: c.material?.frontSvg ?? "/neo-cards/materials-base/classic/front.svg",
      profileName: c.profile.name,
      profileSlug: c.profile.slug,
      profileAvatarUrl: c.profile.avatarUrl,
      createdAt: c.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track your NFC card orders"
      />
      <OrdersPageClient
        orders={orders}
        stats={stats}
        isCompanyAdmin={isCompanyAdmin}
      />
    </div>
  );
}
