"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { createInviteLink, updateEmployeeRole, removeEmployee } from "@/actions/company";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlanBadge } from "@/components/shared/plan-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Armchair,
  Check,
  Copy,
  Crown,
  Link2,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Shield,
  ShieldCheck,
  User,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { getInitials } from "@/lib/string-utils";

type Employee = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  onboarded: boolean;
  profileCount: number;
  createdAt: string;
};

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Crown; variant: "default" | "secondary" | "outline" }> = {
  OWNER: { label: "Owner", icon: Crown, variant: "default" },
  ADMIN: { label: "Admin", icon: ShieldCheck, variant: "secondary" },
  MEMBER: { label: "Member", icon: User, variant: "outline" },
};

export function EmployeeManagement({
  employees,
  currentUserId,
  companyName,
  maxSeats,
  planName,
}: {
  employees: Employee[];
  currentUserId: string;
  companyName: string;
  maxSeats: number;
  planName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seatsUsed = employees.length;
  const seatsAvailable = maxSeats - seatsUsed;
  const totalNeoIds = employees.reduce((sum, e) => sum + e.profileCount, 0);

  function handleGenerateLink(formData: FormData) {
    setError(null);
    setInviteLink(null);
    const label = (formData.get("label") as string)?.trim() || undefined;
    startTransition(async () => {
      try {
        const link = await createInviteLink(label);
        setInviteLink(link);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create invite link");
      }
    });
  }

  function handleCopyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    if (!inviteLink) return;
    const text = `You're invited to join ${companyName} on NEO ID! Accept here: ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function handleNativeShare() {
    if (!inviteLink) return;
    try {
      await navigator.share({
        title: `Join ${companyName} on NEO ID`,
        text: `You're invited to join ${companyName} on NEO ID!`,
        url: inviteLink,
      });
    } catch {
      // User cancelled or not supported — fall back to copy
      handleCopyLink();
    }
  }

  function handleDialogChange(open: boolean) {
    setInviteOpen(open);
    if (!open) {
      // Reset state when closing
      setInviteLink(null);
      setError(null);
      setCopied(false);
    }
  }

  function handleRoleChange(employeeId: string, newRole: "ADMIN" | "MEMBER") {
    startTransition(async () => {
      try {
        await updateEmployeeRole(employeeId, newRole);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed to update role");
      }
    });
  }

  function handleRemove(employeeId: string) {
    if (!confirm("Remove this employee from your company? They will keep their account but lose company access.")) {
      return;
    }
    startTransition(async () => {
      try {
        await removeEmployee(employeeId);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed to remove employee");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header with seats info and invite */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-neo-teal/10">
                <Users className="size-5 text-neo-teal" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  {seatsUsed} of {maxSeats} seats used
                  <PlanBadge planName={planName} />
                </CardTitle>
                <CardDescription className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Image
                      src="/brandings/logo-icon.svg"
                      alt="NEO ID"
                      width={14}
                      height={13}
                      className="h-[10px] w-auto"
                    />
                    {totalNeoIds} NEO ID{totalNeoIds !== 1 ? "s" : ""} created
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Armchair className="size-3.5 text-neo-teal" />
                    {seatsAvailable > 0
                      ? `${seatsAvailable} seat${seatsAvailable !== 1 ? "s" : ""} available`
                      : "No seats available"}
                  </span>
                </CardDescription>
              </div>
            </div>

            <Dialog open={inviteOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button disabled={seatsAvailable <= 0}>
                  <UserPlus className="mr-2 size-4" />
                  Invite Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Employee</DialogTitle>
                  <DialogDescription>
                    Generate a one-time invite link and share it with your team member.
                  </DialogDescription>
                </DialogHeader>

                {!inviteLink ? (
                  // Step 1: Generate link
                  <form action={handleGenerateLink} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-label">Label (optional)</Label>
                      <Input
                        id="invite-label"
                        name="label"
                        placeholder="e.g. Ahmed, Marketing team"
                      />
                      <p className="text-xs text-muted-foreground">
                        For your tracking only — the employee won&apos;t see this.
                      </p>
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDialogChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Link2 className="mr-2 size-4" />
                        )}
                        {isPending ? "Generating..." : "Generate Invite Link"}
                      </Button>
                    </DialogFooter>
                  </form>
                ) : (
                  // Step 2: Share the link
                  <div className="min-w-0 space-y-4 overflow-hidden">
                    {/* Link preview */}
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                      <p className="min-w-0 flex-1 truncate text-xs font-mono">
                        {inviteLink}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={handleCopyLink}
                      >
                        {copied ? (
                          <Check className="size-4 text-neo-teal" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      This link expires in 7 days and can only be used once.
                    </p>

                    {/* Share buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleWhatsApp}
                        size="lg"
                        className="w-full bg-[#25D366] text-white hover:bg-[#1da851]"
                      >
                        <MessageCircle className="mr-2 size-4" />
                        Share via WhatsApp
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleNativeShare}
                          variant="outline"
                          className="flex-1"
                        >
                          <Share2 className="mr-2 size-4" />
                          Share
                        </Button>
                        <Button
                          onClick={handleCopyLink}
                          variant="outline"
                          className="flex-1"
                        >
                          {copied ? (
                            <Check className="mr-2 size-4 text-neo-teal" />
                          ) : (
                            <Copy className="mr-2 size-4" />
                          )}
                          {copied ? "Copied!" : "Copy Link"}
                        </Button>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="ghost"
                        onClick={() => handleDialogChange(false)}
                        className="w-full"
                      >
                        Done
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5 text-neo-teal" />
            Team Members
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">NEO IDs</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="w-12 pr-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const roleConfig = ROLE_CONFIG[employee.role] ?? ROLE_CONFIG.MEMBER;
                const RoleIcon = roleConfig.icon;
                const isCurrentUser = employee.id === currentUserId;
                const isOwner = employee.role === "OWNER";
                const initials = getInitials(employee.name);

                return (
                  <TableRow key={employee.id}>
                    <TableCell className="pl-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 shrink-0">
                          <AvatarImage src={employee.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-neo-teal/10 text-xs text-neo-teal">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {employee.name}
                            {isCurrentUser && (
                              <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant={roleConfig.variant} className="gap-1 text-xs">
                        <RoleIcon className="size-3" />
                        {roleConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden py-3 sm:table-cell">
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {employee.profileCount}
                      </span>
                    </TableCell>
                    <TableCell className="hidden py-3 sm:table-cell">
                      <Badge
                        variant={employee.onboarded ? "default" : "outline"}
                        className="text-xs"
                      >
                        {employee.onboarded ? "Active" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 pr-4 text-right">
                      {!isOwner && !isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-muted">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-fit whitespace-nowrap">
                            {employee.role === "MEMBER" ? (
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(employee.id, "ADMIN")}
                              >
                                <ShieldCheck className="mr-2 size-4" />
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(employee.id, "MEMBER")}
                              >
                                <Shield className="mr-2 size-4" />
                                Make Member
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemove(employee.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserMinus className="mr-2 size-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
