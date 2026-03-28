"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MATERIALS = [
  { slug: "classic", src: "/template/materials-base/classic/front.svg" },
  { slug: "prestige", src: "/template/materials-base/prestige/front.svg" },
  { slug: "artisan", src: "/template/materials-base/artisan/front.svg" },
];

// [defaultX, defaultY, defaultRotate, hoverX, hoverY, hoverRotate, zIndex]
const POSITIONS = [
  [-8, 28, -4, -40, 4, 3, 1],
  [0, 24, 0, 0, 0, 0, 3],
  [8, 28, 4, 40, 4, -3, 2],
];

export function OrderCardPrompt({
  profileId,
  className,
}: {
  profileId: string;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/profiles/${profileId}/order-card`} className="block">
      <Card
        className={cn(
          "border-2 border-dashed border-neo-teal/30 transition-colors hover:border-neo-teal/60 hover:bg-neo-teal/5",
          className,
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <CardContent className="flex flex-col items-center gap-1 overflow-hidden pb-0 pt-6">
          <div className="text-center">
            <p className="text-sm font-medium">Attach an NFC Neo Card</p>
            <p className="text-xs text-muted-foreground">
              Order a physical NFC card for this NEO ID
            </p>
          </div>

          {/* Stacked material cards */}
          <div className="relative mt-2 h-20 w-full">
            {MATERIALS.map((mat, i) => {
              const [dx, dy, dr, hx, hy, hr, z] = POSITIONS[i];
              const x = hovered ? hx : dx;
              const y = hovered ? hy : dy;
              const r = hovered ? hr : dr;

              return (
                <div
                  key={mat.slug}
                  className="absolute left-1/2 w-24 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{
                    transform: `translateX(calc(-50% + ${x}px)) translateY(${y}px) rotate(${r}deg)`,
                    zIndex: z,
                  }}
                >
                  <Image
                    src={mat.src}
                    alt={mat.slug}
                    width={1025}
                    height={593}
                    className="block h-auto w-full drop-shadow-md"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
