"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "motion/react";
import { Check, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Material card data ─────────────────────────────────── */

const MATERIALS = [
  { slug: "classic", src: "/neo-cards/materials-base/classic/front.svg" },
  { slug: "prestige", src: "/neo-cards/materials-base/prestige/front.svg" },
  { slug: "artisan", src: "/neo-cards/materials-base/artisan/front.svg" },
];

// [defaultX, defaultY, defaultRotate, hoverX, hoverY, hoverRotate, zIndex]
const POSITIONS = [
  [-10, 6, -6, -48, 2, -8, 1],
  [0, 0, 0, 0, -4, 0, 3],
  [10, 6, 6, 48, 2, 8, 2],
] as const;

/* ── Types ──────────────────────────────────────────────── */

export type PlanCardProps = {
  name: string;
  price: number;
  priceLabel?: string;
  features: string[];
  isCurrentPlan: boolean;
  isMostPopular: boolean;
  includesCards: boolean;
  cardCount?: number;
  ctaLabel: string;
  ctaAction?: () => void;
  ctaDisabled?: boolean;
  ctaVariant?: "default" | "outline";
  tier: string;
  showCardFan?: boolean;
};

/* ── Component ──────────────────────────────────────────── */

export function PlanCard({
  name,
  price,
  priceLabel,
  features,
  isCurrentPlan,
  isMostPopular,
  includesCards,
  cardCount,
  ctaLabel,
  ctaAction,
  ctaDisabled,
  ctaVariant = "default",
  showCardFan = true,
}: PlanCardProps) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  /* ── Mouse-tracking glow ─────────────────────────────── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 });
  const glowBackground = useMotionTemplate`radial-gradient(400px circle at ${smoothX}px ${smoothY}px, rgba(139,223,215,0.06), transparent 70%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  /* ── Price formatting ────────────────────────────────── */
  const displayPrice = priceLabel ?? (price === 0 ? "Custom" : null);
  const showNumericPrice = !displayPrice && price > 0;

  /* ── Border logic ────────────────────────────────────── */
  const borderGradient = "from-neo-teal/60 via-neo-teal to-neo-teal/60";

  const hasGradientBorder = isMostPopular || isCurrentPlan;

  /* ── Hover lift spring ───────────────────────────────── */
  const hoverY = useMotionValue(0);
  const springY = useSpring(hoverY, { stiffness: 400, damping: 30 });
  const hoverScale = useMotionValue(1);
  const springScale = useSpring(hoverScale, { stiffness: 400, damping: 30 });

  function onEnter() {
    setHovered(true);
    hoverY.set(-4);
    hoverScale.set(1.01);
  }

  function onLeave() {
    setHovered(false);
    hoverY.set(0);
    hoverScale.set(1);
  }

  return (
    <motion.div
      className="relative"
      style={{ y: springY, scale: springScale }}
    >
      {/* ── Gradient border wrapper ─────────────────────── */}
      {hasGradientBorder && (
        <div
          className={cn(
            "pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br opacity-60",
            borderGradient,
            isMostPopular && "opacity-80",
          )}
        />
      )}

      {/* ── Outer glow for "Most Popular" ───────────────── */}
      {isMostPopular && (
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-neo-teal/10 blur-xl" />
      )}

      {/* ── Main card ───────────────────────────────────── */}
      <motion.div
        ref={cardRef}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onMouseMove={handleMouseMove}
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[oklch(0.16_0_0)] backdrop-blur-xl",
          hasGradientBorder && "border-transparent",
        )}
      >
        {/* ── Mouse-follow glow layer ───────────────────── */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 transition-opacity duration-500"
          style={{
            background: glowBackground,
            opacity: hovered ? 1 : 0,
          }}
        />

        {/* ── Brand element background decoration ───────── */}
        <div className="pointer-events-none absolute -right-6 -top-4 z-0 h-40 w-32 rotate-12 opacity-[0.035]">
          <Image
            src="/brandings/brand-element.svg"
            alt=""
            fill
            className="object-contain"
            aria-hidden
          />
        </div>

        {/* ── Subtle noise/grain texture ─────────────────── */}
        <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-[0.015] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20256%20256%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22noise%22%3E%3CfeTurbulence%20baseFrequency=%220.9%22%20numOctaves=%224%22%20stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* ── Inner content ─────────────────────────────── */}
        <div className="relative z-10 flex h-full flex-col px-7 pb-7 pt-6">
          {/* ── Header: badges + plan name ──────────────── */}
          <div className="mb-6 space-y-4">
            {/* Badges row */}
            <div className="flex min-h-[22px] items-center gap-2">
              {isMostPopular && (
                <Badge className="border-0 bg-neo-teal/15 text-[11px] font-semibold text-neo-teal backdrop-blur-sm">
                  <Sparkles className="mr-0.5 size-3" />
                  Most Popular
                </Badge>
              )}
              {isCurrentPlan && (
                <Badge className="border border-neo-teal/30 bg-neo-teal/10 text-[11px] font-semibold text-neo-teal">
                  <Crown className="mr-0.5 size-3" />
                  Current Plan
                </Badge>
              )}
            </div>

            {/* Plan name */}
            <h3 className="text-[15px] font-semibold tracking-wide text-white/80 uppercase">
              {name}
            </h3>

            {/* ── Price hero ────────────────────────────── */}
            <div className="space-y-1">
              {showNumericPrice ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-medium text-white/40">
                    SAR
                  </span>
                  <span className="bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-5xl font-bold tracking-tighter text-transparent">
                    {price}
                  </span>
                  <span className="ml-0.5 text-sm font-medium text-white/30">
                    /yr
                  </span>
                </div>
              ) : (
                <span className="bg-gradient-to-br from-white via-white/90 to-white/70 bg-clip-text text-5xl font-bold tracking-tighter text-transparent">
                  {displayPrice}
                </span>
              )}
              {price > 0 && !priceLabel && (
                <p className="text-[11px] tracking-wide text-white/25">
                  + 15% VAT
                </p>
              )}
            </div>
          </div>

          {/* ── Separator ──────────────────────────────── */}
          <div className="mb-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* ── Feature list ───────────────────────────── */}
          <ul className="flex-1 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-neo-teal/10">
                  <Check className="size-2.5 text-neo-teal" strokeWidth={3} />
                </div>
                <span className="text-[13px] leading-snug text-white/60">
                  {feature}
                </span>
              </li>
            ))}
            {includesCards && cardCount != null && cardCount > 0 && (
              <li className="flex items-start gap-2.5">
                <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-neo-teal/20">
                  <Check className="size-2.5 text-neo-teal" strokeWidth={3} />
                </div>
                <span className="text-[13px] font-medium leading-snug text-neo-teal">
                  {cardCount} plastic cards included
                </span>
              </li>
            )}
          </ul>

          {/* ── Card fan ───────────────────────────────── */}
          {showCardFan && (
            <div className="relative mx-auto mt-6 h-[72px] w-full max-w-[240px]">
              {MATERIALS.map((mat, i) => {
                const [dx, dy, dr, hx, hy, hr, z] = POSITIONS[i];
                const x = hovered ? hx : dx;
                const y = hovered ? hy : dy;
                const r = hovered ? hr : dr;

                return (
                  <motion.div
                    key={mat.slug}
                    className="absolute left-1/2 w-[90px]"
                    animate={{
                      x: `calc(-50% + ${x}px)`,
                      y: `${y}px`,
                      rotate: r,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 22,
                      mass: 0.8,
                    }}
                    style={{ zIndex: z }}
                  >
                    <Image
                      src={mat.src}
                      alt={mat.slug}
                      width={1025}
                      height={593}
                      className="block h-auto w-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                    />
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ── CTA button ─────────────────────────────── */}
          <div className="mt-6">
            {ctaVariant === "default" && !ctaDisabled && !isCurrentPlan ? (
              <button
                type="button"
                onClick={ctaAction}
                disabled={ctaDisabled || isCurrentPlan}
                className={cn(
                  "group/cta relative w-full overflow-hidden rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                  "bg-neo-teal text-[oklch(0.13_0_0)]",
                  "hover:shadow-[0_0_24px_-4px_rgba(139,223,215,0.4)]",
                  "active:scale-[0.98]",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                {/* Shimmer sweep on hover */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/cta:translate-x-full" />
                <span className="relative">{ctaLabel}</span>
              </button>
            ) : (
              <Button
                variant="outline"
                className={cn(
                  "w-full border-white/[0.08] bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/70",
                  isCurrentPlan &&
                    "border-neo-teal/20 text-neo-teal/60 hover:bg-neo-teal/5 hover:text-neo-teal/80",
                )}
                disabled={ctaDisabled || isCurrentPlan}
                onClick={ctaAction}
              >
                {ctaLabel}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
