import { requireOnboarded } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardProvider } from "@/components/providers/dashboard-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboarded();

  // Single query: get the first profile's avatar (if any)
  const firstProfile = await db.profile.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { avatarUrl: true },
  });

  return (
    <DashboardProvider
      user={{
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        profileAvatarUrl: firstProfile?.avatarUrl ?? null,
        accountType: user.accountType,
        role: user.role,
        companyName: user.company?.nameEn,
      }}
    >
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
