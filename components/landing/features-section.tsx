"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import {
  RadioTower,
  Users,
  BarChart3,
  ContactRound,
  Paintbrush,
  Globe,
  ArrowDownToLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;

type Feature = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  span: 1 | 2;
  visual: () => React.ReactNode;
  bgVisual?: () => React.ReactNode;
};

const features: Feature[] = [
  {
    title: "Live NEO-ID Profile",
    description:
      "Your digital business card lives on our platform. Update your info, links, or bio anytime and it reflects everywhere instantly. No reprints, no waiting.",
    icon: Globe,
    span: 2,
    visual: LiveProfileVisual,
  },
  {
    title: "NFC + QR Code",
    description:
      "Every Neo-Card comes with an embedded NFC chip and a printed QR code. Two ways to share, one seamless experience.",
    icon: RadioTower,
    span: 1,
    visual: NfcQrVisual,
    bgVisual: NfcQrBgVisual,
  },
  {
    title: "Team Management",
    description:
      "Manage your entire company's Neo-Cards from one dashboard. Invite employees, assign NEO-IDs, and order cards in bulk.",
    icon: Users,
    span: 1,
    visual: TeamVisual,
  },
  {
    title: "Real-time Analytics",
    description:
      "Track every profile view, card tap, and QR scan. See which cards drive the most engagement across your team.",
    icon: BarChart3,
    span: 2,
    visual: AnalyticsVisual,
  },
  {
    title: "Instant Contact Save",
    description:
      "Recipients tap one button to download your full contact as a vCard. Straight into their phone contacts.",
    icon: ContactRound,
    span: 1,
    visual: VCardVisual,
  },
  {
    title: "Custom Branding",
    description:
      "Apply your company logo, brand colors, and fonts across every employee's Neo-Card and NEO-ID profile.",
    icon: Paintbrush,
    span: 2,
    visual: BrandingVisual,
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -left-40 top-1/3 size-[500px] rounded-full bg-neo-teal/[0.02] blur-[120px]" />
        <div className="absolute -right-40 bottom-1/3 size-[400px] rounded-full bg-neo-lime-light/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <motion.div
            className="mx-auto h-px bg-gradient-to-r from-neo-teal to-neo-blue"
            initial={{ width: 0, opacity: 0 }}
            animate={isInView ? { width: 48, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          />
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You{" "}
            <span
              className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Need
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            A complete platform for digital identity and smart business cards.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                ease: EASE,
                delay: 0.2 + i * 0.1,
              }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card p-6 transition-colors hover:border-neo-teal/20",
                feature.span === 2 && "sm:col-span-2 lg:col-span-2",
              )}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 z-0 size-32 rounded-full bg-neo-teal/[0.03] blur-[40px] transition-all duration-500 group-hover:bg-neo-teal/[0.06]" />

              {feature.bgVisual && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  <feature.bgVisual />
                </div>
              )}

              <div className="relative z-10 flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-start">
                <div className={cn("flex-1", feature.span === 2 ? "max-w-md" : "")}>
                  <div className="flex size-10 items-center justify-center rounded-xl border border-neo-teal/20 bg-neo-teal/5">
                    <feature.icon className="size-4.5 text-neo-teal" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                {feature.span === 2 && (
                  <div className="hidden shrink-0 items-center sm:flex">
                    <feature.visual />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveProfileVisual() {
  return (
    <div className="group/card relative w-48 rounded-xl border border-white/[0.06] bg-background/60 p-4 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:border-neo-teal/20 group-hover:bg-background/80">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-full bg-gradient-to-br from-neo-teal/30 to-neo-blue/30 transition-all duration-500 delay-[0ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:from-neo-teal/50 group-hover:to-neo-blue/50 group-hover:shadow-[0_0_12px_rgba(139,223,215,0.3)]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-20 rounded-full bg-foreground/15 transition-all duration-500 delay-[50ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-24 group-hover:bg-foreground/25" />
          <div className="h-1.5 w-14 rounded-full bg-muted-foreground/10 transition-all duration-500 delay-[100ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-16 group-hover:bg-muted-foreground/15" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-1.5 w-full rounded-full bg-muted-foreground/8 transition-all duration-500 delay-[150ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:bg-muted-foreground/15" />
        <div className="h-1.5 w-3/4 rounded-full bg-muted-foreground/8 transition-all duration-500 delay-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-[85%] group-hover:bg-muted-foreground/15" />
        <div className="h-1.5 w-5/6 rounded-full bg-muted-foreground/8 transition-all duration-500 delay-[250ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-full group-hover:bg-muted-foreground/15" />
      </div>
      <div className="mt-4 flex gap-2">
        {[0, 1, 2, 3].map((n) => (
          <div
            key={n}
            className="size-5 rounded-md bg-neo-teal/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:bg-neo-teal/25"
            style={{ transitionDelay: `${300 + n * 50}ms` }}
          />
        ))}
      </div>
      <div className="absolute -right-1 -top-1 size-3 rounded-full bg-neo-teal shadow-[0_0_8px_rgba(139,223,215,0.6)] transition-all duration-500 group-hover:size-3.5 group-hover:shadow-[0_0_16px_rgba(139,223,215,0.8)]" />
    </div>
  );
}

function NfcQrVisual() {
  return null;
}

function NfcQrBgVisual() {
  return (
    <div className="absolute -right-6 -top-4 w-44 rotate-8 opacity-50 transition-all duration-500 group-hover:opacity-100 group-hover:-rotate-8">
      <Image
        src="/neo-cards/materials-base/prestige/front.svg"
        alt=""
        width={1025}
        height={593}
        className="block h-auto w-full"
      />
    </div>
  );
}

function TeamVisual() {
  return null;
}

function AnalyticsVisual() {
  const bars = [35, 55, 40, 70, 50, 85, 60, 75, 45];
  const hoverHeights = [
    "group-hover:!h-[85%]",
    "group-hover:!h-full",
    "group-hover:!h-[70%]",
    "group-hover:!h-[95%]",
    "group-hover:!h-[75%]",
    "group-hover:!h-full",
    "group-hover:!h-[88%]",
    "group-hover:!h-[92%]",
    "group-hover:!h-[78%]",
  ];
  return (
    <div className="group flex h-[140px] w-56 items-end gap-2">
      {bars.map((h, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-t bg-gradient-to-t from-neo-teal/40 to-neo-teal/10 transition-[height] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            hoverHeights[i],
          )}
          style={{
            height: `${h * 1.4}px`,
            transitionDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}

function VCardVisual() {
  return null;
}

function BrandingVisual() {
  const colors = [
    "bg-neo-teal",
    "bg-neo-lime",
    "bg-neo-blue",
    "bg-neo-lime-light",
    "bg-neo-blue-bright",
  ];
  return (
    <div className="flex w-52 flex-col items-center justify-center gap-5 group">
      <div className="flex items-center gap-4">
        <Image
          src="/brandings/logo-icon.svg"
          alt="NEO ID"
          width={36}
          height={33}
          className="h-[33px] w-auto"
        />
        <ArrowDownToLine className="size-3.5 text-muted-foreground/30" />
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-background/60 px-3 py-2">
          <div className="size-5 rounded-sm bg-gradient-to-br from-neo-teal/40 to-neo-blue/40" />
          <div className="space-y-1.5">
            <div className="h-1.5 w-10 rounded-full bg-foreground/15" />
            <div className="h-1.5 w-7 rounded-full bg-muted-foreground/10" />
          </div>
        </div>
      </div>
      <div className="flex gap-3 group-hover:gap-[5px] transition-all duration-300">
        {colors.map((c, i) => (
          <div
            key={i}
            className={cn("size-6 rounded-full ring-1 ring-white/10", c)}
          />
        ))}
      </div>
    </div>
  );
}
