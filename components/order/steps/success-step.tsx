"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Package } from "lucide-react";

type SuccessStepProps = {
  profileId: string;
};

export function SuccessStep({ profileId }: SuccessStepProps) {
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
            <h2 className="text-xl font-bold tracking-tight">Order Placed!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your NFC card order has been placed successfully.
              <br />
              We&apos;ll start production and notify you when it ships.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" asChild>
              <Link href={`/profiles/${profileId}`}>
                Back to Profile
              </Link>
            </Button>
            <Button asChild>
              <Link href="/orders">
                <Package className="mr-2 size-4" />
                View Orders
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
