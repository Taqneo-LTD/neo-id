import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { FooterWrapper } from "@/components/layout/footer-wrapper";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://neo-id.com";

export const metadata: Metadata = {
  title: {
    default: "NEO ID | NFC Smart Business Cards",
    template: "%s | NEO ID",
  },
  description:
    "Create your digital identity and share it with a single tap. NFC-enabled smart business cards crafted in PVC, wood, and metal. Built for professionals and teams in Saudi Arabia.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "NEO ID",
    title: "NEO ID | NFC Smart Business Cards",
    description:
      "Create your digital identity and share it with a single tap. NFC-enabled smart business cards crafted in PVC, wood, and metal.",
    images: [
      {
        url: "/brandings/cta.png",
        width: 1200,
        height: 630,
        alt: "NEO ID Smart Business Cards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEO ID | NFC Smart Business Cards",
    description:
      "Create your digital identity and share it with a single tap. NFC-enabled smart business cards crafted in PVC, wood, and metal.",
    images: ["/brandings/cta.png"],
    creator: "@neoid",
  },
  keywords: [
    "NFC business card",
    "smart business card",
    "digital business card",
    "Saudi Arabia",
    "KSA",
    "NEO ID",
    "NFC card",
    "QR code business card",
    "tap to share",
    "بطاقة أعمال ذكية",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans dark", inter.variable, spaceGrotesk.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
        <FooterWrapper />
        <Analytics />
      </body>
    </html>
  );
}
