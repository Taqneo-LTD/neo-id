import { requireOnboarded } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { EmployeeManagement } from "@/components/company/employee-management";
import { InviteHistory } from "@/components/company/invite-history";
import { PageHeader } from "@/components/shared/page-header";

export default async function EmployeesPage() {
  const user = await requireOnboarded();

  if (user.accountType !== "COMPANY" || !user.companyId) {
    redirect("/dashboard");
  }

  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    redirect("/company");
  }

  const company = await db.company.findUnique({
    where: { id: user.companyId },
    include: { plan: true },
  });

  if (!company) redirect("/dashboard");

  const employees = await db.user.findMany({
    where: { companyId: company.id },
    orderBy: [
      { role: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      onboarded: true,
      createdAt: true,
      _count: { select: { profiles: true } },
    },
  });

  // Fetch invites for OWNER
  let invites: {
    id: string;
    token: string;
    label: string | null;
    expiresAt: string;
    usedAt: string | null;
    createdAt: string;
    usedBy: { name: string; email: string } | null;
  }[] = [];

  if (user.role === "OWNER") {
    const rawInvites = await db.invite.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        token: true,
        label: true,
        expiresAt: true,
        usedAt: true,
        createdAt: true,
        usedBy: { select: { name: true, email: true } },
      },
    });
    invites = rawInvites.map((inv) => ({
      ...inv,
      expiresAt: inv.expiresAt.toISOString(),
      usedAt: inv.usedAt?.toISOString() ?? null,
      createdAt: inv.createdAt.toISOString(),
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Manage your team members and their roles" />

      <EmployeeManagement
        employees={employees.map((e) => ({
          id: e.id,
          name: e.name,
          email: e.email,
          avatarUrl: e.avatarUrl,
          role: e.role,
          onboarded: e.onboarded,
          profileCount: e._count.profiles,
          createdAt: e.createdAt.toISOString(),
        }))}
        currentUserId={user.id}
        companyName={company.nameEn}
        maxSeats={company.maxSeats}
        planName={company.plan?.name ?? "No Plan"}
      />

      {user.role === "OWNER" && invites.length > 0 && (
        <InviteHistory invites={invites} />
      )}
    </div>
  );
}
