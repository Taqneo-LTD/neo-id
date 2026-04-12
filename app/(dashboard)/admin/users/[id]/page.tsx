import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge, CardStatusBadge, FreeServeBadge } from "@/components/order/order-status-badge";
import {
  EditUserDialog,
  ChangeRoleDialog,
  AssignPlanDialog,
  DeleteUserDialog,
} from "@/components/admin/user-edit-dialogs";
import {
  EditCompanyDialog,
  AssignCompanyPlanDialog,
  OverrideSeatsDialog,
  RemoveEmployeeDialog,
  DeleteCompanyDialog,
} from "@/components/admin/company-edit-dialogs";
import { formatDate } from "@/lib/date-format";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Globe,
  Mail,
  Phone,
  Shield,
  User,
  Users,
} from "lucide-react";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePlatformAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      plan: { select: { id: true, name: true, tier: true } },
      company: {
        include: {
          plan: { select: { id: true, name: true, tier: true, maxSeats: true } },
          _count: { select: { employees: true } },
        },
      },
      profiles: {
        select: {
          id: true,
          slug: true,
          name: true,
          isPublished: true,
          isPlaceholder: true,
          views: true,
          taps: true,
          _count: { select: { cards: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      orders: {
        select: {
          id: true,
          status: true,
          isFreeServe: true,
          totalAmount: true,
          createdAt: true,
          _count: { select: { cards: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: { select: { profiles: true, orders: true } },
    },
  });

  if (!user) notFound();

  // Fetch all plans for assignment dialogs
  const plans = await db.plan.findMany({
    select: { id: true, name: true, tier: true, maxSeats: true },
    orderBy: { price: "asc" },
  });

  // Fetch all cards for this user's profiles
  const cards = await db.card.findMany({
    where: { profile: { userId: id } },
    include: {
      material: { select: { name: true } },
      profile: { select: { name: true, slug: true } },
      order: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch company employees if company user
  const employees = user.company
    ? await db.user.findMany({
        where: { companyId: user.company.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          _count: { select: { profiles: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const isCompany = user.accountType === "COMPANY";
  const activePlan = isCompany ? user.company?.plan : user.plan;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <PageHeader
          title={user.name}
          description={user.email}
        />
      </div>

      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-2">
        <EditUserDialog
          userId={user.id}
          current={{ name: user.name, nameAr: user.nameAr, email: user.email, phone: user.phone }}
        />
        <DeleteUserDialog
          userId={user.id}
          userName={user.name}
          counts={{ profiles: user._count.profiles, orders: user._count.orders }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-1">
          {/* User info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">User Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-3.5 text-muted-foreground" />
                <span className="font-medium">{user.name}</span>
                {user.nameAr && <span className="text-muted-foreground" dir="rtl">({user.nameAr})</span>}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-3.5" />
                <a href={`mailto:${user.email}`} className="hover:text-amber-500">{user.email}</a>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />
                  <a href={`tel:${user.phone}`} className="hover:text-amber-500">{user.phone}</a>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                {isCompany ? (
                  <><Building2 className="size-3.5 text-muted-foreground" /><span>Company</span></>
                ) : (
                  <><User className="size-3.5 text-muted-foreground" /><span>Individual</span></>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="size-3.5 text-muted-foreground" />
                <span>{user.role}</span>
                <ChangeRoleDialog userId={user.id} currentRole={user.role} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="size-3.5 text-muted-foreground" />
                <span>{activePlan?.name ?? "Free"}</span>
                {!isCompany && (
                  <AssignPlanDialog userId={user.id} currentPlanId={user.planId} plans={plans} />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>Joined {formatDate(user.createdAt.toISOString())}</span>
              </div>
            </CardContent>
          </Card>

          {/* Company info (if company user) */}
          {isCompany && user.company && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Company</CardTitle>
                <EditCompanyDialog
                  companyId={user.company.id}
                  current={{
                    nameEn: user.company.nameEn,
                    nameAr: user.company.nameAr,
                    crNumber: user.company.crNumber,
                    website: user.company.website,
                  }}
                />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  <span className="font-medium">{user.company.nameEn}</span>
                  {user.company.nameAr && <span className="text-muted-foreground" dir="rtl">({user.company.nameAr})</span>}
                </div>
                {user.company.crNumber && (
                  <p className="text-xs text-muted-foreground">CR: {user.company.crNumber}</p>
                )}
                {user.company.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="size-3.5" />
                    <a href={user.company.website} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500">{user.company.website}</a>
                  </div>
                )}
                <Separator />
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="size-3.5 text-muted-foreground" />
                  <span>{user.company.plan?.name ?? "Free"}</span>
                  <AssignCompanyPlanDialog companyId={user.company.id} currentPlanId={user.company.planId} plans={plans} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span>{user.company._count.employees}/{user.company.maxSeats} seats</span>
                  <OverrideSeatsDialog companyId={user.company.id} currentSeats={user.company.maxSeats} />
                </div>
                <Separator />
                <DeleteCompanyDialog
                  companyId={user.company.id}
                  companyName={user.company.nameEn}
                  employeeCount={user.company._count.employees}
                />
              </CardContent>
            </Card>
          )}

          {/* Employees (if company user) */}
          {isCompany && user.company && employees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Employees ({employees.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employees.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <Link href={`/admin/users/${emp.id}`} className="text-sm font-medium hover:text-amber-500">
                          {emp.name}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{emp.role}</Badge>
                        <span className="text-xs text-muted-foreground">{emp._count.profiles} IDs</span>
                        {emp.id !== user.id && (
                          <RemoveEmployeeDialog
                            userId={emp.id}
                            companyId={user.company!.id}
                            employeeName={emp.name}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — tabbed via anchor sections */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profiles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Profiles ({user.profiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {user.profiles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No profiles yet.</p>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profile</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead className="hidden sm:table-cell">Cards</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="py-2">
                            <p className="text-sm font-medium">{profile.name ?? profile.slug}</p>
                            <p className="font-mono text-xs text-muted-foreground">/p/{profile.slug}</p>
                          </TableCell>
                          <TableCell className="hidden py-2 sm:table-cell">
                            {profile.isPlaceholder ? (
                              <Badge variant="outline" className="text-[10px]">Placeholder</Badge>
                            ) : profile.isPublished ? (
                              <Badge variant="default" className="text-[10px]">Published</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-sm tabular-nums text-muted-foreground">
                            {profile.views}
                          </TableCell>
                          <TableCell className="hidden py-2 text-sm tabular-nums text-muted-foreground sm:table-cell">
                            {profile._count.cards}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Orders ({user.orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {user.orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.orders.map((order) => (
                        <TableRow key={order.id} className="group">
                          <TableCell className="py-2">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-amber-500"
                            >
                              {order.id.slice(0, 12)}...
                            </Link>
                          </TableCell>
                          <TableCell className="py-2">
                            <span className="text-sm font-bold tabular-nums">
                              {Number(order.totalAmount).toLocaleString()}
                            </span>
                            <span className="ml-1 text-xs text-muted-foreground">SAR</span>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <OrderStatusBadge status={order.status} />
                              {order.isFreeServe && order.status !== "FREE_SERVE" && <FreeServeBadge />}
                            </div>
                          </TableCell>
                          <TableCell className="hidden py-2 text-xs text-muted-foreground sm:table-cell">
                            {formatDate(order.createdAt.toISOString())}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Cards ({cards.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cards yet.</p>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profile</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">NFC ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cards.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell className="py-2">
                            <p className="text-sm font-medium">{card.profile.name ?? card.profile.slug}</p>
                            <p className="font-mono text-xs text-muted-foreground">/p/{card.profile.slug}</p>
                          </TableCell>
                          <TableCell className="py-2 text-sm text-muted-foreground">
                            {card.material?.name ?? "—"}
                          </TableCell>
                          <TableCell className="py-2">
                            <CardStatusBadge status={card.status} />
                          </TableCell>
                          <TableCell className="hidden py-2 font-mono text-xs text-muted-foreground sm:table-cell">
                            {card.nfcId ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
