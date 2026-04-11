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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Ban,
  Loader2,
  Pencil,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import {
  updateOrderDetails,
  updateOrderShipping,
  updateOrderAdminNotes,
  cancelOrder,
  deleteOrder,
  forceOrderStatus,
} from "@/actions/admin";

// ─── Edit Total ──────────────────────────────────────────

export function EditTotalDialog({
  orderId,
  currentAmount,
}: {
  orderId: string;
  currentAmount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState(String(currentAmount));

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setAmount(String(currentAmount));
      setError(null);
    }
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await updateOrderDetails(orderId, {
      totalAmount: parseFloat(amount),
    });
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
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-amber-500">
          <Pencil className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Total Amount</DialogTitle>
          <DialogDescription>Adjust the order total for discounts, corrections, or promos. Set to 0 for free orders.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="total" className="text-sm font-medium">Total Amount (SAR)</label>
            <Input
              id="total"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || isNaN(parseFloat(amount))} className="bg-amber-500 text-black hover:bg-amber-400">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Shipping ───────────────────────────────────────

export function EditShippingDialog({
  orderId,
  currentAddress,
}: {
  orderId: string;
  currentAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addr, setAddr] = useState(currentAddress);

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setAddr(currentAddress);
      setError(null);
    }
  }

  function updateField(field: string, value: string) {
    setAddr((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await updateOrderShipping(orderId, addr);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  const fields: { key: string; label: string; required: boolean }[] = [
    { key: "fullName", label: "Full Name", required: true },
    { key: "phone", label: "Phone", required: true },
    { key: "addressLine1", label: "Address Line 1", required: true },
    { key: "addressLine2", label: "Address Line 2", required: false },
    { key: "city", label: "City", required: true },
    { key: "state", label: "State / Region", required: true },
    { key: "zipCode", label: "ZIP Code", required: true },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-amber-500">
          <Pencil className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shipping Address</DialogTitle>
          <DialogDescription>Update the delivery address for this order.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          {fields.map(({ key, label, required }) => (
            <div key={key} className="space-y-1">
              <label htmlFor={key} className="text-sm font-medium">
                {label} {required && <span className="text-destructive">*</span>}
              </label>
              <Input
                id={key}
                value={(addr as Record<string, string>)[key] ?? ""}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-amber-500 text-black hover:bg-amber-400">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Tracking ───────────────────────────────────────

export function EditTrackingDialog({
  orderId,
  currentTracking,
}: {
  orderId: string;
  currentTracking: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(currentTracking ?? "");

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setTracking(currentTracking ?? "");
      setError(null);
    }
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await updateOrderDetails(orderId, { trackingNo: tracking });
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
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-amber-500">
          <Pencil className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tracking Number</DialogTitle>
          <DialogDescription>Set or update the shipping tracking number. Leave empty to clear.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="tracking" className="text-sm font-medium">Tracking Number</label>
            <Input
              id="tracking"
              placeholder="e.g. SMSA-123456789"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-amber-500 text-black hover:bg-amber-400">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Payment ID ─────────────────────────────────────

export function EditPaymentIdDialog({
  orderId,
  currentPaymentId,
}: {
  orderId: string;
  currentPaymentId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState(currentPaymentId ?? "");

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setPaymentId(currentPaymentId ?? "");
      setError(null);
    }
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await updateOrderDetails(orderId, { paymentId });
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
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-amber-500">
          <Pencil className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Payment ID</DialogTitle>
          <DialogDescription>Set or update the PayPal payment ID for offline payments or corrections.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="paymentId" className="text-sm font-medium">Payment ID</label>
            <Input
              id="paymentId"
              placeholder="e.g. PAY-1AB23456CD789012E"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-amber-500 text-black hover:bg-amber-400">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Admin Notes Editor (inline, not a dialog) ──────────

export function AdminNotesEditor({
  orderId,
  currentNotes,
}: {
  orderId: string;
  currentNotes: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(currentNotes);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanged = notes !== currentNotes;

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSaved(false);
    const result = await updateOrderAdminNotes(orderId, notes);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}
      <Textarea
        placeholder="Internal notes about this order (not visible to customer)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={loading || !hasChanged}
          className="bg-amber-500 text-black hover:bg-amber-400"
        >
          {loading ? <><Loader2 className="mr-2 size-3 animate-spin" />Saving...</> : "Save Notes"}
        </Button>
        {saved && (
          <span className="text-xs text-emerald-500">Saved</span>
        )}
      </div>
    </div>
  );
}

// ─── Cancel Order ────────────────────────────────────────

export function CancelOrderDialog({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED") return null;

  async function handleCancel() {
    setLoading(true);
    setError(null);
    const result = await cancelOrder(orderId);
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
        <Button variant="outline" size="sm" className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400">
          <Ban className="mr-2 size-3.5" />
          Cancel Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            This will set the order status to Cancelled and soft-cancel all unshipped cards. This action can be reversed using Force Status.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            Cards that have already been shipped, delivered, or activated will not be affected.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Keep Order</Button>
          <Button onClick={handleCancel} disabled={loading} variant="destructive">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Cancelling...</> : <><Ban className="mr-2 size-4" />Cancel Order</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Order ────────────────────────────────────────

export function DeleteOrderDialog({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");

  const allowed = ["PENDING", "PENDING_CONTACT", "CANCELLED", "FREE_SERVE"];
  if (!allowed.includes(currentStatus)) return null;

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const result = await deleteOrder(orderId);
    // deleteOrder redirects on success, so we only reach here on error
    if (result && "error" in result) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (isOpen) { setConfirmation(""); setError(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400">
          <Trash2 className="mr-2 size-3.5" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Order Permanently</DialogTitle>
          <DialogDescription>
            This permanently deletes the order and all associated cards. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            All card records and card request links will be permanently removed.
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm" className="text-sm font-medium">
              Type <span className="font-mono font-bold text-red-500">DELETE</span> to confirm
            </label>
            <Input
              id="confirm"
              placeholder="DELETE"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDelete} disabled={loading || confirmation !== "DELETE"} variant="destructive">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Deleting...</> : <><Trash2 className="mr-2 size-4" />Delete Permanently</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Force Status Override ───────────────────────────────

const ALL_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "PENDING_CONTACT", label: "Awaiting Contact" },
  { value: "PAID", label: "Paid" },
  { value: "FREE_SERVE", label: "Free Serve" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function ForceStatusDialog({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setStatus("");
      setReason("");
      setError(null);
    }
  }

  async function handleForce() {
    setLoading(true);
    setError(null);
    const result = await forceOrderStatus(orderId, status, reason);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  const availableStatuses = ALL_STATUSES.filter((s) => s.value !== currentStatus);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-amber-500/20 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500">
          <ShieldAlert className="mr-2 size-3.5" />
          Force Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Force Status Override</DialogTitle>
          <DialogDescription>
            Override the order status, bypassing normal transition rules. Use with caution.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
            This bypasses normal transition rules. A mandatory reason will be recorded in the audit log.
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              New Status <span className="text-destructive">*</span>
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="reason"
              placeholder="Explain why this override is necessary..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleForce}
            disabled={loading || !status || reason.trim().length < 5}
            className="bg-amber-500 text-black hover:bg-amber-400"
          >
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Applying...</> : <><ShieldAlert className="mr-2 size-4" />Force Override</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
