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
import { Loader2, Pencil, Trash2, UserMinus } from "lucide-react";
import {
  updateCompany,
  assignCompanyPlan,
  overrideCompanySeats,
  removeEmployee,
  deleteCompany,
} from "@/actions/admin";

// ─── Edit Company Dialog ─────────────────────────────────

export function EditCompanyDialog({
  companyId,
  current,
}: {
  companyId: string;
  current: { nameEn: string; nameAr: string | null; crNumber: string | null; website: string | null };
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
    const result = await updateCompany(companyId, {
      nameEn: form.nameEn,
      nameAr: form.nameAr ?? "",
      crNumber: form.crNumber ?? "",
      website: form.website ?? "",
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
          Edit Company
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>Update company information.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium">Company Name (EN) <span className="text-destructive">*</span></label>
            <Input value={form.nameEn} onChange={(e) => update("nameEn", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Company Name (AR)</label>
            <Input value={form.nameAr ?? ""} onChange={(e) => update("nameAr", e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">CR Number</label>
            <Input value={form.crNumber ?? ""} onChange={(e) => update("crNumber", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Website</label>
            <Input value={form.website ?? ""} onChange={(e) => update("website", e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !form.nameEn.trim()} className="bg-amber-500 text-black hover:bg-amber-400">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Company Plan Dialog ──────────────────────────

export function AssignCompanyPlanDialog({
  companyId,
  currentPlanId,
  plans,
}: {
  companyId: string;
  currentPlanId: string | null;
  plans: { id: string; name: string; tier: string; maxSeats: number }[];
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

  const selectedPlan = plans.find((p) => p.id === planId);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await assignCompanyPlan(companyId, planId === "free" ? null : planId);
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
          <DialogTitle>Assign Company Plan</DialogTitle>
          <DialogDescription>Manually assign a plan. This also updates max seats to match the plan.</DialogDescription>
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
                <SelectItem key={p.id} value={p.id}>{p.name} ({p.maxSeats} seats)</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPlan && (
            <p className="text-xs text-muted-foreground">
              Max seats will be set to {selectedPlan.maxSeats}. Use &quot;Override Seats&quot; after to customize.
            </p>
          )}
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

// ─── Override Seats Dialog ───────────────────────────────

export function OverrideSeatsDialog({
  companyId,
  currentSeats,
}: {
  companyId: string;
  currentSeats: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seats, setSeats] = useState(String(currentSeats));

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) { setSeats(String(currentSeats)); setError(null); }
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await overrideCompanySeats(companyId, parseInt(seats));
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
          <DialogTitle>Override Max Seats</DialogTitle>
          <DialogDescription>Set seat limit independently of the plan. For custom enterprise deals.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Seats</label>
            <Input type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !seats || parseInt(seats) < 1} className="bg-amber-500 text-black hover:bg-amber-400">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Remove Employee Dialog ──────────────────────────────

export function RemoveEmployeeDialog({
  userId,
  companyId,
  employeeName,
}: {
  userId: string;
  companyId: string;
  employeeName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    setLoading(true);
    setError(null);
    const result = await removeEmployee(userId, companyId);
    if (result.error) { setError(result.error); setLoading(false); return; }
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-red-500">
          <UserMinus className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Employee</DialogTitle>
          <DialogDescription>Remove {employeeName} from this company. They will become an Individual user. Their profiles and cards are preserved.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleRemove} disabled={loading} variant="destructive">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Removing...</> : <><UserMinus className="mr-2 size-4" />Remove</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Company Dialog ───────────────────────────────

export function DeleteCompanyDialog({
  companyId,
  companyName,
  employeeCount,
}: {
  companyId: string;
  companyName: string;
  employeeCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const result = await deleteCompany(companyId);
    if (result.error) { setError(result.error); setLoading(false); return; }
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (isOpen) { setConfirmation(""); setError(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400">
          <Trash2 className="mr-2 size-3.5" />
          Delete Company
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Company</DialogTitle>
          <DialogDescription>Permanently delete {companyName}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            <p className="font-medium">This will:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
              <li>Delete the company record</li>
              <li>Convert {employeeCount} employee{employeeCount !== 1 ? "s" : ""} to Individual users</li>
              <li>Employee profiles and cards are preserved</li>
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
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Deleting...</> : <><Trash2 className="mr-2 size-4" />Delete</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
