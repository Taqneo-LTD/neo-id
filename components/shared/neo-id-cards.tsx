import Image from "next/image";
import Link from "next/link";
import { Clock, CreditCard, ChevronRight, XCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ActiveCardDisplay } from "./active-card-display";
import { OrderCardPrompt } from "./order-card-prompt";
import { claimReservedProfile } from "@/actions/profile";

/**
 * Dashed card prompting the user to create a NEO ID.
 * Used in /dashboard, /profiles grid, team grid, etc.
 */
export function CreateNeoIdCard({
  label,
  sublabel,
  href = "/profiles/new",
  className,
}: {
  label: string;
  sublabel: string;
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex", className)}>
      <Card className="flex w-full flex-col items-center justify-center border-2 border-dashed border-neo-teal/30 transition-colors hover:border-neo-teal/60 hover:bg-neo-teal/5">
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-neo-teal/10">
            <Image
              src="/brandings/logo-icon.svg"
              alt="NEO ID"
              width={24}
              height={22}
              className="h-[22px] w-auto"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Dashed card shown when the NEO ID limit is reached (grid variant).
 * Compact version used inside profile grids.
 */
export function NeoIdLimitCard({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "flex w-full flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20",
        className,
      )}
    >
      <CardContent className="flex flex-col items-center gap-3 py-8">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
          <Image
            src="/brandings/logo-icon.svg"
            alt="NEO ID"
            width={24}
            height={22}
            className="h-[22px] w-auto"
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Limit Reached</p>
          <p className="text-xs text-muted-foreground">
            Upgrade to create more NEO IDs
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings">Upgrade Plan</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Standalone limit-reached card with detailed usage info and navigation.
 * Used on the /profiles/new page when the user can't create more.
 */
export function NeoIdLimitReachedCard({
  current,
  limit,
  planName,
}: {
  current: number;
  limit: number;
  planName: string;
}) {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardContent className="flex flex-col items-center gap-4 py-10">
        <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
          <Image
            src="/brandings/logo-icon.svg"
            alt="NEO ID"
            width={28}
            height={26}
            className="h-[26px] w-auto"
          />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold">NEO ID Limit Reached</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;ve used {current} of {limit} NEO ID
            {limit === 1 ? "" : "s"} on your{" "}
            <span className="font-medium text-foreground">{planName}</span>{" "}
            plan.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profiles">Back to Profiles</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/settings">Upgrade Plan</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Card shown to employees who can claim a reserved (placeholder) NEO ID.
 * Uses a form action so it works in server components.
 */
export function ClaimReservedCard({
  profileId,
  slug,
  className,
}: {
  profileId: string;
  slug: string;
  className?: string;
}) {
  const claimAction = claimReservedProfile.bind(null, profileId);

  return (
    <Card
      className={cn(
        "flex w-full flex-col border-neo-teal/30 transition-colors hover:border-neo-teal/60",
        className,
      )}
    >
      <CardContent className="flex flex-col items-center gap-3 py-8">
        <div className="flex size-12 items-center justify-center rounded-xl bg-neo-teal/10">
          <Image
            src="/brandings/logo-icon.svg"
            alt="NEO ID"
            width={24}
            height={22}
            className="h-[22px] w-auto"
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Reserved NEO ID</p>
          <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Link2 className="size-3" />
            neo-id.com/p/{slug}
          </div>
        </div>
        <form action={claimAction}>
          <Button size="sm" type="submit">
            Claim this NEO ID
            <ChevronRight className="ml-1 size-3.5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Sidebar card prompting the user to attach/order a physical NFC card.
 * Shown in the profile editor sidebar.
 *
 * States:
 * - No card, no request → "Order Card"
 * - Request pending → "Card Requested — Pending approval"
 * - Request rejected → "Request Rejected — Try again"
 * - Card ordered/active → "Physical NFC Card"
 */
export function AttachNeoCardCard({
  profileId,
  hasCard,
  cardRequestStatus,
  cardFrontSvg,
  cardBackSvg,
  className,
}: {
  profileId: string;
  hasCard: boolean;
  cardRequestStatus?: "PENDING" | "APPROVED" | "ORDERED" | "REJECTED" | "CANCELLED" | null;
  cardFrontSvg?: string;
  cardBackSvg?: string;
  className?: string;
}) {
  const isPending =
    cardRequestStatus === "PENDING" || cardRequestStatus === "APPROVED";
  const isOrdered = hasCard;
  const isRejected = cardRequestStatus === "REJECTED";

  // Ordered / active card
  if (isOrdered && cardFrontSvg) {
    return (
      <ActiveCardDisplay
        frontSvg={cardFrontSvg}
        backSvg={cardBackSvg}
        className={className}
      />
    );
  }

  // Pending approval
  if (isPending) {
    return (
      <Card
        className={cn(
          "border-2 border-dashed border-amber-500/30 transition-colors",
          className,
        )}
      >
        <CardContent className="flex flex-col items-center gap-3 py-6">
          {cardFrontSvg ? (
            <div className="relative h-16 w-28 overflow-hidden rounded-lg opacity-70">
              <Image
                src={cardFrontSvg}
                alt="Your card"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Image
                src="/brandings/logo-icon.svg"
                alt="NEO Card"
                width={24}
                height={22}
                className="h-[22px] w-auto opacity-60"
              />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-medium">Card Requested</p>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <Clock className="size-3 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Waiting for admin approval
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rejected
  if (isRejected) {
    return (
      <Card
        className={cn(
          "border-2 border-dashed border-destructive/30 transition-colors hover:border-destructive/50",
          className,
        )}
      >
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10">
            <XCircle className="size-5 text-destructive" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Request Rejected</p>
            <p className="text-xs text-muted-foreground">
              Your card request was not approved
            </p>
          </div>
          <Button size="sm" className="w-full" asChild>
            <Link href={`/profiles/${profileId}/order-card`}>
              <CreditCard className="mr-2 size-4" />
              Request Again
              <ChevronRight className="ml-auto size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default: no card, no request
  return <OrderCardPrompt profileId={profileId} className={className} />;
}
