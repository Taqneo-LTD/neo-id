import { redirect } from "next/navigation";
import { requireOnboarded } from "@/lib/auth";
import { isAdminEmail } from "@/lib/constants";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOnboarded();

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      }}
    >
      {children}
    </AdminShell>
  );
}
