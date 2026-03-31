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

  // Build a lookup of material IDs to names/SVGs for intended cards
  const allMaterialIds = new Set<string>();
  const allProfileIds = new Set<string>();

  for (const o of dbOrders) {
    if (o.status === "PENDING_CONTACT" && o.cards.length === 0 && o.metadata) {
      const meta = o.metadata as Record<string, unknown>;
      if (meta.materialId) allMaterialIds.add(meta.materialId as string);
      if (meta.profileId) allProfileIds.add(meta.profileId as string);
    }
  }

  const [materialsMap, profilesMap] = await Promise.all([
    allMaterialIds.size > 0
      ? db.cardMaterial
          .findMany({
            where: { id: { in: [...allMaterialIds] } },
            select: { id: true, name: true, frontSvg: true },
          })
          .then((ms) => new Map(ms.map((m) => [m.id, m])))
      : Promise.resolve(new Map<string, { id: string; name: string; frontSvg: string }>()),
    allProfileIds.size > 0
      ? db.profile
          .findMany({
            where: { id: { in: [...allProfileIds] } },
            select: { id: true, name: true, slug: true },
          })
          .then((ps) => new Map(ps.map((p) => [p.id, p])))
      : Promise.resolve(new Map<string, { id: string; name: string | null; slug: string }>()),
  ]);

  // Serialize for client component
  const orders: OrderItem[] = dbOrders.map((o) => {
    // Build intended cards from metadata for PENDING_CONTACT orders
    let intendedCards: OrderItem["intendedCards"];
    if (o.status === "PENDING_CONTACT" && o.cards.length === 0 && o.metadata) {
      const meta = o.metadata as Record<string, unknown>;
      const mat = materialsMap.get(meta.materialId as string);
      const prof = profilesMap.get(meta.profileId as string);
      if (mat && prof) {
        intendedCards = [
          {
            materialName: mat.name,
            materialFrontSvg: mat.frontSvg,
            profileName: prof.name,
            profileSlug: prof.slug,
          },
        ];
      }
    }

    return {
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
      intendedCards,
    };
  });

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
