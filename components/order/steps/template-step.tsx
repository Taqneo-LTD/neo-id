"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Tilt } from "@/components/ui/tilt";
import { TierBadge } from "@/components/templates/tier-badge";
import { Check } from "lucide-react";
import type { MaterialOption, TemplateOption } from "../card-order-wizard";

type TemplateStepProps = {
  templates: TemplateOption[];
  materials: MaterialOption[];
  selectedTemplate: TemplateOption | null;
  selectedMaterial: MaterialOption | null;
  selectedVariantId: string | null;
  onSelect: (template: TemplateOption, variantId: string) => void;
  getTemplatePrice: (tmpl: TemplateOption) => number;
  isCompany: boolean;
};

export function TemplateStep({
  templates,
  selectedTemplate,
  selectedMaterial,
  onSelect,
  getTemplatePrice,
  isCompany,
}: TemplateStepProps) {
  const [flipped, setFlipped] = useState(false);

  function getVariantForMaterial(tmpl: TemplateOption) {
    if (!selectedMaterial) return tmpl.variants[0];
    return (
      tmpl.variants.find((v) => v.materialId === selectedMaterial.id) ??
      tmpl.variants[0]
    );
  }

  function handleSelect(tmpl: TemplateOption) {
    const variant = getVariantForMaterial(tmpl);
    if (variant) {
      onSelect(tmpl, variant.id);
      setFlipped(false);
    }
  }

  const activeTemplate = selectedTemplate ?? templates[0];
  const activeVariant = activeTemplate
    ? getVariantForMaterial(activeTemplate)
    : null;
  const activePrice = activeTemplate ? getTemplatePrice(activeTemplate) : 0;

  // Auto-select first template if none selected
  if (!selectedTemplate && templates[0]) {
    const v = getVariantForMaterial(templates[0]);
    if (v) {
      // Defer to avoid setState during render
      queueMicrotask(() => onSelect(templates[0], v.id));
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-tight">
          Choose your design
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a template for your {selectedMaterial?.name ?? "card"}
          {isCompany && (
            <span className="ml-1 text-neo-teal">
              &mdash; all designs included
            </span>
          )}
        </p>
      </div>

      {/* Large preview */}
      {activeVariant && (
        <div className="mx-auto w-full max-w-lg">
          <Tilt
            rotationFactor={10}
            springOptions={{ stiffness: 180, damping: 20 }}
            className="relative w-full cursor-pointer"
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full bg-transparent"
              onClick={() => setFlipped((f) => !f)}
            >
              {/* Front */}
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
                      alt={`${activeTemplate?.name} — front`}
                      width={1025}
                      height={593}
                      className="block h-auto w-full"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 [backface-visibility:hidden]"
                style={{ transform: "rotateY(180deg)" }}
              >
                <Image
                  src={activeVariant.backSvg}
                  alt={`${activeTemplate?.name} — back`}
                  width={1025}
                  height={593}
                  className="block h-auto w-full"
                />
              </div>
            </motion.div>
          </Tilt>

          {/* Flip hint + template info */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {activeTemplate?.name}
              </span>
              {activeTemplate && (
                <TierBadge tier={activeTemplate.tier} className="text-[10px]" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tabular-nums">
                {activePrice === 0 ? (
                  <span className="text-neo-teal">Free</span>
                ) : (
                  <>
                    {activePrice}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      SAR
                    </span>
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {flipped ? "View front" : "View back"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template selector — horizontal row */}
      {templates.length > 1 && (
        <div className="space-y-3">
          <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Available Designs
          </p>
          <div className="flex justify-center gap-3">
            {templates.map((tmpl) => {
              const isActive = activeTemplate?.id === tmpl.id;
              const variant = getVariantForMaterial(tmpl);
              const price = getTemplatePrice(tmpl);

              return (
                <motion.button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelect(tmpl)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "group relative flex w-36 flex-col items-center gap-2 rounded-xl p-2 transition-colors",
                    isActive
                      ? "bg-neo-teal/5"
                      : "hover:bg-muted/50",
                  )}
                >
                  {/* Check */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-neo-teal"
                    >
                      <Check className="size-3 text-white" />
                    </motion.div>
                  )}

                  {/* Thumbnail */}
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

                  {/* Label */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isActive
                          ? "text-neo-teal"
                          : "text-muted-foreground",
                      )}
                    >
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {price === 0 ? "" : `${price} SAR`}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
