"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Users,
  UserCircle,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/string-utils";
import { useDashboardUser } from "@/components/providers/dashboard-provider";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Profiles", href: "/profiles", icon: UserCircle },
  { label: "NEO Card", href: "/neo-card", icon: CreditCard },
];

/** Orders visible to individuals + company owners/admins (not employees) */
const ordersNavItem = { label: "Orders", href: "/orders", icon: Package };

const companyNavItems = [
  { label: "Company", href: "/company", icon: Users },
];

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useDashboardUser();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isCompany = user.accountType === "COMPANY";
  const isOwnerOrAdmin = user.role === "OWNER" || user.role === "ADMIN";

  const showOrders = !isCompany || isOwnerOrAdmin;

  const allNavItems = [
    ...navItems,
    ...(showOrders ? [ordersNavItem] : []),
    ...(isCompany && isOwnerOrAdmin ? companyNavItems : []),
  ];

  const initials = getInitials(user.name);

  // Use profile avatar if available, fall back to account avatar
  const displayAvatar = user.profileAvatarUrl ?? user.avatarUrl;

  return (
    <div className="min-h-screen">
      {/* Top navbar */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mt-3 flex h-14 items-center justify-between rounded-2xl border border-border/50 bg-background/80 px-4 shadow-sm backdrop-blur-xl">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5">
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

            {/* Desktop nav links */}
            <ul className="hidden items-center gap-1 md:flex">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                        active
                          ? "font-medium text-neo-teal"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop right: Settings + User avatar */}
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith("/settings")
                    ? "font-medium text-neo-teal"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Settings className="size-4" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-none transition-opacity hover:opacity-80">
                    <Avatar className="size-8">
                      <AvatarImage src={displayAvatar ?? undefined} />
                      <AvatarFallback className="bg-neo-teal/10 text-xs text-neo-teal">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      {isCompany ? user.companyName : user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <LogoutLink className="w-full cursor-pointer">
                      <LogOut className="mr-2 size-4" />
                      Sign out
                    </LogoutLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </nav>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "mx-auto max-w-7xl overflow-hidden px-4 transition-all duration-300 ease-in-out sm:px-6 md:hidden lg:px-8",
            mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="mt-2 rounded-2xl border border-border/50 bg-background/95 p-4 shadow-lg backdrop-blur-xl">
            <ul className="space-y-1">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-neo-teal/10 font-medium text-neo-teal"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname.startsWith("/settings")
                      ? "bg-neo-teal/10 font-medium text-neo-teal"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Settings className="size-4" />
                  Settings
                </Link>
              </li>
            </ul>

            <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3">
              <Avatar className="size-8">
                <AvatarImage src={displayAvatar ?? undefined} />
                <AvatarFallback className="bg-neo-teal/10 text-xs text-neo-teal">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {isCompany ? user.companyName : user.email}
                </p>
              </div>
              <LogoutLink className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <LogOut className="size-4" />
              </LogoutLink>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with top padding for fixed navbar */}
      <main className="px-4 pt-24 pb-8 sm:px-6 md:pt-28 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
