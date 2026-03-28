"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const EASE = [0.23, 1, 0.32, 1] as const;

export function CtaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          className="group relative isolate overflow-hidden rounded-3xl border border-white/[0.06]"
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

          <div className="relative z-10 flex flex-col items-start justify-center px-8 py-16 sm:px-12 sm:py-20 md:px-16 md:py-24 lg:max-w-xl lg:py-28">
            <motion.div
              className="h-px bg-gradient-to-r from-neo-teal to-neo-blue"
              initial={{ width: 0, opacity: 0 }}
              animate={isInView ? { width: 48, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            />

            <h2 className="mt-5 font-heading text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
              Make Every{" "}
              <span
                className="bg-gradient-to-r from-neo-lime-light via-neo-teal to-neo-blue-bright bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: "text" }}
              >
                Handshake
              </span>
              <br />
              Count
            </h2>

            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Stop handing out paper cards that end up in the trash. Start making connections that last.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="px-6" asChild>
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-6" asChild>
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
