"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";

type CardPreviewProps = {
  frontSvg: string;
  backSvg: string;
  alt?: string;
  className?: string;
};

export function CardPreview({ frontSvg, backSvg, alt = "Card preview", className }: CardPreviewProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Card container with perspective */}
      <div
        className="relative w-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className={cn(
            "relative aspect-[1.6/1] w-full transition-transform duration-500",
            "[transform-style:preserve-3d]",
          )}
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]">
            <Image
              src={frontSvg}
              alt={`${alt} — front`}
              fill
              className="object-contain"
            />
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <Image
              src={backSvg}
              alt={`${alt} — back`}
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Flip hint */}
      <button
        type="button"
        onClick={() => setFlipped(!flipped)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCw className="size-3" />
        {flipped ? "View front" : "View back"}
      </button>
    </div>
  );
}
