import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Site Map",
  description: "Browse all pages on NEO ID.",
};

const staticLinks = [
  { label: "Home", href: "/", description: "Smart business cards for the modern professional" },
  { label: "Pricing", href: "/pricing", description: "Plans for individuals and teams" },
  { label: "Collections", href: "/collections", description: "Browse card materials and templates" },
  { label: "About", href: "/about", description: "Our mission and story" },
];

const legalLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export default function SitemapPage() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-32 sm:px-6">
      <div className="mb-12 flex items-center gap-3">
        <Image src="/brandings/logo-icon.svg" alt="NEO ID" width={28} height={28} />
        <h1 className="text-2xl font-bold tracking-tight">Sitemap</h1>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Pages
          </h2>
          <ul className="space-y-3">
            {staticLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-baseline gap-2 text-sm transition-colors hover:text-neo-teal"
                >
                  <span className="font-medium">{link.label}</span>
                  <span className="text-xs text-muted-foreground/50 transition-colors group-hover:text-neo-teal/50">
                    {link.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Legal
          </h2>
          <ul className="space-y-3">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:text-neo-teal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
