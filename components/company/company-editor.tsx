"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { updateCompany, updateCompanyLogo } from "@/actions/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PrefixInput } from "@/components/ui/form-fields";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlanBadge } from "@/components/shared/plan-badge";
import {
  Building2,
  Camera,
  ChevronRight,
  Globe,
  Loader2,
  Palette,
  Save,
  Users,
} from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-helpers";
import { cn } from "@/lib/utils";
import { BrandColorPicker } from "@/components/company/brand-color-picker";
import { PageHeader } from "@/components/shared/page-header";

type CompanyData = {
  id: string;
  nameEn: string;
  nameAr: string | null;
  crNumber: string | null;
  logo: string | null;
  website: string | null;
  brandColors: { primary: string; secondary: string; accent: string } | null;
  planName: string;
  maxSeats: number;
  currentSeats: number;
};

export function CompanyEditor({
  company,
  isOwner,
}: {
  company: CompanyData;
  isOwner: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [nameEn, setNameEn] = useState(company.nameEn);
  const [nameAr, setNameAr] = useState(company.nameAr ?? "");
  const [crNumber, setCrNumber] = useState(company.crNumber ?? "");
  const [website, setWebsite] = useState(company.website ?? "");
  const [brandColors, setBrandColors] = useState(
    company.brandColors ?? { primary: "#8BDFD7", secondary: "#9BFF37", accent: "#47C2FA" },
  );
  const [logoPreview, setLogoPreview] = useState(company.logo);
  const [saved, setSaved] = useState(false);

  const { startUpload, isUploading } = useUploadThing("companyLogo", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setLogoPreview(res[0].ufsUrl);
        updateCompanyLogo(res[0].ufsUrl);
      }
    },
    onUploadError: () => {
      alert("Logo upload failed. Please try again.");
    },
  });

  function handleSave() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("nameEn", nameEn);
      formData.set("nameAr", nameAr);
      formData.set("crNumber", crNumber);
      formData.set("website", website);
      formData.set("brandColors", JSON.stringify(brandColors));
      await updateCompany(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const seatsUsed = company.currentSeats;
  const seatsTotal = company.maxSeats;
  const seatPercent = Math.round((seatsUsed / seatsTotal) * 100);

  return (
    <div className="space-y-6">
      <PageHeader title="Company Settings" description="Manage your company profile and branding">
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-500 animate-in fade-in">
              Changes saved
            </span>
          )}
          <Button onClick={handleSave} disabled={isPending || !nameEn.trim()}>
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </PageHeader>

      <div className={cn("grid gap-6", isOwner && "lg:grid-cols-[1fr_280px]")}>
      {/* Left column — editable forms */}
      <div className="space-y-6">
        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="size-5 text-neo-teal" />
              Company Information
            </CardTitle>
            <CardDescription>
              Basic details about your company
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <label
                className={cn(
                  "group relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border transition-colors hover:border-neo-teal/50",
                  isUploading && "pointer-events-none",
                )}
              >
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt={nameEn}
                    width={80}
                    height={80}
                    className="size-full object-contain p-2"
                  />
                ) : (
                  <Building2 className="size-8 text-muted-foreground" />
                )}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/50 transition-opacity",
                    isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="size-5 animate-spin text-white" />
                  ) : (
                    <Camera className="size-5 text-white" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 4 * 1024 * 1024) {
                        alert("File must be under 4MB");
                        return;
                      }
                      startUpload([file]);
                    }
                  }}
                />
              </label>
              <div>
                <p className="text-sm font-medium">Company Logo</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, SVG or WebP. Max 4MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nameEn">Company Name (English)</Label>
                <Input
                  id="nameEn"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">Company Name (Arabic)</Label>
                <Input
                  id="nameAr"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="شركة أكمي"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="crNumber">CR Number</Label>
                <Input
                  id="crNumber"
                  value={crNumber}
                  onChange={(e) => setCrNumber(e.target.value)}
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <PrefixInput
                  addon="https://"
                  id="website"
                  value={website.replace(/^https?:\/\//, "")}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^https?:\/\//, "");
                    setWebsite(val ? `https://${val}` : "");
                  }}
                  placeholder="example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="size-5 text-neo-teal" />
              Brand Colors
            </CardTitle>
            <CardDescription>
              Colors used on your employees&apos; public profile cards
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent>
            <BrandColorPicker
              colors={brandColors}
              onChange={setBrandColors}
            />
          </CardContent>
        </Card>

      </div>

      {/* Right sidebar — Plan & Team (OWNER only) */}
      {isOwner && (
      <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-neo-teal" />
              Plan & Team
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4">
            {/* Plan */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plan</span>
              <PlanBadge planName={company.planName} />
            </div>

            {/* Seats progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Seats</span>
                <span className="text-sm font-medium">
                  {seatsUsed} <span className="text-muted-foreground">/ {seatsTotal}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-neo-teal transition-all"
                  style={{ width: `${Math.min(seatPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {seatsTotal - seatsUsed} seat{seatsTotal - seatsUsed !== 1 ? "s" : ""} available
              </p>
            </div>

            <Separator />

            {/* Manage employees link */}
            <Button size="sm" className="w-full" asChild>
              <Link href="/company/employees">
                <Users className="mr-2 size-4" />
                Manage Employees
                <ChevronRight className="ml-auto size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      )}
      </div>
    </div>
  );
}
