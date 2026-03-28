"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Palette,
  Sparkles,
  BarChart3,
  Users,
  Shield,
  Zap,
  Crown,
  Building2,
  User,
  Infinity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PLAN_PRICES,
  PLAN_LIMITS,
  CARD_PRICES,
  SHIPPING,
} from "@/lib/pricing";

const EASE = [0.23, 1, 0.32, 1] as const;

type PlanType = "individual" | "company";

const individualPlans = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Get started with the essentials.",
    cta: "Start Free",
    href: "/sign-up",
    variant: "outline" as const,
    highlighted: false,
    features: [
      `${PLAN_LIMITS.INDIVIDUAL_FREE.maxNeoIds} NEO-ID profiles`,
      "Free card templates",
      "Basic analytics (view count)",
      "QR code + vCard download",
      "Public profile page",
    ],
  },
  {
    name: "Pro",
    price: PLAN_PRICES.INDIVIDUAL_PRO,
    period: "/year",
    description: "Unlimited NEO-IDs and premium access.",
    cta: "Upgrade to Pro",
    href: "/sign-up",
    variant: "default" as const,
    highlighted: true,
    features: [
      "Unlimited NEO-ID profiles",
      "All premium templates included",
      "Advanced analytics (views, taps, device)",
      "QR code + vCard download",
      "Public profile page",
      "Priority support",
    ],
  },
];

const companyPlans = [
  {
    name: "Startup",
    price: PLAN_PRICES.COMPANY_STARTUP,
    period: "/year",
    seats: PLAN_LIMITS.COMPANY_STARTUP.maxSeats,
    description: "For small teams getting started.",
    cta: "Get Started",
    href: "/sign-up",
    variant: "outline" as const,
    highlighted: false,
    features: [
      `${PLAN_LIMITS.COMPANY_STARTUP.maxSeats} seats (NEO-IDs)`,
      `${PLAN_LIMITS.COMPANY_STARTUP.maxSeats} Classic cards included`,
      "All templates included",
      "Company branding (logo + colors)",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    name: "Business",
    price: PLAN_PRICES.COMPANY_BUSINESS,
    period: "/year",
    seats: PLAN_LIMITS.COMPANY_BUSINESS.maxSeats,
    description: "For growing teams that need more.",
    cta: "Get Started",
    href: "/sign-up",
    variant: "default" as const,
    highlighted: true,
    features: [
      `${PLAN_LIMITS.COMPANY_BUSINESS.maxSeats} seats (NEO-IDs)`,
      `${PLAN_LIMITS.COMPANY_BUSINESS.maxSeats} Classic cards included`,
      "All templates included",
      "Full company branding",
      "Advanced analytics",
      "Bulk card ordering",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    period: "",
    seats: PLAN_LIMITS.COMPANY_ENTERPRISE.maxSeats,
    description: "For large organizations.",
    cta: "Contact Sales",
    href: "/about",
    variant: "outline" as const,
    highlighted: false,
    features: [
      "100+ seats (custom)",
      "Cards included per seat",
      "All templates + custom design",
      "Full branding + custom domain",
      "Team dashboards + export",
      "Role-based admin controls",
      "Dedicated account manager",
    ],
  },
];

export function PricingPage() {
  const [activeTab, setActiveTab] = useState<PlanType>("individual");

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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <motion.div
            className="mx-auto h-px bg-gradient-to-r from-neo-teal to-neo-blue"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 48, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          />
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Simple,{" "}
            <span
              className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Transparent
            </span>{" "}
            Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            Yearly billing only. No hidden fees. All prices in SAR.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        >
          <div className="inline-flex rounded-xl border border-white/[0.06] bg-card p-1">
            {(["individual", "company"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-neo-teal/10 border border-neo-teal/20"
                    layoutId="pricing-tab"
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab === "individual" ? (
                    <User className="size-3.5" />
                  ) : (
                    <Building2 className="size-3.5" />
                  )}
                  {tab === "individual" ? "Individual" : "Company"}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="mt-12">
          {activeTab === "individual" ? (
            <IndividualPlans />
          ) : (
            <CompanyPlans />
          )}
        </div>

        <MaterialPricing />
        <PlanCards />
      </div>
    </main>
  );
}

function IndividualPlans() {
  return (
    <motion.div
      className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      key="individual"
    >
      {individualPlans.map((plan, i) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
          className={cn(
            "group relative overflow-hidden rounded-2xl border p-6 transition-colors sm:p-8",
            plan.highlighted
              ? "border-neo-teal/30 bg-neo-teal/[0.03]"
              : "border-white/[0.06] bg-card",
          )}
        >
          {plan.highlighted && (
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-neo-teal/[0.06] blur-[40px]" />
          )}

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
              {plan.highlighted && (
                <span className="flex items-center gap-1 rounded-full border border-neo-teal/30 bg-neo-teal/10 px-2.5 py-0.5 text-[10px] font-medium text-neo-teal">
                  <Sparkles className="size-2.5" />
                  Popular
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              {plan.price === 0 ? (
                <span className="text-3xl font-bold tracking-tight text-neo-teal">Free</span>
              ) : (
                <>
                  <span className="text-3xl font-bold tabular-nums tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">SAR{plan.period}</span>
                </>
              )}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

            <div className="mt-6">
              <Button size="lg" className="w-full" variant={plan.variant} asChild>
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </div>

            <ul className="mt-6 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-neo-teal/60" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function CompanyPlans() {
  return (
    <motion.div
      className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      key="company"
    >
      {companyPlans.map((plan, i) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
          className={cn(
            "group relative overflow-hidden rounded-2xl border p-6 transition-colors sm:p-8",
            plan.highlighted
              ? "border-neo-teal/30 bg-neo-teal/[0.03]"
              : "border-white/[0.06] bg-card",
          )}
        >
          {plan.highlighted && (
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-neo-teal/[0.06] blur-[40px]" />
          )}

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
              {plan.highlighted && (
                <span className="flex items-center gap-1 rounded-full border border-neo-teal/30 bg-neo-teal/10 px-2.5 py-0.5 text-[10px] font-medium text-neo-teal">
                  <Crown className="size-2.5" />
                  Recommended
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              {plan.price === null ? (
                <span className="text-2xl font-bold tracking-tight">Custom</span>
              ) : (
                <>
                  <span className="text-3xl font-bold tabular-nums tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">SAR{plan.period}</span>
                </>
              )}
            </div>

            <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

            <div className="mt-6">
              <Button size="lg" className="w-full" variant={plan.variant} asChild>
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </div>

            <ul className="mt-6 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-neo-teal/60" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function MaterialPricing() {
  const materials = [
    {
      name: "Classic",
      material: "PVC Plastic",
      price: CARD_PRICES.CLASSIC.unit,
      bulk50: CARD_PRICES.CLASSIC.bulk50,
      bulk100: CARD_PRICES.CLASSIC.bulk100,
      image: "/template/materials-base/classic/front.svg",
    },
    {
      name: "Artisan",
      material: "Bamboo Wood",
      price: CARD_PRICES.ARTISAN.unit,
      bulk50: CARD_PRICES.ARTISAN.bulk50,
      bulk100: CARD_PRICES.ARTISAN.bulk100,
      image: "/template/materials-base/artisan/front.svg",
    },
    {
      name: "Prestige",
      material: "Stainless Steel",
      price: CARD_PRICES.PRESTIGE.unit,
      bulk50: CARD_PRICES.PRESTIGE.bulk50,
      bulk100: CARD_PRICES.PRESTIGE.bulk100,
      image: "/template/materials-base/prestige/front.svg",
    },
  ];

  return (
    <div className="mt-24">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <motion.div
          className="mx-auto h-px bg-gradient-to-r from-neo-teal to-neo-blue"
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: 48, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        />
        <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Card{" "}
          <span
            className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
            style={{ WebkitBackgroundClip: "text" }}
          >
            Materials
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Every card ships with an NFC chip and printed QR code. Free shipping on orders above {SHIPPING.FREE_THRESHOLD} SAR.
        </p>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {materials.map((mat, i) => (
          <motion.div
            key={mat.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
            className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-card transition-colors hover:border-neo-teal/20"
          >
            <div className="p-4">
              <Image
                src={mat.image}
                alt={mat.name}
                width={1025}
                height={593}
                className="block h-auto w-full rounded-xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]"
              />
            </div>
            <div className="px-6 pb-6">
              <h3 className="text-base font-semibold tracking-tight">{mat.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{mat.material}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">{mat.price}</span>
                <span className="text-xs text-muted-foreground">SAR / card</span>
              </div>
              <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground/60">
                <span>{mat.bulk50} SAR (50+)</span>
                <span>{mat.bulk100} SAR (100+)</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PlanCards() {
  return (
    <div className="mt-24">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[
          {
            label: "Individual",
            headline: "Your Card. Your Brand.",
            description: "One premium NFC card that says everything about you.",
            image: "/brandings/individual.png",
            cta: "Start Free",
            href: "/sign-up",
            variant: "outline" as const,
          },
          {
            label: "Company",
            headline: "One Team. One Identity.",
            description: "Equip every employee with a smart card they'll actually use.",
            image: "/brandings/company.png",
            cta: "Set Up Your Team",
            href: "/sign-up",
            variant: "default" as const,
          },
        ].map((plan, i) => (
          <motion.div
            key={plan.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.12 }}
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

            <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-8 pt-36 sm:px-8 sm:pt-44">
              <span className="text-xs font-medium tracking-wider text-neo-teal uppercase">
                {plan.label}
              </span>
              <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                {plan.headline}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {plan.description}
              </p>
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
  );
}
