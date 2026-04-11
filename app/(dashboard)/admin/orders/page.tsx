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
import { OrderStatusBadge, FreeServeBadge } from "@/components/order/order-status-badge";
import { formatDate } from "@/lib/date-format";
import type { OrderStatus } from "@/types";

const STATUS_TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Awaiting Contact", value: "PENDING_CONTACT" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Free Serve", value: "FREE_SERVE" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requirePlatformAdmin();

  const params = await searchParams;
  const statusFilter = params.status ?? "ALL";
  const searchQuery = params.q ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (statusFilter === "FREE_SERVE") {
    // Special: show ALL orders that were ever free-served, regardless of current status
    where.isFreeServe = true;
  } else if (statusFilter !== "ALL") {
    where.status = statusFilter as OrderStatus;
  }

  if (searchQuery) {
    where.OR = [
      { id: { contains: searchQuery, mode: "insensitive" } },
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
    ];
  }

  const orders = await db.order.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { cards: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage all platform orders"
      />

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value === "ALL"
                ? `/admin/orders${searchQuery ? `?q=${searchQuery}` : ""}`
                : `/admin/orders?status=${tab.value}${searchQuery ? `&q=${searchQuery}` : ""}`
            }
            className={
              statusFilter === tab.value
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
          placeholder="Search by order ID, name, or email..."
          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
        />
        {statusFilter !== "ALL" && (
          <input type="hidden" name="status" value={statusFilter} />
        )}
        <button
          type="submit"
          className="h-9 rounded-lg bg-amber-500/10 px-4 text-xs font-medium text-amber-500 transition-colors hover:bg-amber-500/20"
        >
          Search
        </button>
      </form>

      {/* Orders table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Cards</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                // For PENDING_CONTACT with 0 cards, show intended count from metadata
                const cardCount = order._count.cards > 0
                  ? order._count.cards
                  : (order.metadata as Record<string, unknown>)?.profileId ? 1 : 0;

                return (
                  <TableRow key={order.id} className="group">
                    <TableCell className="py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-amber-500"
                      >
                        {order.id.slice(0, 12)}...
                      </Link>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{order.user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{order.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden py-3 sm:table-cell">
                      <Badge
                        variant={order._count.cards > 0 ? "secondary" : "outline"}
                        className={order._count.cards === 0 && cardCount > 0 ? "border-amber-500/30 text-amber-500" : ""}
                      >
                        {cardCount} {cardCount === 1 ? "card" : "cards"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-sm font-bold tabular-nums">
                        {Number(order.totalAmount).toLocaleString()}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">SAR</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <OrderStatusBadge status={order.status} />
                        {order.isFreeServe && order.status !== "FREE_SERVE" && (
                          <FreeServeBadge />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden py-3 text-xs text-muted-foreground sm:table-cell">
                      {formatDate(order.createdAt.toISOString())}
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
