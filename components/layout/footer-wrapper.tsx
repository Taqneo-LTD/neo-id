"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/landing/footer";

const HIDE_ON = [
  "/dashboard",
  "/profiles",
  "/company",
  "/orders",
  "/admin",
  "/settings",
  "/onboarding",
  "/invite",
  "/sign-in",
  "/sign-up",
  "/p/",
];

export function FooterWrapper() {
  const pathname = usePathname();
  const hidden = HIDE_ON.some((p) => pathname.startsWith(p));
  if (hidden) return null;
  return <Footer />;
}
