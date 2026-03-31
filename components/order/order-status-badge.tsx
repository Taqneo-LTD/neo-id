import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Loader2,
  PackageCheck,
  PhoneCall,
  Printer,
  Truck,
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
  PROCESSING: { label: "Processing", variant: "secondary", icon: Loader2 },
  SHIPPED: { label: "Shipped", variant: "secondary", icon: Truck },
  DELIVERED: { label: "Delivered", variant: "default", icon: PackageCheck },
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
