import { db } from "@/lib/db";
import { requireOnboarded } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { TemplateCard } from "@/components/templates/template-card";
import { MaterialCard } from "@/components/templates/material-card";
import { Separator } from "@/components/ui/separator";
import { Paintbrush } from "lucide-react";

export default async function TemplatesPage() {
  await requireOnboarded();

  const [templates, materials] = await Promise.all([
    db.template.findMany({
      where: { companyId: null },
      orderBy: { createdAt: "asc" },
      include: {
        variants: {
          include: { material: { select: { id: true } } },
        },
        _count: { select: { profiles: true } },
      },
    }),
    db.cardMaterial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Templates & Materials"
        description="Choose a card design and material for your NEO ID"
      />

      {/* Materials Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Card Materials</h2>
          <p className="text-sm text-muted-foreground">
            Select the physical material for your NFC business card
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <MaterialCard
              key={material.id}
              name={material.name}
              slug={material.slug}
              description={material.description}
              tier={material.tier}
              frontSvg={material.frontSvg}
              unitPrice={Number(material.unitPrice)}
            />
          ))}
        </div>
      </section>

      <Separator />

      {/* Templates Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Paintbrush className="size-5 text-neo-teal" />
            Card Templates
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick a design template — each adapts to every material
          </p>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <Paintbrush className="size-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No templates available yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                name={template.name}
                slug={template.slug}
                thumbnail={template.thumbnail}
                tier={template.tier}
                price={template.price ? Number(template.price) : null}
                materialsCount={template.variants.length}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
