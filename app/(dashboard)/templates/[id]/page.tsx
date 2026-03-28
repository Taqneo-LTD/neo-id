import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireOnboarded } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { TierBadge } from "@/components/templates/tier-badge";
import { TemplateVariantViewer } from "@/components/templates/template-variant-viewer";
import { ArrowLeft } from "lucide-react";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOnboarded();
  const { id } = await params;

  const template = await db.template.findUnique({
    where: { id },
    include: {
      variants: {
        include: {
          material: true,
        },
        orderBy: { material: { sortOrder: "asc" } },
      },
    },
  });

  if (!template) notFound();

  // Serialize Decimal fields for client component
  const variants = template.variants.map((v) => ({
    id: v.id,
    frontSvg: v.frontSvg,
    backSvg: v.backSvg,
    material: {
      id: v.material.id,
      name: v.material.name,
      slug: v.material.slug,
      description: v.material.description,
      tier: v.material.tier,
      unitPrice: Number(v.material.unitPrice),
    },
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link
          href="/neo-card"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to NEO Card
        </Link>
        <PageHeader title={template.name}>
          <TierBadge tier={template.tier} />
        </PageHeader>
      </div>

      <TemplateVariantViewer
        templateName={template.name}
        variants={variants}
        price={template.price ? Number(template.price) : null}
        tier={template.tier}
      />
    </div>
  );
}
