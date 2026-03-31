"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Shield,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/string-utils";

type AdminUser = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Users", href: "/admin/users", icon: Users },
];

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = getInitials(user.name);

  const sidebarWidth = collapsed ? "w-[68px]" : "w-60";

  return (
    <div className="min-h-screen">
      {/* ── Desktop sidebar ────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-amber-500/10 bg-background transition-all duration-300 md:flex",
          sidebarWidth,
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border/50 px-4">
          <Image
            src="/brandings/logo-icon.svg"
            alt="NEO ID"
            width={24}
            height={22}
            className="h-[22px] w-auto shrink-0"
          />
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-sm font-bold tracking-tight whitespace-nowrap">
                NEO <span className="text-neo-teal">ID</span>
              </span>
              <span className="flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-500">
                <Shield className="size-2.5" />
                Admin
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-amber-500/10 font-medium text-amber-500"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + collapse toggle */}
        <div className="border-t border-border/50 p-3">
          {!collapsed && (
            <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-1.5">
              <Avatar className="size-7">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-amber-500/10 text-[10px] text-amber-500">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{user.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <div className={cn("flex gap-1", collapsed ? "flex-col items-center" : "")}>
            <LogoutLink
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
            >
              <LogOut className="size-4 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </LogoutLink>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="size-4 shrink-0" />
              ) : (
                <ChevronLeft className="size-4 shrink-0" />
              )}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ─────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 md:hidden">
        <div className="flex h-14 items-center justify-between border-b border-amber-500/10 bg-background/95 px-4 backdrop-blur-xl">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/brandings/logo-icon.svg"
              alt="NEO ID"
              width={24}
              height={22}
              className="h-[22px] w-auto"
            />
            <span className="text-sm font-bold tracking-tight">
              NEO <span className="text-neo-teal">ID</span>
            </span>
            <span className="flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-500">
              <Shield className="size-2.5" />
              Admin
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={cn(
            "overflow-hidden border-b border-amber-500/10 bg-background/95 backdrop-blur-xl transition-all duration-300",
            mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="space-y-1 px-4 pb-4 pt-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-amber-500/10 font-medium text-amber-500"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-2 flex items-center gap-3 border-t border-border/50 pt-3">
              <Avatar className="size-7">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-amber-500/10 text-[10px] text-amber-500">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{user.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
              </div>
              <LogoutLink className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <LogOut className="size-4" />
              </LogoutLink>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────── */}
      <main
        className={cn(
          "min-h-screen pt-14 transition-all duration-300 md:pt-0",
          collapsed ? "md:pl-[68px]" : "md:pl-60",
        )}
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
