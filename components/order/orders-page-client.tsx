"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  ChevronRight,
  Hash,
  MapPin,
  Package,
  Phone,
  PhoneCall,
  ShoppingBag,
  Truck,
  Wifi,
  Zap,
} from "lucide-react";
import { formatDate } from "@/lib/date-format";
import { getInitials } from "@/lib/string-utils";
import { OrderStatusBadge, CardStatusBadge } from "./order-status-badge";
import { CreateNeoIdCard } from "@/components/shared/neo-id-cards";
import type { CardStatus, OrderStatus } from "@/types";

// ─── Types ───────────────────────────────────────────────

type ShippingAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
};

export type OrderItem = {
  id: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  trackingNo: string | null;
  paymentId: string | null;
  shippingAddr: ShippingAddress;
  orderedBy: {
    name: string;
    email: string;
    avatarUrl: string | null;
    isSelf: boolean;
  };
  cards: {
    id: string;
    cardType: string;
    status: CardStatus;
    nfcId: string | null;
    materialName: string;
    materialSlug: string;
    materialFrontSvg: string;
    profileName: string | null;
    profileSlug: string;
    profileAvatarUrl: string | null;
    createdAt: string;
  }[];
  intendedCards?: {
    materialName: string;
    materialFrontSvg: string;
    profileName: string | null;
    profileSlug: string;
  }[];
};

type OrdersPageClientProps = {
  orders: OrderItem[];
  stats: {
    totalOrders: number;
    activeCards: number;
    inTransit: number;
  };
  isCompanyAdmin: boolean;
};

// ─── Main Component ──────────────────────────────────────

export function OrdersPageClient({
  orders,
  stats,
  isCompanyAdmin,
}: OrdersPageClientProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Orders"
            value={0}
            icon={<ShoppingBag className="size-4 text-muted-foreground" />}
          />
          <StatCard
            label="Active Cards"
            value={0}
            icon={<Zap className="size-4 text-muted-foreground" />}
          />
          <StatCard
            label="In Transit"
            value={0}
            icon={<Truck className="size-4 text-muted-foreground" />}
          />
        </div>
        <CreateNeoIdCard
          label="Order your first card"
          sublabel="Get a physical NFC card linked to your NEO ID profile"
          href="/neo-card"
          className="block"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingBag className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="Active Cards"
          value={stats.activeCards}
          icon={<Zap className="size-4 text-muted-foreground" />}
        />
        <StatCard
          label="In Transit"
          value={stats.inTransit}
          icon={<Truck className="size-4 text-muted-foreground" />}
        />
      </div>

      {/* Orders Table */}
      <Card className="pb-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="size-5 text-neo-teal" />
            Order History
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Order</TableHead>
                {isCompanyAdmin && (
                  <TableHead className="hidden sm:table-cell">
                    Ordered By
                  </TableHead>
                )}
                <TableHead className="hidden sm:table-cell">Cards</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10 pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const isExpanded = expandedIds.has(order.id);
                return (
                  <OrderRow
                    key={order.id}
                    order={order}
                    isExpanded={isExpanded}
                    isCompanyAdmin={isCompanyAdmin}
                    onToggle={() => toggleExpand(order.id)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// ─── Order Row ───────────────────────────────────────────

function OrderRow({
  order,
  isExpanded,
  isCompanyAdmin,
  onToggle,
}: {
  order: OrderItem;
  isExpanded: boolean;
  isCompanyAdmin: boolean;
  onToggle: () => void;
}) {
  const Chevron = isExpanded ? ChevronDown : ChevronRight;

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={onToggle}
      >
        {/* Order ID + Date + mini card stack */}
        <TableCell className="py-3 pl-4">
          <div className="flex items-center gap-3">
            <MiniCardStack cards={order.cards} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium font-mono">
                #{order.id.slice(-7)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </TableCell>

        {/* Ordered By */}
        {isCompanyAdmin && (
          <TableCell className="hidden py-3 sm:table-cell">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={order.orderedBy.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-neo-teal/10 text-[9px] text-neo-teal">
                  {getInitials(order.orderedBy.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {order.orderedBy.name}
                  {order.orderedBy.isSelf && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </TableCell>
        )}

        {/* Cards count */}
        <TableCell className="hidden py-3 sm:table-cell">
          {order.cards.length > 0 ? (
            <Badge variant="secondary" className="text-xs">
              {order.cards.length} {order.cards.length === 1 ? "card" : "cards"}
            </Badge>
          ) : order.intendedCards && order.intendedCards.length > 0 ? (
            <Badge variant="outline" className="border-amber-500/30 text-xs text-amber-500">
              {order.intendedCards.length} {order.intendedCards.length === 1 ? "card" : "cards"}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">0 cards</Badge>
          )}
        </TableCell>

        {/* Total */}
        <TableCell className="py-3">
          <span className="text-sm font-medium tabular-nums">
            {order.totalAmount.toFixed(2)}{" "}
            <span className="text-xs text-muted-foreground">
              {order.currency}
            </span>
          </span>
        </TableCell>

        {/* Status */}
        <TableCell className="py-3">
          <OrderStatusBadge status={order.status} />
        </TableCell>

        {/* Chevron */}
        <TableCell className="py-3 pr-4">
          <Chevron className="size-4 text-muted-foreground transition-transform" />
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow>
          <TableCell
            colSpan={isCompanyAdmin ? 6 : 5}
            className="bg-muted/30 p-0"
          >
            <ExpandedOrderDetails order={order} isCompanyAdmin={isCompanyAdmin} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Mini Card Stack (inline SVG thumbnails) ─────────────

function MiniCardStack({
  cards,
}: {
  cards: OrderItem["cards"];
}) {
  // Show up to 3 stacked mini card thumbnails
  const visible = cards.slice(0, 3);
  const extra = cards.length - 3;

  return (
    <div className="relative flex h-8 w-12 shrink-0 items-center">
      {visible.map((card, i) => (
        <div
          key={card.id}
          className="absolute overflow-hidden rounded-[3px] shadow-sm ring-1 ring-border/50"
          style={{
            width: 40,
            left: i * 6,
            zIndex: visible.length - i,
            transform: `rotate(${(i - 1) * 4}deg)`,
          }}
        >
          <Image
            src={card.materialFrontSvg}
            alt={card.materialName}
            width={1025}
            height={593}
            className="block h-auto w-full"
          />
        </div>
      ))}
      {extra > 0 && (
        <span className="absolute -right-1 -bottom-1 z-10 flex size-4 items-center justify-center rounded-full bg-neo-teal text-[8px] font-bold text-white">
          +{extra}
        </span>
      )}
    </div>
  );
}

// ─── Expanded Details ────────────────────────────────────

function ExpandedOrderDetails({
  order,
  isCompanyAdmin,
}: {
  order: OrderItem;
  isCompanyAdmin: boolean;
}) {
  const addr = order.shippingAddr;

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6">
      {/* Cards grid */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {order.cards.length > 0 ? "Cards in this order" : "Intended order"}
        </p>

        {/* Intended cards for PENDING_CONTACT orders with no cards created yet */}
        {order.cards.length === 0 && order.intendedCards && order.intendedCards.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {order.intendedCards.map((item, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-3"
              >
                <div className="relative w-24 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.materialFrontSvg}
                    alt={item.materialName}
                    width={1025}
                    height={593}
                    className="block h-full w-full"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {item.profileName ?? "NEO ID"}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <span>{item.materialName}</span>
                      <span className="text-border">&middot;</span>
                      <Link
                        href={`/p/${item.profileSlug}`}
                        className="text-neo-teal hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        /p/{item.profileSlug}
                      </Link>
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 text-xs text-amber-500">
                      <PhoneCall className="size-3" />
                      Awaiting Contact
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {order.cards.length === 0 && (!order.intendedCards || order.intendedCards.length === 0) && (
          <p className="text-sm text-muted-foreground">No cards in this order yet.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {order.cards.map((card) => (
            <div
              key={card.id}
              className="group flex gap-3 rounded-xl border bg-background p-3 transition-colors hover:border-border"
            >
              {/* Card SVG thumbnail */}
              <div className="relative w-24 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={card.materialFrontSvg}
                  alt={card.materialName}
                  width={1025}
                  height={593}
                  className="block h-full w-full"
                />
              </div>

              {/* Card details */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {card.profileAvatarUrl ? (
                      <Avatar className="size-4">
                        <AvatarImage src={card.profileAvatarUrl} />
                        <AvatarFallback className="bg-neo-teal/10 text-[7px] text-neo-teal">
                          {getInitials(card.profileName ?? card.profileSlug)}
                        </AvatarFallback>
                      </Avatar>
                    ) : null}
                    <p className="truncate text-sm font-medium">
                      {card.profileName ?? "Reserved NEO ID"}
                    </p>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{card.materialName}</span>
                    <span className="text-border">·</span>
                    <Link
                      href={`/p/${card.profileSlug}`}
                      className="text-neo-teal hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      /p/{card.profileSlug}
                    </Link>
                    {card.nfcId && (
                      <>
                        <span className="text-border">·</span>
                        <span className="inline-flex items-center gap-0.5">
                          <Wifi className="size-2.5" />
                          {card.nfcId}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-1.5">
                  <CardStatusBadge status={card.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Shipping + Tracking + Payment */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Shipping address */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <MapPin className="size-3" />
            Shipping Address
          </p>
          <div className="space-y-0.5 text-sm">
            <p className="font-medium">{addr.fullName}</p>
            <p className="text-muted-foreground">{addr.addressLine1}</p>
            {addr.addressLine2 && (
              <p className="text-muted-foreground">{addr.addressLine2}</p>
            )}
            <p className="text-muted-foreground">
              {addr.city}, {addr.state} {addr.zipCode}
            </p>
            <p className="flex items-center gap-1 text-muted-foreground">
              <Phone className="size-3" />
              {addr.phone}
            </p>
          </div>
        </div>

        {/* Tracking */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Truck className="size-3" />
            Tracking
          </p>
          {order.trackingNo ? (
            <p className="text-sm font-mono">{order.trackingNo}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {order.status === "PENDING"
                ? "Awaiting payment"
                : order.status === "PENDING_CONTACT"
                  ? "Our team will contact you"
                  : order.status === "PAID" || order.status === "PROCESSING"
                    ? "Will be available once shipped"
                    : "—"}
            </p>
          )}
        </div>

        {/* Payment */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Hash className="size-3" />
            Payment
          </p>
          {order.paymentId ? (
            <p className="break-all text-sm font-mono text-muted-foreground">
              {order.paymentId}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {order.status === "PENDING" || order.status === "PENDING_CONTACT"
                ? "Not yet paid"
                : "—"}
            </p>
          )}

          {/* Company admin: show who ordered */}
          {isCompanyAdmin && (
            <div className="mt-3 flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarImage src={order.orderedBy.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-neo-teal/10 text-[8px] text-neo-teal">
                  {getInitials(order.orderedBy.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                Ordered by{" "}
                <span className="font-medium text-foreground">
                  {order.orderedBy.isSelf ? "you" : order.orderedBy.name}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
