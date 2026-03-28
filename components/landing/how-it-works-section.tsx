"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { UserRoundPlus, Palette, RadioTower } from "lucide-react";

const EASE = [0.23, 1, 0.32, 1] as const;

const steps = [
  {
    number: "01",
    icon: UserRoundPlus,
    title: "Create Your NEO-ID",
    description:
      "Build your digital live card hosted on our platform. Add your contact details, social links, bio, and company branding. Update it anytime, and it updates everywhere.",
  },
  {
    number: "02",
    icon: Palette,
    title: "Design Your Neo-Card",
    description:
      "Choose from premium NFC card materials. Classic PVC, Artisan wood, or Prestige metal. Pick a template, apply your branding, and we craft your physical card.",
  },
  {
    number: "03",
    icon: RadioTower,
    title: "Tap & Share",
    description:
      "Hand your Neo-Card to anyone. One tap or a quick QR scan opens your live NEO-ID profile instantly on their phone. No app required, works with every smartphone.",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute -right-40 top-1/4 size-[500px] rounded-full bg-neo-teal/[0.02] blur-[120px]" />
        <div className="absolute -left-40 bottom-1/4 size-[400px] rounded-full bg-neo-blue-bright/[0.02] blur-[100px]" />
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
            How It{" "}
            <span
              className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Works
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            From profile to pocket in three simple steps.
          </p>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
          <VideoColumn isInView={isInView} />
          <StepsColumn isInView={isInView} />
        </div>
      </div>
    </section>
  );
}

function VideoColumn({ isInView }: { isInView: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        className="overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_12px_50px_-12px_rgba(139,223,215,0.2)]"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="block w-full"
        >
          <source src="/brandings/hero.mp4" type="video/mp4" />
        </video>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
        className="overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_12px_50px_-12px_rgba(139,223,215,0.15)]"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="block w-full"
        >
          <source src="/brandings/features.mp4" type="video/mp4" />
        </video>
      </motion.div>
    </div>
  );
}

function StepsColumn({ isInView }: { isInView: boolean }) {
  return (
    <div className="flex flex-col justify-center gap-10 lg:gap-12">
      {steps.map((step, i) => (
        <motion.div
          key={step.number}
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE, delay: 0.3 + i * 0.15 }}
          className="group flex gap-5"
        >
          <div className="flex flex-col items-center">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-neo-teal/20 bg-neo-teal/5 transition-colors group-hover:border-neo-teal/40 group-hover:bg-neo-teal/10">
              <step.icon className="size-5 text-neo-teal" />
            </div>
            {i < steps.length - 1 && (
              <div className="mt-3 h-full w-px bg-gradient-to-b from-neo-teal/20 to-transparent" />
            )}
          </div>

          <div className="pb-2">
            <span className="text-[11px] font-medium tracking-wider text-neo-teal/50 uppercase">
              Step {step.number}
            </span>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              {step.title}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
