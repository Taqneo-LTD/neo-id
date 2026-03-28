"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Tilt } from "@/components/ui/tilt";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/templates/tier-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight } from "lucide-react";
import { getInitials } from "@/lib/string-utils";
import type { TemplateTier } from "@/lib/generated/prisma/client";

// ─── Types ───────────────────────────────────────────────

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

type UserProfile = {
  id: string;
  name: string | null;
  slug: string;
  avatarUrl: string | null;
  ownerName?: string;
};

type UserContext = {
  accountType: "INDIVIDUAL" | "COMPANY";
  role: "OWNER" | "ADMIN" | "MEMBER";
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

// ─── Component ───────────────────────────────────────────

export function NeoCardShowcase({
  materials,
  templates,
  profiles,
  allCovered = false,
  availableSlots = 0,
  userContext,
}: {
  materials: Material[];
  templates: Template[];
  profiles: UserProfile[];
  allCovered?: boolean;
  availableSlots?: number; // -1 = unlimited, 0 = maxed out, >0 = can create more
  userContext: UserContext;
}) {
  const [activeMaterialId, setActiveMaterialId] = useState(materials[0]?.id);
  const [activeTemplateId, setActiveTemplateId] = useState(templates[0]?.id);
  const [flipped, setFlipped] = useState(false);

  const activeMaterial = materials.find((m) => m.id === activeMaterialId);
  const activeTemplate = templates.find((t) => t.id === activeTemplateId);

  const activeVariant = activeTemplate?.variants.find(
    (v) => v.materialId === activeMaterialId,
  ) ?? activeTemplate?.variants[0];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-neo-teal/20 via-neo-sky/20 to-neo-lime/20">
          <Image
            src="/brandings/logo-icon.svg"
            alt="NEO"
            width={24}
            height={22}
            className="h-[22px] w-auto"
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          NEO <span className="text-neo-teal">Card</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          NFC-enabled smart business cards. Tap to share your digital identity
          instantly.
        </p>

        {/* Inline CTA */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {allCovered ? (
            <AllCoveredMessage userContext={userContext} availableSlots={availableSlots} />
          ) : profiles.length > 0 ? (
            <>
              <span className="text-xs text-muted-foreground">Order for</span>
              {profiles.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/profiles/${profile.id}/order-card`}
                  className="group flex items-center gap-2 rounded-full border border-border/50 bg-card py-1.5 pl-1.5 pr-3 transition-all hover:border-neo-teal/50 hover:bg-neo-teal/5"
                >
                  <Avatar className="size-5">
                    <AvatarImage src={profile.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-neo-teal/10 text-[9px] text-neo-teal">
                      {getInitials(profile.name ?? profile.slug)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium group-hover:text-neo-teal">
                    {profile.ownerName
                      ? `${profile.name ?? profile.slug} (${profile.ownerName})`
                      : (profile.name ?? profile.slug)}
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground transition-colors group-hover:text-neo-teal" />
                </Link>
              ))}
            </>
          ) : (
            <Link
              href="/profiles/new"
              className="flex items-center gap-1.5 rounded-full border border-neo-teal/30 px-4 py-1.5 text-xs font-medium text-neo-teal transition-colors hover:bg-neo-teal/10"
            >
              Create a NEO ID to get started
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      </motion.div>

      {/* ── Materials Section ────────────────────────────── */}
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

      {/* ── Design Preview Section ───────────────────────── */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Card Designs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every design adapts to every material. See your card come to life
          </p>
        </div>

        {/* Large interactive preview */}
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
                className="relative w-full"
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
                        alt="Card front"
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
                    alt="Card back"
                    width={1025}
                    height={593}
                    className="block h-auto w-full"
                  />
                </div>
              </motion.div>
            </Tilt>

            {/* Info bar */}
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

        {/* Material switcher pills */}
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

        {/* Template selector row */}
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

    </div>
  );
}

// ─── All Covered Message ─────────────────────────────────

function AllCoveredMessage({
  userContext,
  availableSlots = 0,
}: {
  userContext: UserContext;
  availableSlots?: number;
}) {
  const isCompany = userContext.accountType === "COMPANY";
  const isOwnerOrAdmin =
    userContext.role === "OWNER" || userContext.role === "ADMIN";
  const hasAvailableSlots = availableSlots === -1 || availableSlots > 0;
  // ── Premium "you have credits" state ──────────────────
  if (hasAvailableSlots) {
    const isUnlimited = availableSlots === -1;

    return (
      <div className="mx-auto max-w-lg">
        <div className="relative overflow-hidden rounded-2xl border border-neo-teal/20 bg-gradient-to-b from-neo-teal/[0.06] to-transparent p-5">
          {/* Subtle glow */}
          <div className="pointer-events-none absolute -top-12 left-1/2 h-24 w-64 -translate-x-1/2 rounded-full bg-neo-teal/10 blur-3xl" />

          <div className="relative space-y-3 text-center">
            {/* Slot count badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-neo-teal/25 bg-neo-teal/10 px-3 py-1">
              <span className="text-lg font-bold tabular-nums text-neo-teal">
                {isUnlimited ? "\u221E" : availableSlots}
              </span>
              <span className="text-[11px] font-medium text-neo-teal/80">
                {isUnlimited ? "unlimited seats" : `seat${availableSlots !== 1 ? "s" : ""} available`}
              </span>
            </div>

            <p className="text-sm font-medium text-foreground/90">
              Your team is covered. Time to grow.
            </p>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {isCompany && isOwnerOrAdmin ? (
                <>
                  Every NEO ID already has a card.{" "}
                  <Link href="/profiles/new" className="font-medium text-neo-teal hover:underline">
                    Create a new NEO ID
                  </Link>{" "}
                  or{" "}
                  <Link href="/company/employees" className="font-medium text-neo-teal hover:underline">
                    invite team members
                  </Link>{" "}
                  to get them carded up. Want multiple cards for the same person?
                  Visit their{" "}
                  <Link href="/profiles" className="font-medium text-neo-teal hover:underline">
                    NEO ID profile
                  </Link>{" "}
                  to order additional materials.
                </>
              ) : (
                <>
                  All your NEO IDs have cards.{" "}
                  <Link href="/profiles/new" className="font-medium text-neo-teal hover:underline">
                    Create {isUnlimited ? "another NEO ID" : `up to ${availableSlots} more`}
                  </Link>{" "}
                  and expand your collection. Need a second card in a different material?
                  Head to your{" "}
                  <Link href="/profiles" className="font-medium text-neo-teal hover:underline">
                    NEO ID profile
                  </Link>{" "}
                  to order one.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Standard "maxed out" state ──────────────────────
  let message: React.ReactNode;

  if (isCompany && isOwnerOrAdmin) {
    message = (
      <>
        Your team is fully equipped with NEO Cards.{" "}
        <Link href="/settings" className="text-neo-teal hover:underline">
          Upgrade your plan
        </Link>{" "}
        to unlock more seats for new team members. Want to add an extra card in
        a different material? Visit any{" "}
        <Link href="/profiles" className="text-neo-teal hover:underline">
          NEO ID profile
        </Link>{" "}
        to order one.
      </>
    );
  } else if (isCompany) {
    message = (
      <>
        Your NEO ID already has a card. Want one in a different material? Visit
        your{" "}
        <Link href="/profiles" className="text-neo-teal hover:underline">
          NEO ID profile
        </Link>{" "}
        to order another. Need more seats? Reach out to your account
        administrator.
      </>
    );
  } else {
    message = (
      <>
        All your NEO IDs have cards.{" "}
        <Link href="/settings" className="text-neo-teal hover:underline">
          Upgrade your plan
        </Link>{" "}
        to create more NEO IDs. Want an extra card in a different material?
        Visit your{" "}
        <Link href="/profiles" className="text-neo-teal hover:underline">
          NEO ID profile
        </Link>{" "}
        to order one.
      </>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-border/50 bg-card px-4 py-3">
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

// ─── Material Showcase Card ──────────────────────────────

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
        ease: [0.23, 1, 0.32, 1],
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
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
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

        {/* Active ring */}
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

      {/* Info */}
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
