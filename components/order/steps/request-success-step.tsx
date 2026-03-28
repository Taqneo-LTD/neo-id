"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock } from "lucide-react";

type RequestSuccessStepProps = {
  profileId: string;
};

export function RequestSuccessStep({ profileId }: RequestSuccessStepProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="mx-auto max-w-md border-neo-teal/30">
        <CardContent className="flex flex-col items-center gap-5 py-10">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-neo-teal/10">
            <Image
              src="/brandings/logo-icon.svg"
              alt="NEO Card"
              width={32}
              height={30}
              className="h-[30px] w-auto"
            />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight">
              Card Requested!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your card request has been submitted successfully.
              <br />
              Your company admin will review and include it in the next order.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2">
            <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Pending admin approval
            </span>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" asChild>
              <Link href={`/profiles/${profileId}`}>Back to Profile</Link>
            </Button>
            <Button asChild>
              <Link href="/profiles">
                My Profiles
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
