import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreateProfileForm } from "@/components/profile/create-profile-form";
import { NeoIdLimitReachedCard } from "@/components/shared/neo-id-cards";
import { PageHeader } from "@/components/shared/page-header";
import { requireOnboarded } from "@/lib/auth";
import { checkProfileLimit } from "@/lib/plan-limits";
import { db } from "@/lib/db";

export default async function NewProfilePage() {
  const user = await requireOnboarded();
  const limit = await checkProfileLimit(user.id);

  // OWNER can create profiles for employees who don't have one yet
  const isOwner =
    user.accountType === "COMPANY" &&
    user.role === "OWNER" &&
    !!user.companyId;

  let employeesWithoutProfile: { id: string; name: string; email: string; avatarUrl: string | null }[] = [];
  if (isOwner) {
    const employees = await db.user.findMany({
      where: {
        companyId: user.companyId!,
        id: { not: user.id },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        _count: { select: { profiles: true } },
      },
    });
    employeesWithoutProfile = employees
      .filter((e) => e._count.profiles === 0)
      .map((e) => ({ id: e.id, name: e.name, email: e.email, avatarUrl: e.avatarUrl }));
  }

  if (!limit.allowed) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <PageHeader title="New Profile" description="Create a new digital business card" />

        <NeoIdLimitReachedCard
          current={limit.current}
          limit={limit.limit}
          planName={limit.planName}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader title="New Profile" description="Create a new digital business card" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Details</CardTitle>
          <CardDescription>
            You can update these anytime after creating
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <CreateProfileForm
            employeesWithoutProfile={
              isOwner && employeesWithoutProfile.length > 0
                ? employeesWithoutProfile
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
