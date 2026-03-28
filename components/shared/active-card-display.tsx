"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Tilt } from "@/components/ui/tilt";
import { cn } from "@/lib/utils";

export function ActiveCardDisplay({
  frontSvg,
  backSvg,
  className,
}: {
  frontSvg: string;
  backSvg?: string;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={cn("flex w-full flex-col items-center gap-2", className)}>
      <Tilt
        rotationFactor={12}
        springOptions={{ stiffness: 200, damping: 20 }}
        className="w-full cursor-pointer"
      >
        <div
          className="relative w-full"
          style={{ perspective: "1000px" }}
          onClick={() => backSvg && setFlipped((f) => !f)}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full"
          >
            {/* Front */}
            <div style={{ backfaceVisibility: "hidden" }}>
              <Image
                src={frontSvg}
                alt="Card front"
                width={1025}
                height={593}
                className="block h-auto w-full"
              />
            </div>

            {/* Back */}
            {backSvg && (
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <Image
                  src={backSvg}
                  alt="Card back"
                  width={1025}
                  height={593}
                  className="block h-auto w-full"
                />
              </div>
            )}
          </motion.div>
        </div>
      </Tilt>

      <div className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-neo-teal" />
        <p className="text-xs text-muted-foreground">Activated</p>
      </div>
    </div>
  );
}
