"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AccountType = "COMPANY" | "INDIVIDUAL" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [crNumber, setCrNumber] = useState("");

  // Individual fields
  const [displayName, setDisplayName] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          accountType === "COMPANY"
            ? { accountType, companyName, crNumber }
            : { accountType, displayName }
        ),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Image
        src="/brandings/logo-icon.svg"
        alt="NEO ID"
        width={36}
        height={33}
        className="mb-8 h-[33px] w-auto"
      />

      {step === 1 && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">How will you use NEO ID?</CardTitle>
            <CardDescription>
              Choose the account type that fits you best
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => setAccountType("COMPANY")}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                accountType === "COMPANY"
                  ? "border-neo-teal bg-neo-teal/5"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neo-teal/10">
                <Building2 className="size-5 text-neo-teal" />
              </div>
              <div>
                <p className="font-medium">Company</p>
                <p className="text-sm text-muted-foreground">
                  Manage cards for your team with company branding
                </p>
              </div>
            </button>

            <button
              onClick={() => setAccountType("INDIVIDUAL")}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                accountType === "INDIVIDUAL"
                  ? "border-neo-teal bg-neo-teal/5"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neo-blue/10">
                <User className="size-5 text-neo-blue" />
              </div>
              <div>
                <p className="font-medium">Individual</p>
                <p className="text-sm text-muted-foreground">
                  Create a personal smart business card
                </p>
              </div>
            </button>

            <Button
              className="mt-4 w-full"
              disabled={!accountType}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && accountType === "COMPANY" && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Set up your company</CardTitle>
            <CardDescription>
              You can update these details later
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Acme Corporation"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crNumber">
                CR Number{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="crNumber"
                placeholder="e.g. 1010XXXXXX"
                value={crNumber}
                onChange={(e) => setCrNumber(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!companyName.trim() || loading}
                onClick={handleSubmit}
              >
                {loading ? "Creating..." : "Create Company"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && accountType === "INDIVIDUAL" && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Almost there</CardTitle>
            <CardDescription>
              Confirm your display name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!displayName.trim() || loading}
                onClick={handleSubmit}
              >
                {loading ? "Setting up..." : "Get Started"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
