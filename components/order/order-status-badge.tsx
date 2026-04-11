import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Gift,
  Loader2,
  PackageCheck,
  PhoneCall,
  Printer,
  Truck,
  XCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardStatus, OrderStatus } from "@/types";

const orderStatusConfig: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline";
    icon: typeof Clock;
    className?: string;
  }
> = {
  PENDING: { label: "Pending", variant: "outline", icon: Clock },
  PENDING_CONTACT: { label: "Awaiting Contact", variant: "outline", icon: PhoneCall, className: "border-amber-500/40 text-amber-500 bg-amber-500/10" },
  PAID: { label: "Paid", variant: "default", icon: CheckCircle2 },
  FREE_SERVE: { label: "Free Serve", variant: "outline", icon: Gift, className: "border-emerald-500/40 text-emerald-500 bg-emerald-500/10" },
  PROCESSING: { label: "Processing", variant: "secondary", icon: Loader2 },
  SHIPPED: { label: "Shipped", variant: "secondary", icon: Truck },
  DELIVERED: { label: "Delivered", variant: "default", icon: PackageCheck },
  CANCELLED: { label: "Cancelled", variant: "outline", icon: XCircle, className: "border-red-500/40 text-red-500 bg-red-500/10" },
};

const cardStatusConfig: Record<
  CardStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline";
    icon: typeof Clock;
  }
> = {
  PENDING: { label: "Pending", variant: "outline", icon: Clock },
  PRINTING: { label: "Printing", variant: "secondary", icon: Printer },
  SHIPPED: { label: "Shipped", variant: "secondary", icon: Truck },
  DELIVERED: { label: "Delivered", variant: "default", icon: PackageCheck },
  ACTIVE: { label: "Active", variant: "default", icon: Zap },
  CANCELLED: { label: "Cancelled", variant: "outline", icon: XCircle },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = orderStatusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className={cn("gap-1 text-xs", config.className)}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

export function FreeServeBadge() {
  return (
    <Badge variant="outline" className="gap-1 text-xs border-emerald-500/40 text-emerald-500 bg-emerald-500/10">
      <Gift className="size-3" />
      Free
    </Badge>
  );
}

export function CardStatusBadge({ status }: { status: CardStatus }) {
  const config = cardStatusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="gap-1 text-xs">
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}
