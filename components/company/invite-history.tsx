"use client";

import { Badge } from "@/components/ui/badge";
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
import { CheckCircle2, Clock, Link2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/date-format";

type Invite = {
  id: string;
  token: string;
  label: string | null;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  usedBy: { name: string; email: string } | null;
};

function getStatus(invite: Invite): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: typeof CheckCircle2;
} {
  if (invite.usedAt) {
    return { label: "Used", variant: "default", icon: CheckCircle2 };
  }
  if (new Date(invite.expiresAt) < new Date()) {
    return { label: "Expired", variant: "destructive", icon: XCircle };
  }
  return { label: "Pending", variant: "outline", icon: Clock };
}

export function InviteHistory({ invites }: { invites: Invite[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="size-5 text-neo-teal" />
          Invite History
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Label</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Accepted By</TableHead>
              <TableHead className="hidden sm:table-cell">Created</TableHead>
              <TableHead className="hidden pr-4 sm:table-cell">Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => {
              const status = getStatus(invite);
              const StatusIcon = status.icon;

              return (
                <TableRow key={invite.id}>
                  <TableCell className="pl-4 py-3">
                    <span className="text-sm font-medium">
                      {invite.label || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge variant={status.variant} className="gap-1 text-xs">
                      <StatusIcon className="size-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden py-3 sm:table-cell">
                    {invite.usedBy ? (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{invite.usedBy.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {invite.usedBy.email}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden py-3 sm:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(invite.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden py-3 pr-4 sm:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(invite.expiresAt)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
