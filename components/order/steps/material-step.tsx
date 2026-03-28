"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tilt } from "@/components/ui/tilt";
import { Info } from "lucide-react";
import type { MaterialOption } from "../card-order-wizard";

const MATERIAL_TIERS: Record<
  number,
  { label: string; className: string }
> = {
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

type MaterialStepProps = {
  materials: MaterialOption[];
  selected: MaterialOption | null;
  onSelect: (material: MaterialOption) => void;
  getMaterialPrice: (mat: MaterialOption) => number;
  isCompany: boolean;
  companyPlanIncludesPlastic: boolean;
};

export function MaterialStep({
  materials,
  selected,
  onSelect,
  getMaterialPrice,
  isCompany,
  companyPlanIncludesPlastic,
}: MaterialStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-tight">
          Choose your material
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the physical finish for your NFC card
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {materials.map((mat, i) => (
          <motion.div
            key={mat.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <MaterialTiltCard
              material={mat}
              isSelected={selected?.id === mat.id}
              effectivePrice={getMaterialPrice(mat)}
              isFreeForCompany={
                isCompany &&
                companyPlanIncludesPlastic &&
                mat.slug === "classic"
              }
              onSelect={() => onSelect(mat)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Individual material card with Tilt + Flip ──────────

function MaterialTiltCard({
  material,
  isSelected,
  effectivePrice,
  isFreeForCompany,
  onSelect,
}: {
  material: MaterialOption;
  isSelected: boolean;
  effectivePrice: number;
  isFreeForCompany: boolean;
  onSelect: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const tierInfo = MATERIAL_TIERS[material.tier] ?? MATERIAL_TIERS[0];

  function handleClick() {
    if (isSelected) {
      // Already selected → flip to see back/front
      setFlipped((f) => !f);
    } else {
      // Select this material
      onSelect();
      setFlipped(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex w-full flex-col items-center gap-4 text-center outline-none"
    >
      {/* 3D Card */}
      <Tilt
        rotationFactor={14}
        springOptions={{ stiffness: 200, damping: 18 }}
        className={cn(
          "relative w-full cursor-pointer transition-shadow duration-300",
          isSelected
            ? "shadow-[0_8px_40px_-8px_rgba(139,223,215,0.35)]"
            : "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12)]",
        )}
      >
        {/* Flip container */}
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full"
        >
          {/* Front face — sets the natural height */}
          <div className="[backface-visibility:hidden]">
            <Image
              src={material.frontSvg}
              alt={`${material.name} — front`}
              width={1025}
              height={593}
              className="block h-auto w-full"
            />
          </div>

          {/* Back face — overlaps front exactly */}
          <div
            className="absolute inset-0 [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <Image
              src={material.backSvg}
              alt={`${material.name} — back`}
              width={1025}
              height={593}
              className="block h-auto w-full"
            />
          </div>
        </motion.div>

        {/* Selected ring */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-lg"
          animate={{
            opacity: isSelected ? 1 : 0,
            boxShadow: isSelected
              ? "inset 0 0 0 2px var(--color-neo-teal)"
              : "inset 0 0 0 0px transparent",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Included badge */}
        {isFreeForCompany && (
          <div className="absolute top-2 right-3 z-10">
            <Badge className="bg-neo-teal text-[10px] text-white shadow-sm">
              Included
            </Badge>
          </div>
        )}
      </Tilt>

      {/* Info beneath — no card wrapper, clean typography */}
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <motion.h3
            className={cn(
              "text-sm font-semibold tracking-tight transition-colors",
              isSelected ? "text-neo-teal" : "text-foreground",
            )}
          >
            {material.name}
          </motion.h3>
          {material.tier > 0 && (
            <Badge
              variant="outline"
              className={cn("text-[10px]", tierInfo.className)}
            >
              {tierInfo.label}
            </Badge>
          )}
          {isFreeForCompany && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 shrink-0 cursor-help text-neo-teal" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  Included free with your company plan
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {material.description && (
          <p className="mx-auto max-w-[200px] text-[11px] leading-relaxed text-muted-foreground">
            {material.description}
          </p>
        )}

        <div className="pt-1">
          {isFreeForCompany ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-base font-bold text-neo-teal">Free</span>
              <span className="text-xs text-muted-foreground line-through">
                {material.unitPrice} SAR
              </span>
            </div>
          ) : (
            <p>
              <span className="text-base font-bold tabular-nums">
                {effectivePrice}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">SAR</span>
            </p>
          )}
        </div>

        {/* Flip hint — only for selected */}
        {isSelected && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-muted-foreground"
          >
            Click to {flipped ? "see front" : "see back"}
          </motion.p>
        )}
      </div>
    </button>
  );
}
