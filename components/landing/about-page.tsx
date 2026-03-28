"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import {
  ArrowRight,
  Leaf,
  TreePine,
  Recycle,
  Globe,
  Cpu,
  Building,
  ShieldCheck,
  Zap,
  Award,
  Sparkles,
  Target,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;

export function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden pt-28 pb-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 top-20 size-[600px] rounded-full bg-neo-lime-light/[0.03] blur-[120px]" />
        <div className="absolute -right-32 top-40 size-[500px] rounded-full bg-neo-teal/[0.04] blur-[100px]" />
        <div className="absolute bottom-40 left-1/3 size-[400px] rounded-full bg-neo-blue-bright/[0.03] blur-[100px]" />
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
          className="absolute -left-16 bottom-60 size-64 -rotate-[20deg] -scale-x-100 opacity-[0.03] lg:size-80"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeroBlock />
        <MissionVision />
        <SustainabilitySection />
        <TaqneoSection />
        <TrustStrip />
        <CtaBlock />
      </div>
    </main>
  );
}

function HeroBlock() {
  return (
    <motion.div
      className="mx-auto max-w-3xl text-center"
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
      <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Redefining How the{" "}
        <span
          className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
          style={{ WebkitBackgroundClip: "text" }}
        >
          World
        </span>{" "}
        Connects
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
        NEO ID is more than a business card. It is a statement. A commitment to sustainability, innovation, and the way professionals should network in 2026 and beyond.
      </p>
    </motion.div>
  );
}

function MissionVision() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="mt-28 space-y-24">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        >
          <span className="text-xs font-medium tracking-wider text-neo-teal/70 uppercase">
            Our Mission
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            Eliminate paper waste from professional networking.
          </h2>
          <div className="mt-4 h-px w-12 bg-gradient-to-r from-neo-teal/40 to-transparent" />
          <p className="mt-5 text-base leading-[1.8] text-muted-foreground">
            Every year, 100 billion business cards are printed globally. 88% are thrown away within a week. That is millions of trees, tons of ink, and countless carbon emissions for something that ends up in a drawer or a trash can.
          </p>
          <p className="mt-4 text-base leading-[1.8] text-muted-foreground">
            We exist to end that cycle. One NFC card replaces a lifetime of paper waste while delivering a networking experience that paper never could.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          className="relative flex items-center justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-neo-teal/[0.04] blur-[60px]" />
            <div className="relative grid grid-cols-2 gap-3">
              {[
                { value: "100B", label: "Cards printed yearly" },
                { value: "88%", label: "Thrown away in a week" },
                { value: "7M+", label: "Trees cut annually" },
                { value: "1", label: "NEO Card to replace them all" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.3 + i * 0.08 }}
                  className="rounded-xl border border-white/[0.06] bg-card px-4 py-4 text-center"
                >
                  <p className="font-heading text-xl font-bold tabular-nums tracking-tight text-neo-teal sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="relative order-2 flex items-center justify-center lg:order-1"
        >
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-neo-blue-bright/[0.03] blur-[60px]" />
            <div className="relative flex flex-col items-center gap-4">
              <Image
                src="/brandings/logo-icon.svg"
                alt="NEO ID"
                width={72}
                height={66}
                className="h-[66px] w-auto"
              />
              <div className="flex items-center gap-3">
                {[
                  "/template/materials-base/classic/front.svg",
                  "/template/materials-base/artisan/front.svg",
                  "/template/materials-base/prestige/front.svg",
                ].map((src, i) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.3 + i * 0.1 }}
                    className="w-20 overflow-hidden rounded-md sm:w-24"
                    style={{ rotate: i === 0 ? -4 : i === 2 ? 4 : 0 }}
                  >
                    <Image
                      src={src}
                      alt=""
                      width={1025}
                      height={593}
                      className="block h-auto w-full"
                    />
                  </motion.div>
                ))}
              </div>
              <p className="text-[10px] tracking-wider text-muted-foreground/40 uppercase">
                One tap. Infinite impressions.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="order-1 lg:order-2"
        >
          <span className="text-xs font-medium tracking-wider text-neo-teal/70 uppercase">
            Our Vision
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            A world where every connection is instant and lasting.
          </h2>
          <div className="mt-4 h-px w-12 bg-gradient-to-r from-neo-teal/40 to-transparent" />
          <p className="mt-5 text-base leading-[1.8] text-muted-foreground">
            We see a future where sharing your professional identity takes a single tap. Where your card never runs out, your info is always current, and your first impression is backed by technology that reflects the caliber of your work.
          </p>
          <p className="mt-4 text-base leading-[1.8] text-muted-foreground">
            NEO ID is built for the professionals who refuse to settle. For the companies that want their brand represented with precision. For a generation that expects technology to be as refined as they are.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function SustainabilitySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    {
      icon: TreePine,
      value: "7M+",
      label: "Trees cut annually for business cards",
    },
    {
      icon: Recycle,
      value: "88%",
      label: "Of paper cards discarded within a week",
    },
    {
      icon: Leaf,
      value: "10,000+",
      label: "Paper cards replaced by a single NEO Card",
    },
    {
      icon: Globe,
      value: "0",
      label: "Carbon footprint per digital profile update",
    },
  ];

  return (
    <div ref={ref} className="mt-24">
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
          Built for the{" "}
          <span
            className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
            style={{ WebkitBackgroundClip: "text" }}
          >
            Planet
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
          Sustainability is not a feature. It is the foundation.
        </p>
      </motion.div>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card p-5 text-center transition-colors hover:border-neo-teal/20 sm:p-6"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 z-0 size-24 rounded-full bg-neo-teal/[0.03] blur-[30px] transition-all duration-500 group-hover:bg-neo-teal/[0.06]" />

            <div className="relative z-10">
              <div className="mx-auto flex size-10 items-center justify-center rounded-xl border border-neo-teal/20 bg-neo-teal/5">
                <stat.icon className="size-4.5 text-neo-teal" />
              </div>
              <p className="mt-4 font-heading text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
        className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground"
      >
        Every NEO Card is built to last{" "}
        <span className="font-medium text-foreground">10+ years</span> and{" "}
        <span className="font-medium text-foreground">100,000+ taps</span>.
        Your profile updates digitally. No reprints, no waste, no emissions.
      </motion.p>
    </div>
  );
}

function TaqneoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const capabilities = [
    {
      icon: Cpu,
      title: "Enterprise Engineering",
      description:
        "We build production-grade systems that handle millions of requests. NEO ID runs on the same infrastructure we deploy for international clients.",
    },
    {
      icon: ShieldCheck,
      title: "Security First",
      description:
        "PDPL compliant, TLS 1.3, AES-256 encryption. Payments secured via PayPal. Your data is protected to the highest standards.",
    },
    {
      icon: Zap,
      title: "Cloud-Native Infrastructure",
      description:
        "Deployed on Vercel with AWS S3 storage via UploadThing. Your profile and assets load in milliseconds, every time.",
    },
    {
      icon: Building,
      title: "International Clients",
      description:
        "Taqneo serves companies across KSA, UAE, North America, and Europe. NEO ID is backed by a team that ships at global scale.",
    },
  ];

  return (
    <div ref={ref} className="mt-24">
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
          Powered by{" "}
          <span
            className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
            style={{ WebkitBackgroundClip: "text" }}
          >
            Taqneo
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
          NEO ID is engineered by Taqneo, an enterprise software agency that builds high-performance platforms for international companies.
        </p>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {capabilities.map((cap, i) => (
          <motion.div
            key={cap.title}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card p-6 transition-colors hover:border-neo-teal/20 sm:p-8"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 z-0 size-32 rounded-full bg-neo-teal/[0.03] blur-[40px] transition-all duration-500 group-hover:bg-neo-teal/[0.06]" />

            <div className="relative z-10">
              <div className="flex size-10 items-center justify-center rounded-xl border border-neo-teal/20 bg-neo-teal/5">
                <cap.icon className="size-4.5 text-neo-teal" />
              </div>
              <h3 className="mt-4 text-base font-semibold tracking-tight">
                {cap.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {cap.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TrustStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const badges = [
    { icon: ShieldCheck, text: "PDPL Compliant" },
    { icon: Zap, text: "99.9% Uptime" },
    { icon: Award, text: "PayPal Secured" },
    { icon: Globe, text: "AWS S3 Storage" },
    { icon: Sparkles, text: "Vision 2030 Aligned" },
  ];

  return (
    <motion.div
      ref={ref}
      className="mt-24 flex flex-wrap items-center justify-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {badges.map((badge, i) => (
        <motion.div
          key={badge.text}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.06 }}
          className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-card px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-neo-teal/20 hover:text-foreground"
        >
          <badge.icon className="size-3.5 text-neo-teal/50" />
          {badge.text}
        </motion.div>
      ))}
    </motion.div>
  );
}

function CtaBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE }}
      className="group relative isolate mt-24 overflow-hidden rounded-3xl border border-white/[0.06]"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/brandings/cta.png"
          alt="Business card exchange"
          fill
          className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
      </div>

      <div className="relative z-10 flex flex-col items-start justify-center px-8 py-16 sm:px-12 sm:py-20 md:px-16 lg:max-w-xl lg:py-24">
        <motion.div
          className="h-px bg-gradient-to-r from-neo-teal to-neo-blue"
          initial={{ width: 0, opacity: 0 }}
          animate={isInView ? { width: 48, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
        />

        <h2 className="mt-5 font-heading text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl">
          Join the{" "}
          <span
            className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
            style={{ WebkitBackgroundClip: "text" }}
          >
            Movement
          </span>
        </h2>

        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          Be part of a generation that networks smarter, greener, and with more impact than ever before.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" className="px-6" asChild>
            <Link href="/sign-up">
              Get Started Free
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-6" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
