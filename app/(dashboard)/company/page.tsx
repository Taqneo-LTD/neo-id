import { requireOnboarded } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CompanyEditor } from "@/components/company/company-editor";

export default async function CompanyPage() {
  const user = await requireOnboarded();

  if (user.accountType !== "COMPANY" || !user.companyId) {
    redirect("/dashboard");
  }

  const company = await db.company.findUnique({
    where: { id: user.companyId },
    include: { plan: true },
  });

  if (!company) redirect("/dashboard");

  const employeeCount = await db.user.count({
    where: { companyId: company.id },
  });

  return (
    <div className="space-y-6">
      <CompanyEditor
        company={{
          id: company.id,
          nameEn: company.nameEn,
          nameAr: company.nameAr,
          crNumber: company.crNumber,
          logo: company.logo,
          website: company.website,
          brandColors: company.brandColors as { primary: string; secondary: string; accent: string } | null,
          planName: company.plan?.name ?? "Free",
          maxSeats: company.maxSeats,
          currentSeats: employeeCount,
        }}
        isOwner={user.role === "OWNER"}
      />
    </div>
  );
}
