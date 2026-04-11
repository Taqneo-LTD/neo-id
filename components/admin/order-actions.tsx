"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Gift,
  Loader2,
  Package,
  Truck,
} from "lucide-react";
import { updateOrderStatus } from "@/actions/admin";

type ActionConfig = {
  label: string;
  value: string;
  icon: typeof CheckCircle2;
  description: string;
  color?: "amber" | "emerald";
};

const NEXT_ACTIONS: Record<string, ActionConfig[]> = {
  PENDING_CONTACT: [
    {
      label: "Mark as Paid",
      value: "PAID",
      icon: CheckCircle2,
      description: "Confirm that payment has been collected offline. This will create the card records for this order.",
      color: "amber",
    },
    {
      label: "Free Serve",
      value: "FREE_SERVE",
      icon: Gift,
      description: "Mark as a promotional/VIP order. Cards will be created without requiring payment.",
      color: "emerald",
    },
  ],
  PENDING: [
    {
      label: "Mark as Paid",
      value: "PAID",
      icon: CheckCircle2,
      description: "Confirm this order has been paid.",
      color: "amber",
    },
    {
      label: "Free Serve",
      value: "FREE_SERVE",
      icon: Gift,
      description: "Mark as a promotional/VIP order. Cards will be created without requiring payment.",
      color: "emerald",
    },
  ],
  PAID: [
    {
      label: "Dispatch to Vendor",
      value: "PROCESSING",
      icon: Package,
      description: "Mark this order as dispatched to the card vendor for production.",
      color: "amber",
    },
  ],
  FREE_SERVE: [
    {
      label: "Dispatch to Vendor",
      value: "PROCESSING",
      icon: Package,
      description: "Mark this free/promo order as dispatched to the card vendor for production.",
      color: "amber",
    },
  ],
  PROCESSING: [
    {
      label: "Mark as Shipped",
      value: "SHIPPED",
      icon: Truck,
      description: "Mark this order as shipped. A tracking number is required.",
      color: "amber",
    },
  ],
  SHIPPED: [
    {
      label: "Mark as Delivered",
      value: "DELIVERED",
      icon: CheckCircle2,
      description: "Confirm the cards have been delivered to the customer.",
      color: "amber",
    },
  ],
};

const COLOR_STYLES = {
  amber: {
    trigger: "border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400",
    confirm: "bg-amber-500 text-black hover:bg-amber-400",
  },
  emerald: {
    trigger: "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400",
    confirm: "bg-emerald-500 text-black hover:bg-emerald-400",
  },
};

function ActionButton({
  orderId,
  action,
}: {
  orderId: string;
  action: ActionConfig;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingNo, setTrackingNo] = useState("");
  const [vendorNotes, setVendorNotes] = useState("");

  const needsTracking = action.value === "SHIPPED";
  const showVendorNotes = action.value === "PROCESSING";
  const styles = COLOR_STYLES[action.color ?? "amber"];
  const Icon = action.icon;

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    const result = await updateOrderStatus(
      orderId,
      action.value,
      needsTracking ? trackingNo : undefined,
      showVendorNotes ? vendorNotes : undefined,
    );

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={styles.trigger}>
          <Icon className="mr-2 size-4" />
          {action.label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action.label}</DialogTitle>
          <DialogDescription>{action.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {needsTracking && (
            <div className="space-y-2">
              <label htmlFor="tracking" className="text-sm font-medium">
                Tracking Number <span className="text-destructive">*</span>
              </label>
              <Input
                id="tracking"
                placeholder="e.g. SMSA-123456789"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
              />
            </div>
          )}

          {showVendorNotes && (
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Vendor Notes <span className="text-xs text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="notes"
                placeholder="Vendor reference number, special instructions..."
                value={vendorNotes}
                onChange={(e) => setVendorNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || (needsTracking && !trackingNo.trim())}
            className={styles.confirm}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icon className="mr-2 size-4" />
                Confirm
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function OrderActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const actions = NEXT_ACTIONS[currentStatus];

  if (!actions || actions.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => (
        <ActionButton key={action.value} orderId={orderId} action={action} />
      ))}
    </div>
  );
}
