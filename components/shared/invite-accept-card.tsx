"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/actions/invite";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, CheckCircle2, Loader2, XCircle, AlertTriangle } from "lucide-react";

export function InviteAcceptCard({
  token,
  companyName,
  companyLogo,
  invitedBy,
  expired,
  used,
  authenticated,
}: {
  token: string;
  companyName: string;
  companyLogo: string | null;
  invitedBy: string;
  expired: boolean;
  used: boolean;
  authenticated: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  // Invalid state — but not if we just accepted it ourselves
  if ((expired || used) && !result?.success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="size-6 text-destructive" />
          </div>
          <CardTitle>Invite {expired ? "Expired" : "Already Used"}</CardTitle>
          <CardDescription>
            {expired
              ? "This invite link has expired. Ask your company admin for a new one."
              : "This invite link has already been used."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Success state
  if (result?.success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-neo-teal/10">
            <CheckCircle2 className="size-6 text-neo-teal" />
          </div>
          <CardTitle>Welcome to {companyName}!</CardTitle>
          <CardDescription>
            You&apos;ve joined the team. Redirecting to your dashboard...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Error state
  if (result?.error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <CardTitle>Unable to Join</CardTitle>
          <CardDescription>{result.error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  function handleAccept() {
    startTransition(async () => {
      const res = await acceptInvite(token);
      setResult(res);
      if (res.success) {
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    });
  }

  // Not logged in
  if (!authenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CompanyAvatar logo={companyLogo} name={companyName} />
          <CardTitle className="mt-2">{companyName}</CardTitle>
          <CardDescription>
            <span className="font-medium">{invitedBy}</span> invited you to join
            their company on NEO ID
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <a href={`/api/auth/login?post_login_redirect_url=/invite/${token}`}>
              Sign in to Accept Invite
            </a>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account? You&apos;ll be able to create one.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Logged in — show accept button
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CompanyAvatar logo={companyLogo} name={companyName} />
        <CardTitle className="mt-2">Join {companyName}</CardTitle>
        <CardDescription>
          <span className="font-medium">{invitedBy}</span> invited you to join
          their company on NEO ID
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={handleAccept} disabled={isPending} size="lg" className="w-full">
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Building2 className="mr-2 size-4" />
          )}
          {isPending ? "Joining..." : "Accept & Join Company"}
        </Button>
      </CardContent>
    </Card>
  );
}

function CompanyAvatar({ logo, name }: { logo: string | null; name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className="mx-auto size-16">
      <AvatarImage src={logo ?? undefined} />
      <AvatarFallback className="bg-neo-teal/10 text-lg text-neo-teal">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
