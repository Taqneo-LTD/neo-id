"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Collection", href: "/collections" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const hideOn = ["/dashboard", "/profiles", "/company", "/orders", "/admin", "/settings", "/onboarding", "/p/"];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mt-3 flex h-14 items-center justify-between rounded-2xl border border-border/50 bg-background/80 px-4 shadow-sm backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/brandings/logo-icon.svg"
              alt="NEO ID"
              width={28}
              height={26}
              className="h-[26px] w-auto"
            />
            <span className="text-lg font-bold tracking-tight">
              NEO <span className="text-neo-teal">ID</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.filter((l) => l.href !== "/").map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm transition-colors hover:text-foreground",
                    pathname === link.href
                      ? "text-neo-teal"
                      : "text-muted-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-[60] inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="size-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="size-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-background md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -left-20 top-1/4 size-[400px] rounded-full bg-neo-teal/[0.04] blur-[100px]" />
              <div className="absolute -right-20 bottom-1/4 size-[300px] rounded-full bg-neo-blue-bright/[0.03] blur-[100px]" />
              <Image
                src="/brandings/brand-element.svg"
                alt=""
                width={300}
                height={300}
                className="absolute -right-8 bottom-20 size-56 rotate-12 opacity-[0.04]"
              />
            </div>

            <motion.button
              className="absolute right-6 top-6 z-50 flex size-10 items-center justify-center rounded-full border border-white/[0.06] bg-card text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, ease: EASE }}
              aria-label="Close menu"
            >
              <X className="size-4" />
            </motion.button>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-2 px-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
                className="mb-10"
              >
                <Image
                  src="/brandings/logo-icon.svg"
                  alt="NEO ID"
                  width={48}
                  height={44}
                  className="h-[44px] w-auto opacity-20"
                />
              </motion.div>

              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                    transition={{
                      duration: 0.5,
                      ease: EASE,
                      delay: 0.1 + i * 0.08,
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block py-3 text-center font-heading text-3xl font-bold tracking-tight transition-colors active:text-neo-teal",
                        isActive ? "text-neo-teal" : "text-foreground/80",
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          className="mx-auto mt-1 h-px w-8 bg-gradient-to-r from-transparent via-neo-teal to-transparent"
                          layoutId="mobile-active"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                className="mt-8 flex w-full max-w-xs flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
              >
                <Button size="lg" className="w-full" asChild>
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              </motion.div>
            </div>

            <motion.div
              className="relative z-10 pb-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
            >
              <p className="text-[10px] tracking-wider text-muted-foreground/25 uppercase">
                A product by{" "}
                <span className="text-muted-foreground/40">Taqneo Team</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
