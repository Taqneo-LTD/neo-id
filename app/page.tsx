import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PlansSection } from "@/components/landing/plans-section";
import { CtaSection } from "@/components/landing/cta-section";
export default function Home() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PlansSection />
      <CtaSection />
    </main>
  );
}
