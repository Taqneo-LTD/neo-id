import type { Metadata } from "next";
import { db } from "@/lib/db";
import { NeoCardPublicShowcase } from "@/components/neo-card/neo-card-public-showcase";
export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore our premium NFC card collection. Classic PVC, Artisan wood, and Prestige metal. Every card ships with NFC and QR code.",
};

export default async function CollectionsPage() {
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
          orderBy: { material: { sortOrder: "asc" } },
        },
      },
    }),
  ]);

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

  return (
    <>
      <NeoCardPublicShowcase
        materials={serializedMaterials}
        templates={serializedTemplates}
      />
    </>
  );
}
