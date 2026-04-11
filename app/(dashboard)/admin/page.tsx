import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Building2,
  DollarSign,
  Package,
  PhoneCall,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { formatDate } from "@/lib/date-format";
import type { OrderStatus } from "@/types";

export default async function AdminPage() {
  await requirePlatformAdmin();

  const [
    totalUsers,
    totalCompanies,
    totalOrders,
    revenueResult,
    pendingContactCount,
    ordersByStatus,
    recentOrders,
  ] = await Promise.all([
    db.user.count(),
    db.company.count(),
    db.order.count(),
    db.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { totalAmount: true },
    }),
    db.order.count({ where: { status: "PENDING_CONTACT" } }),
    db.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const totalRevenue = Number(revenueResult._sum.totalAmount ?? 0);

  const statusCounts: Record<string, number> = {};
  for (const group of ordersByStatus) {
    statusCounts[group.status] = group._count.id;
  }

  const allStatuses: OrderStatus[] = [
    "PENDING",
    "PENDING_CONTACT",
    "PAID",
    "FREE_SERVE",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Panel"
        description="Platform overview and management"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">SAR</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Awaiting Contact alert */}
      {pendingContactCount > 0 && (
        <Link href="/admin/orders?status=PENDING_CONTACT" className="block">
          <Card className="border-amber-500/30 bg-amber-500/[0.03] transition-colors hover:border-amber-500/50">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
                <PhoneCall className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {pendingContactCount} order{pendingContactCount !== 1 ? "s" : ""} awaiting contact
                </p>
                <p className="text-xs text-muted-foreground">
                  Customers submitted orders without paying. Click to view and follow up.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Orders by status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {allStatuses.map((status) => (
              <div
                key={status}
                className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2"
              >
                <OrderStatusBadge status={status} />
                <span className="text-lg font-bold tabular-nums">
                  {statusCounts[status] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
          <Link
            href="/admin/orders"
            className="text-xs text-neo-teal hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 transition-colors hover:border-neo-teal/30 hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {order.user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold tabular-nums">
                      {Number(order.totalAmount).toLocaleString()} SAR
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <span className="ml-3 hidden text-xs text-muted-foreground sm:block">
                    {formatDate(order.createdAt.toISOString())}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
