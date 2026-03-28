import type { Metadata } from "next";
import { PricingPage } from "@/components/landing/pricing-page";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Pricing — NEO ID",
  description:
    "Simple, transparent pricing for individuals and companies. Start free, upgrade when you're ready.",
};

export default function Page() {
  return (
    <>
      <PricingPage />
      <Footer />
    </>
  );
}
