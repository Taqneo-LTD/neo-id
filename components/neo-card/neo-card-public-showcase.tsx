"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Tilt } from "@/components/ui/tilt";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/templates/tier-badge";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TemplateTier } from "@/lib/generated/prisma/client";

const EASE = [0.23, 1, 0.32, 1] as const;

type Material = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tier: number;
  frontSvg: string;
  backSvg: string;
  unitPrice: number;
};

type Template = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  tier: TemplateTier;
  price: number | null;
  variants: {
    id: string;
    materialId: string;
    frontSvg: string;
    backSvg: string;
  }[];
};

const MATERIAL_TIERS: Record<number, { label: string; className: string }> = {
  0: { label: "Standard", className: "" },
  1: {
    label: "Premium",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  2: {
    label: "Luxury",
    className:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  },
};

export function NeoCardPublicShowcase({
  materials,
  templates,
}: {
  materials: Material[];
  templates: Template[];
}) {
  const [activeMaterialId, setActiveMaterialId] = useState(materials[0]?.id);
  const [activeTemplateId, setActiveTemplateId] = useState(templates[0]?.id);
  const [flipped, setFlipped] = useState(false);

  const activeMaterial = materials.find((m) => m.id === activeMaterialId);
  const activeTemplate = templates.find((t) => t.id === activeTemplateId);

  const activeVariant =
    activeTemplate?.variants.find((v) => v.materialId === activeMaterialId) ??
    activeTemplate?.variants[0];

  return (
    <main className="relative min-h-screen overflow-hidden pt-28 pb-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 top-20 size-[600px] rounded-full bg-neo-lime-light/[0.03] blur-[120px]" />
        <div className="absolute -right-32 top-40 size-[500px] rounded-full bg-neo-teal/[0.04] blur-[100px]" />
        <div className="absolute bottom-20 left-1/3 size-[400px] rounded-full bg-neo-blue-bright/[0.03] blur-[100px]" />
        <Image
          src="/brandings/brand-element.svg"
          alt=""
          width={400}
          height={400}
          className="absolute -right-10 top-32 size-72 rotate-12 opacity-[0.03] lg:size-96"
        />
        <Image
          src="/brandings/brand-element.svg"
          alt=""
          width={400}
          height={400}
          className="absolute -left-16 bottom-24 size-64 -rotate-[20deg] -scale-x-100 opacity-[0.03] lg:size-80"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            className="mx-auto h-px bg-gradient-to-r from-neo-teal to-neo-blue"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 48, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          />
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Our{" "}
            <span
              className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Collection
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            Premium materials and professionally designed templates. Explore every card we craft.
          </p>

          <div className="mt-6">
            <Button size="lg" className="px-6" asChild>
              <Link href="/sign-up">
                Order Your Card
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </motion.div>

        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold tracking-tight">
              Premium Materials
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Crafted with care. Choose the finish that represents you
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {materials.map((mat, i) => (
              <MaterialShowcaseCard
                key={mat.id}
                material={mat}
                index={i}
                isActive={activeMaterialId === mat.id}
                onSelect={() => {
                  setActiveMaterialId(mat.id);
                  setFlipped(false);
                }}
              />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold tracking-tight">
              Card Designs
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every design adapts to every material. See your card come to life
            </p>
          </div>

          {activeVariant && (
            <div className="mx-auto w-full max-w-lg">
              <Tilt
                rotationFactor={10}
                springOptions={{ stiffness: 180, damping: 20 }}
                className="relative w-full cursor-pointer"
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative w-full"
                  onClick={() => setFlipped((f) => !f)}
                >
                  <div className="[backface-visibility:hidden]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeVariant.frontSvg}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={activeVariant.frontSvg}
                          alt="Card front"
                          width={1025}
                          height={593}
                          className="block h-auto w-full"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div
                    className="absolute inset-0 [backface-visibility:hidden]"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <Image
                      src={activeVariant.backSvg}
                      alt="Card back"
                      width={1025}
                      height={593}
                      className="block h-auto w-full"
                    />
                  </div>
                </motion.div>
              </Tilt>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {activeTemplate?.name}
                  </span>
                  {activeTemplate && (
                    <TierBadge tier={activeTemplate.tier} className="text-[10px]" />
                  )}
                  <span className="text-xs text-muted-foreground">on</span>
                  <span className="text-sm font-medium">
                    {activeMaterial?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFlipped((f) => !f)}
                  className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {flipped ? "View front" : "View back"}
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2">
            {materials.map((mat) => (
              <button
                key={mat.id}
                type="button"
                onClick={() => {
                  setActiveMaterialId(mat.id);
                  setFlipped(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  activeMaterialId === mat.id
                    ? "border-neo-teal/50 bg-neo-teal/10 text-neo-teal"
                    : "border-border text-muted-foreground hover:border-neo-teal/30 hover:text-foreground",
                )}
              >
                <div className="relative size-4 overflow-hidden rounded-sm">
                  <Image
                    src={mat.frontSvg}
                    alt={mat.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {mat.name}
              </button>
            ))}
          </div>

          {templates.length > 1 && (
            <div className="space-y-3">
              <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Available Designs
              </p>
              <div className="flex justify-center gap-3">
                {templates.map((tmpl) => {
                  const isActive = activeTemplateId === tmpl.id;
                  const variant =
                    tmpl.variants.find(
                      (v) => v.materialId === activeMaterialId,
                    ) ?? tmpl.variants[0];

                  return (
                    <motion.button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        setActiveTemplateId(tmpl.id);
                        setFlipped(false);
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "relative flex w-36 flex-col items-center gap-2 rounded-xl p-2 transition-colors",
                        isActive ? "bg-neo-teal/5" : "hover:bg-muted/50",
                      )}
                    >
                      <div
                        className={cn(
                          "relative w-full overflow-hidden rounded-lg transition-shadow",
                          isActive && "shadow-sm",
                        )}
                      >
                        <Image
                          src={variant?.frontSvg ?? tmpl.thumbnail}
                          alt={tmpl.name}
                          width={1025}
                          height={593}
                          className="block h-auto w-full"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isActive ? "text-neo-teal" : "text-muted-foreground",
                          )}
                        >
                          {tmpl.name}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="text-sm text-muted-foreground">
            Ready to make it yours?
          </p>
          <div className="mt-4">
            <Button size="lg" className="px-6" asChild>
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function MaterialShowcaseCard({
  material,
  index,
  isActive,
  onSelect,
}: {
  material: Material;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const tierInfo = MATERIAL_TIERS[material.tier] ?? MATERIAL_TIERS[0];

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (isActive) {
          setFlipped((f) => !f);
        } else {
          onSelect();
          setFlipped(false);
        }
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: EASE,
      }}
      className="group flex w-full flex-col items-center gap-4 text-center outline-none"
    >
      <Tilt
        rotationFactor={14}
        springOptions={{ stiffness: 200, damping: 18 }}
        className={cn(
          "relative w-full cursor-pointer transition-shadow duration-300",
          isActive
            ? "shadow-[0_8px_40px_-8px_rgba(139,223,215,0.35)]"
            : "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12)]",
        )}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full"
        >
          <div className="[backface-visibility:hidden]">
            <Image
              src={material.frontSvg}
              alt={`${material.name} front`}
              width={1025}
              height={593}
              className="block h-auto w-full"
            />
          </div>
          <div
            className="absolute inset-0 [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <Image
              src={material.backSvg}
              alt={`${material.name} back`}
              width={1025}
              height={593}
              className="block h-auto w-full"
            />
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0 rounded-lg"
          animate={{
            opacity: isActive ? 1 : 0,
            boxShadow: isActive
              ? "inset 0 0 0 2px var(--color-neo-teal)"
              : "inset 0 0 0 0px transparent",
          }}
          transition={{ duration: 0.3 }}
        />
      </Tilt>

      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <h3
            className={cn(
              "text-sm font-semibold tracking-tight transition-colors",
              isActive ? "text-neo-teal" : "text-foreground",
            )}
          >
            {material.name}
          </h3>
          {material.tier > 0 && (
            <Badge
              variant="outline"
              className={cn("text-[10px]", tierInfo.className)}
            >
              {tierInfo.label}
            </Badge>
          )}
        </div>

        {material.description && (
          <p className="mx-auto max-w-[200px] text-[11px] leading-relaxed text-muted-foreground">
            {material.description}
          </p>
        )}

        <div className="pt-1">
          <span className="text-base font-bold tabular-nums">
            {material.unitPrice}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">SAR</span>
        </div>

        {isActive && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-muted-foreground"
          >
            Click to {flipped ? "see front" : "see back"}
          </motion.p>
        )}
      </div>
    </motion.button>
  );
}
