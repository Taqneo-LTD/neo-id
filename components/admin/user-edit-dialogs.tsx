"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
  updateUser,
  changeUserRole,
  assignUserPlan,
  deleteUser,
} from "@/actions/admin";

// ─── Edit User Dialog ────────────────────────────────────

export function EditUserDialog({
  userId,
  current,
}: {
  userId: string;
  current: { name: string; nameAr: string | null; email: string; phone: string | null };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(current);

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) { setForm(current); setError(null); }
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await updateUser(userId, {
      name: form.name,
      nameAr: form.nameAr ?? "",
      email: form.email,
      phone: form.phone ?? "",
    });
    if (result.error) { setError(result.error); setLoading(false); return; }
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
          <Pencil className="mr-2 size-3.5" />
          Edit User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Name (Arabic)</label>
            <Input value={form.nameAr ?? ""} onChange={(e) => update("nameAr", e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone</label>
            <Input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !form.name.trim() || !form.email.trim()} className="bg-amber-500 text-black hover:bg-amber-400">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Change Role Dialog ──────────────────────────────────

export function ChangeRoleDialog({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState(currentRole);

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) { setRole(currentRole); setError(null); }
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await changeUserRole(userId, role as "OWNER" | "ADMIN" | "MEMBER");
    if (result.error) { setError(result.error); setLoading(false); return; }
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
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>Change this user&apos;s role within their company.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="OWNER">Owner</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || role === currentRole} className="bg-amber-500 text-black hover:bg-amber-400">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Plan Dialog ──────────────────────────────────

export function AssignPlanDialog({
  userId,
  currentPlanId,
  plans,
}: {
  userId: string;
  currentPlanId: string | null;
  plans: { id: string; name: string; tier: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState(currentPlanId ?? "free");

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) { setPlanId(currentPlanId ?? "free"); setError(null); }
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await assignUserPlan(userId, planId === "free" ? null : planId);
    if (result.error) { setError(result.error); setLoading(false); return; }
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
          <DialogTitle>Assign Plan</DialogTitle>
          <DialogDescription>Manually assign a plan to this user, bypassing PayPal.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <Select value={planId} onValueChange={setPlanId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free (no plan)</SelectItem>
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-amber-500 text-black hover:bg-amber-400">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete User Dialog ──────────────────────────────────

export function DeleteUserDialog({
  userId,
  userName,
  counts,
}: {
  userId: string;
  userName: string;
  counts: { profiles: number; orders: number };
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const result = await deleteUser(userId);
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
          Delete User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User Permanently</DialogTitle>
          <DialogDescription>This permanently deletes {userName} and all their data.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <p className="font-medium">This will permanently delete:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
              <li>{counts.profiles} profile{counts.profiles !== 1 ? "s" : ""} (and their cards)</li>
              <li>{counts.orders} order{counts.orders !== 1 ? "s" : ""}</li>
              <li>All card requests and invite records</li>
            </ul>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <span className="font-mono font-bold text-red-500">DELETE</span> to confirm
            </label>
            <Input placeholder="DELETE" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
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
