import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client.js";

const prisma = new PrismaClient();

// ─── Constants ──────────────────────────────────────────

const ADMIN_EMAIL = "taqneo101@gmail.com";

// ─── Plans ──────────────────────────────────────────────

// All prices are yearly. No monthly billing.
// All prices yearly in SAR. No monthly billing. Seats = NEO IDs.
const plans = [
  {
    tier: "STARTUP" as const,
    name: "Startup",
    price: 348, // SAR/year
    maxSeats: 5,
    maxProfilesPerSeat: 1, // 1 seat = 1 NEO ID
    includesPlasticCard: true,
    features: {
      templates: "all",
      analytics: "basic",
      branding: "basic",
      support: "email",
    },
  },
  {
    tier: "BUSINESS" as const,
    name: "Business",
    price: 948, // SAR/year
    maxSeats: 25,
    maxProfilesPerSeat: 1, // 1 seat = 1 NEO ID
    includesPlasticCard: true,
    features: {
      templates: "all",
      analytics: "advanced",
      branding: "full",
      bulkOrdering: true,
      support: "priority",
    },
  },
  {
    tier: "ENTERPRISE" as const,
    name: "Enterprise",
    price: 0, // Custom quotation — negotiated per deal
    maxSeats: 100, // Default; actual count negotiated
    maxProfilesPerSeat: 1, // 1 seat = 1 NEO ID
    includesPlasticCard: true,
    features: {
      templates: "all",
      analytics: "full",
      branding: "full",
      bulkOrdering: true,
      customDesign: true,
      dedicatedManager: true,
      apiAccess: true,
      support: "phone",
    },
  },
  {
    tier: "PRO" as const,
    name: "Pro (Individual)",
    price: 29, // SAR/year
    maxSeats: 1,
    maxProfilesPerSeat: 0, // 0 = unlimited NEO IDs
    includesPlasticCard: false,
    features: {
      templates: "all",
      analytics: "advanced",
      support: "priority",
    },
  },
];

// ─── Card Materials ─────────────────────────────────────

const materials = [
  {
    name: "Classic",
    slug: "classic",
    description: "Full color PVC card with matte/gloss finish",
    tier: 0,
    frontSvg: "/neo-cards/materials-base/classic/front.svg",
    backSvg: "/neo-cards/materials-base/classic/back.svg",
    unitPrice: 45,
    bulkPrice50: 35,
    bulkPrice100: 28,
    sortOrder: 0,
  },
  {
    name: "Artisan",
    slug: "artisan",
    description: "Laser engraved bamboo wood card with UV print and natural finish",
    tier: 1,
    frontSvg: "/neo-cards/materials-base/artisan/front.svg",
    backSvg: "/neo-cards/materials-base/artisan/back.svg",
    unitPrice: 95,
    bulkPrice50: 80,
    bulkPrice100: 70,
    sortOrder: 1,
  },
  {
    name: "Prestige",
    slug: "prestige",
    description: "Laser etched stainless steel card with brushed/matte black finish",
    tier: 2,
    frontSvg: "/neo-cards/materials-base/prestige/front.svg",
    backSvg: "/neo-cards/materials-base/prestige/back.svg",
    unitPrice: 175,
    bulkPrice50: 150,
    bulkPrice100: 130,
    sortOrder: 2,
  },
];

// ─── Main Seed ──────────────────────────────────────────

async function main() {
  // 1. Seed plans
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }
  console.log(`Seeded ${plans.length} plans`);

  // 2. Seed card materials
  for (const mat of materials) {
    await prisma.cardMaterial.upsert({
      where: { slug: mat.slug },
      update: mat,
      create: mat,
    });
  }
  console.log(`Seeded ${materials.length} card materials`);

  // 3. Seed the base template ("Prime")
  const prime = await prisma.template.upsert({
    where: { slug: "prime" },
    update: {
      name: "Prime",
      thumbnail: "/neo-cards/designs-base/prestige/prime/front.svg",
      designData: { layout: "neo-default" },
      tier: "FREE",
    },
    create: {
      name: "Prime",
      slug: "prime",
      thumbnail: "/neo-cards/designs-base/prestige/prime/front.svg",
      designData: { layout: "neo-default" },
      tier: "FREE",
    },
  });
  console.log(`Seeded template: ${prime.name}`);

  // 4. Seed template variants (one per material)
  // Convention: /neo-cards/designs-base/{material-slug}/{template-slug}/front.svg
  const allMaterials = await prisma.cardMaterial.findMany();
  for (const mat of allMaterials) {
    await prisma.templateVariant.upsert({
      where: {
        templateId_materialId: {
          templateId: prime.id,
          materialId: mat.id,
        },
      },
      update: {
        frontSvg: `/neo-cards/designs-base/${mat.slug}/prime/front.svg`,
        backSvg: `/neo-cards/designs-base/${mat.slug}/prime/back.svg`,
      },
      create: {
        templateId: prime.id,
        materialId: mat.id,
        frontSvg: `/neo-cards/designs-base/${mat.slug}/prime/front.svg`,
        backSvg: `/neo-cards/designs-base/${mat.slug}/prime/back.svg`,
      },
    });
  }
  console.log(`Seeded ${allMaterials.length} template variants for ${prime.name}`);

  // 5. Mark admin user (if already exists from auth flow)
  const adminUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });
  if (adminUser) {
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: "OWNER" },
    });
    console.log(`Marked ${ADMIN_EMAIL} as OWNER`);
  } else {
    console.log(`Admin user (${ADMIN_EMAIL}) not found yet — will be assigned on first login`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
