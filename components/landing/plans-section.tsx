"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import {
  ArrowRight,
  CreditCard,
  Palette,
  Sparkles,
  BarChart3,
  Users,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const EASE = [0.23, 1, 0.32, 1] as const;

const plans = [
  {
    label: "Individual",
    headline: "Your Card. Your Brand.",
    description: "One premium NFC card that says everything about you.",
    cta: "Start Free",
    href: "/sign-up",
    image: "/brandings/individual.png",
    variant: "outline" as const,
    features: [
      { icon: CreditCard, text: "Up to 3 NEO-IDs free" },
      { icon: Palette, text: "Premium card materials" },
      { icon: Sparkles, text: "Customizable profile" },
      { icon: BarChart3, text: "View & tap analytics" },
    ],
  },
  {
    label: "Company",
    headline: "One Team. One Identity.",
    description: "Equip every employee with a smart card they'll actually use.",
    cta: "Set Up Your Team",
    href: "/sign-up",
    image: "/brandings/company.png",
    variant: "default" as const,
    features: [
      { icon: Users, text: "5 to 100+ seats with cards" },
      { icon: Shield, text: "Admin & role controls" },
      { icon: Palette, text: "Unified company branding" },
      { icon: BarChart3, text: "Team-wide analytics" },
    ],
  },
];

export function PlansSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
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
            Built for{" "}
            <span
              className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Everyone
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            Whether you fly solo or run a team.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                ease: EASE,
                delay: 0.2 + i * 0.15,
              }}
              className="group relative isolate overflow-hidden rounded-2xl border border-white/[0.06] transition-colors hover:border-neo-teal/20"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={plan.image}
                  alt={plan.label}
                  fill
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
              </div>

              <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-8 pt-44 sm:px-8 sm:pt-52">
                <span className="text-xs font-medium tracking-wider text-neo-teal uppercase">
                  {plan.label}
                </span>
                <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                  {plan.headline}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                  {plan.features.map((f, fi) => (
                    <span
                      key={fi}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground/80"
                    >
                      <f.icon className="size-3 text-neo-teal/50" />
                      {f.text}
                    </span>
                  ))}
                </div>
                <div className="mt-6">
                  <Button size="lg" className="px-6" variant={plan.variant} asChild>
                    <Link href={plan.href}>
                      {plan.cta}
                      <ArrowRight className="ml-1.5 size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
