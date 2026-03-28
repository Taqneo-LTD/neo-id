"use client";

import { createContext, useContext } from "react";

export type DashboardUser = {
  name: string;
  email: string;
  avatarUrl: string | null;
  profileAvatarUrl: string | null;
  accountType: string;
  role: string;
  companyName?: string | null;
};

const DashboardContext = createContext<DashboardUser | null>(null);

export function DashboardProvider({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  return (
    <DashboardContext.Provider value={user}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardUser() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardUser must be used within DashboardProvider");
  return ctx;
}
