import type { Metadata } from "next";
import { PricingPage } from "@/components/landing/pricing-page";
export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for individuals and companies. Start free, upgrade when you're ready.",
};

export default function Page() {
  return (
    <>
      <PricingPage />
    </>
  );
}
