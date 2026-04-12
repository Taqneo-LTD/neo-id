import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/date-format";
import {
  Building2,
  CreditCard,
  User,
  Users,
} from "lucide-react";

const ACCOUNT_TABS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Individual", value: "INDIVIDUAL" },
  { label: "Company", value: "COMPANY" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  await requirePlatformAdmin();

  const params = await searchParams;
  const typeFilter = params.type ?? "ALL";
  const searchQuery = params.q ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (typeFilter !== "ALL") {
    where.accountType = typeFilter;
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const [users, totalUsers, totalCompanies, totalIndividuals] =
    await Promise.all([
      db.user.findMany({
        where,
        include: {
          company: {
            select: {
              nameEn: true,
              maxSeats: true,
              plan: { select: { name: true, tier: true } },
              _count: { select: { employees: true } },
            },
          },
          plan: { select: { name: true, tier: true } },
          _count: { select: { profiles: true, orders: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.user.count(),
      db.user.count({ where: { accountType: "COMPANY" } }),
      db.user.count({ where: { accountType: "INDIVIDUAL" } }),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="All users and companies on the platform"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium">Total Users</CardTitle>
            <Users className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium">Individuals</CardTitle>
            <User className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalIndividuals}</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium">Companies</CardTitle>
            <Building2 className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalCompanies}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {ACCOUNT_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value === "ALL"
                ? `/admin/users${searchQuery ? `?q=${searchQuery}` : ""}`
                : `/admin/users?type=${tab.value}${searchQuery ? `&q=${searchQuery}` : ""}`
            }
            className={
              typeFilter === tab.value
                ? "rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500"
                : "rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          name="q"
          type="text"
          defaultValue={searchQuery}
          placeholder="Search by name or email..."
          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
        />
        {typeFilter !== "ALL" && (
          <input type="hidden" name="type" value={typeFilter} />
        )}
        <button
          type="submit"
          className="h-9 rounded-lg bg-amber-500/10 px-4 text-xs font-medium text-amber-500 transition-colors hover:bg-amber-500/20"
        >
          Search
        </button>
      </form>

      {/* Users table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Plan</TableHead>
              <TableHead className="hidden sm:table-cell">Profiles</TableHead>
              <TableHead className="hidden md:table-cell">Orders</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const isCompany = u.accountType === "COMPANY";
                const plan = isCompany
                  ? u.company?.plan
                  : u.plan;
                const planName = plan?.name ?? "Free";

                return (
                  <TableRow key={u.id} className="group">
                    <TableCell className="py-3">
                      <Link href={`/admin/users/${u.id}`} className="block min-w-0">
                        <p className="truncate text-sm font-medium transition-colors group-hover:text-amber-500">
                          {u.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                        {/* Company info inline on mobile */}
                        {isCompany && u.company && (
                          <div className="mt-1 flex items-center gap-1.5 sm:hidden">
                            <Building2 className="size-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">
                              {u.company.nameEn}
                            </span>
                          </div>
                        )}
                      </Link>
                    </TableCell>

                    <TableCell className="hidden py-3 sm:table-cell">
                      {isCompany ? (
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className="gap-1 text-[10px]"
                          >
                            <Building2 className="size-2.5" />
                            Company
                          </Badge>
                          {u.company && (
                            <div className="space-y-0.5">
                              <p className="truncate text-xs font-medium">
                                {u.company.nameEn}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {u.company._count.employees}/{u.company.maxSeats} seats
                                <span className="mx-1 text-border">&middot;</span>
                                {u.role}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 text-[10px]"
                        >
                          <User className="size-2.5" />
                          Individual
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="hidden py-3 md:table-cell">
                      <Badge variant="secondary" className="text-[10px]">
                        {planName}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden py-3 sm:table-cell">
                      <span className="flex items-center gap-1 text-sm tabular-nums">
                        <CreditCard className="size-3 text-muted-foreground" />
                        {u._count.profiles}
                      </span>
                    </TableCell>

                    <TableCell className="hidden py-3 md:table-cell">
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {u._count.orders}
                      </span>
                    </TableCell>

                    <TableCell className="hidden py-3 text-xs text-muted-foreground lg:table-cell">
                      {formatDate(u.createdAt.toISOString())}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
