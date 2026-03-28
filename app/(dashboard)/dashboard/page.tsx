import { requireOnboarded } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreditCard, Eye, UserCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateNeoIdCard } from "@/components/shared/neo-id-cards";
import { PageHeader } from "@/components/shared/page-header";

export default async function DashboardPage() {
  const user = await requireOnboarded();

  const [profileCount, totalViews] = await Promise.all([
    db.profile.count({ where: { userId: user.id } }),
    db.profile.aggregate({
      where: { userId: user.id },
      _sum: { views: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's an overview of your NEO ID account."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profiles</CardTitle>
            <UserCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews._sum.views ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cards Ordered</CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state / Quick actions */}
      {profileCount === 0 && (
        <CreateNeoIdCard
          label="Create your first NEO ID"
          sublabel="Set up your digital business card and start sharing it instantly"
          className="block"
        />
      )}
    </div>
  );
}
