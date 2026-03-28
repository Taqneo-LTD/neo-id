import { db } from "@/lib/db";
import { requireOnboarded } from "@/lib/auth";
import { checkProfileLimit } from "@/lib/plan-limits";
import { NeoCardShowcase } from "@/components/neo-card/neo-card-showcase";

export default async function NeoCardPage() {
  const user = await requireOnboarded();

  const isCompany = user.accountType === "COMPANY";
  const isOwnerOrAdmin = user.role === "OWNER" || user.role === "ADMIN";

  // Determine which profiles to show for the "Order for" section:
  // - Employees: only their own profiles without an attached card
  // - Owners/Admins: all company member profiles without an attached card
  // - Individuals: their own profiles without an attached card
  const profileWhere =
    isCompany && isOwnerOrAdmin && user.companyId
      ? { user: { companyId: user.companyId }, isPlaceholder: false }
      : { userId: user.id, isPlaceholder: false };

  const [templates, materials, allProfiles, profileLimit] = await Promise.all([
    db.template.findMany({
      where: { companyId: null },
      orderBy: { createdAt: "asc" },
      include: {
        variants: {
          select: {
            id: true,
            materialId: true,
            frontSvg: true,
            backSvg: true,
          },
          orderBy: { material: { sortOrder: "asc" } },
        },
      },
    }),
    db.cardMaterial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.profile.findMany({
      where: profileWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        avatarUrl: true,
        cards: { select: { id: true }, take: 1 },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    checkProfileLimit(user.id),
  ]);

  // Only show profiles that don't already have an attached card
  const orderableProfiles = allProfiles
    .filter((p) => p.cards.length === 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      avatarUrl: p.avatarUrl,
      ownerName: isCompany && isOwnerOrAdmin ? p.user.name : undefined,
    }));

  const allCovered = allProfiles.length > 0 && orderableProfiles.length === 0;

  // How many more NEO IDs can be created (0 = unlimited has no cap)
  const availableSlots = profileLimit.limit === 0
    ? -1 // unlimited
    : Math.max(0, profileLimit.limit - profileLimit.current);

  const serializedMaterials = materials.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    description: m.description,
    tier: m.tier,
    frontSvg: m.frontSvg,
    backSvg: m.backSvg,
    unitPrice: Number(m.unitPrice),
  }));

  const serializedTemplates = templates.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    thumbnail: t.thumbnail,
    tier: t.tier,
    price: t.price ? Number(t.price) : null,
    variants: t.variants,
  }));

  const userContext = {
    accountType: user.accountType as "INDIVIDUAL" | "COMPANY",
    role: user.role as "OWNER" | "ADMIN" | "MEMBER",
  };

  return (
    <NeoCardShowcase
      materials={serializedMaterials}
      templates={serializedTemplates}
      profiles={orderableProfiles}
      allCovered={allCovered}
      availableSlots={availableSlots}
      userContext={userContext}
    />
  );
}
