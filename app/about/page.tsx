import type { Metadata } from "next";
import { AboutPage } from "@/components/landing/about-page";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "About — NEO ID",
  description:
    "NEO ID is built by Taqneo, an enterprise software agency. Our mission: replace paper business cards with smart, sustainable NFC technology.",
};

export default function Page() {
  return (
    <>
      <AboutPage />
      <Footer />
    </>
  );
}
