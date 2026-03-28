import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth";
import { db } from "@/lib/db";
import { CardOrderWizard } from "@/components/order/card-order-wizard";
import { getPayPalClientId, getPayPalCurrency } from "@/lib/paypal";

export default async function OrderCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOnboarded();

  // Verify profile ownership (own profile or OWNER/ADMIN accessing company profile)
  let profile = await db.profile.findFirst({
    where: { id, userId: user.id },
    select: { id: true, name: true, slug: true, title: true },
  });

  if (
    !profile &&
    (user.role === "OWNER" || user.role === "ADMIN") &&
    user.companyId
  ) {
    profile = await db.profile.findFirst({
      where: { id, user: { companyId: user.companyId } },
      select: { id: true, name: true, slug: true, title: true },
    });
  }

  if (!profile) notFound();

  // Fetch materials and templates in parallel
  const [materials, templates] = await Promise.all([
    db.cardMaterial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
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
        },
      },
    }),
  ]);

  // Determine company pricing benefits and seat info
  const isCompany = user.accountType === "COMPANY" && !!user.companyId;
  let companyPlanIncludesPlastic = false;
  let companyMaxSeats = 0;
  let companyEmployeeCount = 0;

  if (isCompany && user.companyId) {
    const [company, employeeCount] = await Promise.all([
      db.company.findUnique({
        where: { id: user.companyId },
        include: { plan: { select: { includesPlasticCard: true } } },
      }),
      db.user.count({ where: { companyId: user.companyId } }),
    ]);
    companyPlanIncludesPlastic = company?.plan?.includesPlasticCard ?? false;
    companyMaxSeats = company?.maxSeats ?? 0;
    companyEmployeeCount = employeeCount;
  }

  // Fetch all company team members for admin/owner
  let teamMembers: {
    userId: string;
    userName: string;
    userAvatarUrl: string | null;
    profileId: string | null;
    profileName: string | null;
    profileSlug: string | null;
    hasExistingCard: boolean;
    request: {
      id: string;
      materialName: string;
      materialSlug: string;
      materialUnitPrice: number;
      templateName: string;
      templateTier: (typeof templates)[0]["tier"];
      templatePrice: number | null;
      variantFrontSvg: string;
      variantBackSvg: string;
    } | null;
  }[] = [];

  if (
    isCompany &&
    user.companyId &&
    (user.role === "OWNER" || user.role === "ADMIN")
  ) {
    const employees = await db.user.findMany({
      where: {
        companyId: user.companyId,
        id: { not: user.id }, // exclude admin ordering
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        profiles: {
          where: { isPlaceholder: false },
          take: 1,
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            title: true,
            cards: { select: { id: true }, take: 1 },
            cardRequest: {
              select: {
                id: true,
                status: true,
                material: { select: { name: true, slug: true, unitPrice: true } },
                template: { select: { name: true, tier: true, price: true } },
                variant: { select: { frontSvg: true, backSvg: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    teamMembers = employees.map((emp) => {
      const profile = emp.profiles[0] ?? null;
      const req = profile?.cardRequest;
      const hasPendingRequest = req?.status === "PENDING";
      return {
        userId: emp.id,
        userName: emp.name,
        userAvatarUrl: emp.avatarUrl,
        profileId: profile?.id ?? null,
        profileName: profile?.name ?? profile?.title ?? null,
        profileSlug: profile?.slug ?? null,
        hasExistingCard: (profile?.cards.length ?? 0) > 0,
        request: hasPendingRequest && req
          ? {
              id: req.id,
              materialName: req.material.name,
              materialSlug: req.material.slug,
              materialUnitPrice: Number(req.material.unitPrice),
              templateName: req.template.name,
              templateTier: req.template.tier,
              templatePrice: req.template.price ? Number(req.template.price) : null,
              variantFrontSvg: req.variant.frontSvg,
              variantBackSvg: req.variant.backSvg,
            }
          : null,
      };
    });
  }

  // Serialize Decimal fields for client component
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

  const paypalClientId = getPayPalClientId();
  const paypalCurrency = getPayPalCurrency();

  return (
    <CardOrderWizard
      profileId={profile.id}
      profileName={profile.name ?? profile.title ?? profile.slug}
      materials={serializedMaterials}
      templates={serializedTemplates}
      isCompany={isCompany}
      companyPlanIncludesPlastic={companyPlanIncludesPlastic}
      userRole={user.role}
      teamMembers={teamMembers}
      companyMaxSeats={companyMaxSeats}
      companyEmployeeCount={companyEmployeeCount}
      paypalClientId={paypalClientId}
      paypalCurrency={paypalCurrency}
    />
  );
}
