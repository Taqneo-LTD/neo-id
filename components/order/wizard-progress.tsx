"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

export type WizardStep = {
  id: string;
  label: string;
};

type WizardProgressProps = {
  steps: WizardStep[];
  currentIndex: number;
  visibleCount?: number;
};

export function WizardProgress({
  steps,
  currentIndex,
  visibleCount = 3,
}: WizardProgressProps) {
  // Sliding window: keep current step visible, centered when possible
  const start = Math.max(
    0,
    Math.min(currentIndex - 1, steps.length - visibleCount),
  );
  const visibleSteps = steps.slice(start, start + visibleCount);

  return (
    <nav aria-label="Order progress" className="flex justify-center">
      <div className="flex items-center gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleSteps.map((step, vi) => {
            const globalIndex = start + vi;
            const isCompleted = globalIndex < currentIndex;
            const isCurrent = globalIndex === currentIndex;

            return (
              <motion.div
                key={step.id}
                layout
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="flex items-center gap-3"
              >
                <div className="flex items-center gap-2">
                  {/* Step indicator */}
                  <motion.div
                    layout
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors duration-300",
                      isCompleted && "bg-neo-teal text-white",
                      isCurrent &&
                        "bg-foreground text-background",
                      !isCompleted &&
                        !isCurrent &&
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className="size-3.5" />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="number"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          {globalIndex + 1}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    layout
                    className={cn(
                      "text-xs font-medium tracking-wide transition-colors duration-300",
                      isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </motion.span>
                </div>

                {/* Connector */}
                {vi < visibleCount - 1 && (
                  <motion.div
                    layout
                    className={cn(
                      "h-px w-8 transition-colors duration-500",
                      isCompleted ? "bg-neo-teal" : "bg-border",
                    )}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </nav>
  );
}
