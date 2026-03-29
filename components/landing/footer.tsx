"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;

const socials = [
  {
    name: "X",
    href: "https://x.com/neoid",
    icon: (
      <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/neoid",
    icon: (
      <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/neoid",
    icon: (
      <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
      </svg>
    ),
  },
  {
    name: "Snapchat",
    href: "https://snapchat.com/add/neoid",
    icon: (
      <svg viewBox="0 0 24 24" className="size-3.5 fill-current">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.274.105-.06.193-.091.298-.091.218 0 .39.106.474.207.138.168.193.355.155.532-.068.328-.37.57-.766.735-.12.045-.253.09-.399.12-.072.016-.148.03-.224.045h-.001c-.12.016-.165.03-.195.044-.15.073-.18.164-.195.267.015.06.03.12.06.18.06.135.375.645.93 1.17.705.675 1.395 1.005 1.725 1.139.06.03.12.045.165.06.194.074.345.194.345.42 0 .154-.074.3-.198.435-.36.375-1.14.585-2.07.72-.09.015-.18.015-.285.03-.09.015-.18.03-.285.045-.105.03-.18.045-.195.045-.135.045-.21.105-.24.195-.03.075-.06.21-.06.36 0 .12.03.255.06.39l.03.135c.045.21.06.435.06.585 0 .315-.12.54-.36.66-.255.135-.57.21-.885.21-.24 0-.48-.045-.66-.105-.27-.075-.585-.165-.93-.165-.135 0-.27.015-.405.045-.48.09-.93.48-1.47.93-.756.63-1.6 1.35-2.985 1.35s-2.229-.72-2.985-1.35c-.54-.45-.99-.84-1.47-.93a2.603 2.603 0 00-.405-.045c-.345 0-.66.09-.93.165-.18.06-.42.105-.66.105-.315 0-.63-.075-.885-.21-.24-.12-.36-.345-.36-.66 0-.15.015-.375.06-.585l.03-.135c.03-.135.06-.27.06-.39 0-.15-.03-.285-.06-.36-.03-.09-.105-.15-.24-.195-.015 0-.09-.015-.195-.045-.105-.015-.195-.03-.285-.045-.105-.015-.195-.015-.285-.03-.93-.135-1.71-.345-2.07-.72-.124-.135-.198-.285-.198-.435 0-.225.15-.345.345-.42.045-.015.105-.03.165-.06.33-.135 1.02-.465 1.725-1.14.555-.525.87-1.035.93-1.17.03-.06.045-.12.06-.18-.015-.105-.045-.195-.195-.27-.03-.015-.075-.03-.195-.044h-.001c-.075-.016-.15-.03-.224-.046a3.107 3.107 0 01-.399-.119c-.396-.165-.698-.407-.766-.735-.038-.177.017-.364.155-.532.084-.1.256-.207.474-.207.105 0 .193.03.298.09.263.15.621.275.922.275.195 0 .33-.046.401-.091-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C5.653 1.069 9.01.793 10 .793h.006z" />
      </svg>
    ),
  },
];

const materials = [
  { name: "Classic", src: "/neo-cards/materials-base/classic/front.svg" },
  { name: "Artisan", src: "/neo-cards/materials-base/artisan/front.svg" },
  { name: "Prestige", src: "/neo-cards/materials-base/prestige/front.svg" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.04]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-neo-teal/10 to-transparent" />
        <div className="absolute -bottom-32 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-neo-teal/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 py-12 md:py-16">

          <div className="flex items-center gap-12">
            <div className="flex items-center gap-8">
              {materials.map((mat, i) => (
                <motion.div
                  key={mat.name}
                  className="group/card relative"
                  initial={{ opacity: 0, y: 10, rotate: i === 0 ? -6 : i === 2 ? 6 : 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                  style={{ rotate: i === 0 ? -6 : i === 2 ? 6 : 0 }}
                >
                  <div className="w-20 overflow-hidden rounded-md transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/card:rotate-12 group-hover/card:scale-110 sm:w-24">
                    <Image
                      src={mat.src}
                      alt={mat.name}
                      width={1025}
                      height={593}
                      className="block h-auto w-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="hidden h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent sm:block" />

            <Link href="/" className="group hidden items-center gap-2.5 sm:flex">
              <Image
                src="/brandings/logo-icon.svg"
                alt="NEO ID"
                width={24}
                height={22}
                className="h-[22px] w-auto transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
              />
              <span className="text-sm font-bold tracking-tight text-foreground/60 transition-colors duration-300 group-hover:text-foreground">
                NEO <span className="text-neo-teal">ID</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-5">
              {[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "Templates", href: "#templates" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground/50 transition-colors duration-300 hover:text-neo-teal"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="h-3 w-px bg-white/[0.06]" />

            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex size-7 items-center justify-center rounded-full text-muted-foreground/30 transition-all duration-300 hover:bg-neo-teal/10 hover:text-neo-teal"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="h-px w-1/2  mx-auto bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <div className="flex items-center justify-center gap-10">
              <p className="text-[10px] tracking-wider text-muted-foreground/25 uppercase">
                A product by{" "}
                <span className="text-muted-foreground/40 transition-colors duration-300 hover:text-neo-teal">
                  Taqneo Team
                </span>
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/terms"
                  className="text-[10px] tracking-wider text-muted-foreground/30 uppercase transition-colors duration-300 hover:text-neo-teal"
                >
                  Terms
                </Link>
                <div className="h-2.5 w-px bg-gradient-to-b from-transparent via-neo-teal/20 to-transparent" />
                <Link
                  href="/privacy"
                  className="text-[10px] tracking-wider text-muted-foreground/30 uppercase transition-colors duration-300 hover:text-neo-teal"
                >
                  Privacy
                </Link>
                <div className="h-2.5 w-px bg-gradient-to-b from-transparent via-neo-teal/20 to-transparent" />
                <Link
                  href="/site-map"
                  className="text-[10px] tracking-wider text-muted-foreground/30 uppercase transition-colors duration-300 hover:text-neo-teal"
                >
                  Sitemap
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
