"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Nfc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tilt } from "@/components/ui/tilt";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;

const materials = [
  {
    name: "Classic",
    tier: "Standard",
    price: 45,
    front: "/template/materials-base/classic/front.svg",
    back: "/template/materials-base/classic/back.svg",
  },
  {
    name: "Artisan",
    tier: "Premium",
    price: 95,
    front: "/template/materials-base/artisan/front.svg",
    back: "/template/materials-base/artisan/back.svg",
  },
  {
    name: "Prestige",
    tier: "Luxury",
    price: 175,
    front: "/template/materials-base/prestige/front.svg",
    back: "/template/materials-base/prestige/back.svg",
  },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden pt-24 md:pt-28">
      <BackgroundEffects />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-20">
          <TextContent />
          <CardShowcase />
        </div>
      </div>

    </section>
  );
}

function BackgroundEffects() {
  return (
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
        priority={false}
      />
      <Image
        src="/brandings/brand-element.svg"
        alt=""
        width={400}
        height={400}
        className="absolute -left-16 bottom-24 size-64 -rotate-[20deg] -scale-x-100 opacity-[0.03] lg:size-80"
        priority={false}
      />

      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

function TextContent() {
  return (
    <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
      <motion.div
        className="flex flex-col items-center gap-3 lg:items-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <motion.div
          className="h-px bg-gradient-to-r from-neo-teal to-neo-blue"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 48, opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        />
        <span className="text-sm tracking-wide text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="relative inline-flex">
              <Nfc className="size-3.5 text-neo-teal" />
              <motion.span
                className="absolute inset-0 rounded-full bg-neo-teal/30 blur-[6px]"
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
            <span className="font-medium text-neo-teal">NFC</span>
          </span>
          -Powered Smart Business Cards
        </span>
      </motion.div>

      <motion.h1
        className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
      >
        The{" "}
        <span
          className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
          style={{ WebkitBackgroundClip: "text" }}
        >
          Future
        </span>{" "}
        of
        <br />
        Business Networking
      </motion.h1>

      <motion.p
        className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.24 }}
      >
        Create stunning digital profiles linked to premium NFC cards. One tap
        shares everything. No app needed.
      </motion.p>

      <motion.div
        className="mt-8 flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.36 }}
      >
        <Button size="lg" className="px-6" asChild>
          <Link href="/sign-up">Get Started Free</Link>
        </Button>
        <Button variant="outline" size="lg" className="px-6" asChild>
          <Link href="#features">See How It Works</Link>
        </Button>
      </motion.div>

      <motion.div
        className="mt-8 flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.48 }}
      >
        <span className="size-1.5 rounded-full bg-neo-teal" />
        <span className="text-sm text-muted-foreground">
          One tap replaces 10,000 paper business cards
        </span>
      </motion.div>
    </div>
  );
}

function CardShowcase() {
  const [activeIndex, setActiveIndex] = useState(2);
  const [flipped, setFlipped] = useState(false);

  function getPosition(index: number) {
    const diff = ((index - activeIndex + 3) % 3);
    if (diff === 0) return { x: "0%", rotate: 0, scale: 1, zIndex: 10 };
    if (diff === 1) return { x: "40%", rotate: 6, scale: 0.82, zIndex: 5 };
    return { x: "-40%", rotate: -6, scale: 0.82, zIndex: 5 };
  }

  return (
    <motion.div
      className="relative w-full max-w-xl flex-1 lg:max-w-none"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease: EASE, delay: 0.3 }}
    >
      <div className="relative grid place-items-center py-4 [&>*]:col-start-1 [&>*]:row-start-1">
        {materials.map((mat, i) => {
          const pos = getPosition(i);
          const isActive = i === activeIndex;

          return (
            <motion.div
              key={mat.name}
              className="w-52 cursor-pointer sm:w-64 lg:w-[360px]"
              animate={{
                x: pos.x,
                rotate: pos.rotate,
                scale: pos.scale,
              }}
              style={{ zIndex: pos.zIndex }}
              transition={{ duration: 0.6, ease: EASE }}
              onClick={() => {
                if (isActive) {
                  setFlipped((f) => !f);
                } else {
                  setActiveIndex(i);
                  setFlipped(false);
                }
              }}
            >
              <Tilt
                rotationFactor={isActive ? 12 : 0}
                springOptions={{ stiffness: 200, damping: 18 }}
                className={cn(
                  "rounded-xl transition-shadow duration-500",
                  isActive
                    ? "shadow-[0_12px_50px_-12px_rgba(139,223,215,0.4)]"
                    : "shadow-none",
                )}
              >
                <motion.div
                  animate={{ rotateY: isActive && flipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  style={{ transformStyle: "preserve-3d" }}
                  className={cn(
                    "relative w-full transition-opacity duration-300",
                    !isActive && "opacity-50 hover:opacity-70",
                  )}
                >
                  <div className="[backface-visibility:hidden]">
                    <Image
                      src={mat.front}
                      alt={`${mat.name} card`}
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
                      src={mat.back}
                      alt={`${mat.name} card back`}
                      width={1025}
                      height={593}
                      className="block h-auto w-full"
                    />
                  </div>
                </motion.div>
              </Tilt>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        key={`${activeIndex}-${flipped}`}
        className="mt-1 text-center text-[11px] text-muted-foreground/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {flipped ? "Click to see front" : "Click card to flip"}
      </motion.p>

      <div className="mt-6 flex justify-center gap-2">
        {materials.map((mat, i) => (
          <button
            key={mat.name}
            onClick={() => {
              setActiveIndex(i);
              setFlipped(false);
            }}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-4 py-2.5 transition-all",
              i === activeIndex
                ? "bg-neo-teal/10"
                : "hover:bg-muted/50",
            )}
          >
            <span
              className={cn(
                "text-xs font-semibold transition-colors",
                i === activeIndex
                  ? "text-neo-teal"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mat.name}
            </span>
            <span
              className={cn(
                "text-[10px] transition-colors",
                i === activeIndex
                  ? "text-neo-teal/70"
                  : "text-muted-foreground",
              )}
            >
              {mat.tier}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

