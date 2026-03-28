"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  Globe,
  GlobeLock,
  HelpCircle,
  Link2,
  Loader2,
  Lock,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { FormField, PrefixInput, SlugInput } from "@/components/ui/form-fields";
import { SocialLinksEditor } from "./social-links-editor";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { AttachNeoCardCard } from "@/components/shared/neo-id-cards";
import { updateProfile, updateAvatar, togglePublish, deleteProfile, checkSlugAvailability } from "@/actions/profile";
import { DEFAULT_COUNTRY } from "@/constants/profile";

type SocialLink = { platform: string; url: string; label?: string };

type ProfileData = {
  id: string;
  slug: string;
  name: string | null;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPublished: boolean;
  views: number;
  taps: number;
  contactInfo: Record<string, string> | null;
  socialLinks: SocialLink[] | null;
  hasCard: boolean;
  cardRequestStatus?: "PENDING" | "APPROVED" | "ORDERED" | "REJECTED" | "CANCELLED" | null;
  cardFrontSvg?: string;
  cardBackSvg?: string;
  isSlugLocked?: boolean;
};

export function ProfileEditor({
  profile,
  userName,
}: {
  profile: ProfileData;
  userName: string;
}) {
  const [saving, startSave] = useTransition();
  const [publishing, startPublish] = useTransition();
  const [deleting, startDelete] = useTransition();

  const [name, setName] = useState(profile.name ?? userName);
  const [title, setTitle] = useState(profile.title ?? "");
  const [slug, setSlug] = useState(profile.slug);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [phone, setPhone] = useState(() => {
    const raw = profile.contactInfo?.phone ?? "";
    // Strip stored dial code prefix so the input only shows the local number
    const local = raw.startsWith(DEFAULT_COUNTRY.dialCode)
      ? raw.slice(DEFAULT_COUNTRY.dialCode.length).trim()
      : raw;
    // Format with dashes for display
    const digits = local.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  });
  const [email, setEmail] = useState(profile.contactInfo?.email ?? "");
  const [website, setWebsite] = useState(() => {
    const raw = profile.contactInfo?.website ?? "";
    return raw.replace(/^https?:\/\//, "");
  });
  const [address, setAddress] = useState(profile.contactInfo?.address ?? "");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    profile.socialLinks ?? [],
  );
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Validation
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [websiteError, setWebsiteError] = useState("");

  /** Format digits as 5XX-XXX-XXXX for display */
  function formatPhoneDisplay(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function handlePhoneChange(value: string) {
    const formatted = formatPhoneDisplay(value);
    setPhone(formatted);
    if (phoneError) validatePhone(formatted);
  }

  function validatePhone(value: string): boolean {
    if (!value) return true; // optional
    // Saudi numbers: 5XXXXXXXX (9 digits starting with 5)
    const digits = value.replace(/\D/g, "");
    if (!/^5\d{8}$/.test(digits)) {
      setPhoneError("Enter a valid Saudi mobile number (e.g. 5XX-XXX-XXXX)");
      return false;
    }
    setPhoneError("");
    return true;
  }

  function validateEmail(value: string): boolean {
    if (!value) return true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  }

  function validateWebsite(value: string): boolean {
    if (!value) return true;
    // Simple domain check (no protocol in input)
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}(\/.*)?$/.test(value)) {
      setWebsiteError("Enter a valid domain (e.g. yoursite.com)");
      return false;
    }
    setWebsiteError("");
    return true;
  }

  // Slug availability checker
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const slugTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const checkSlug = useCallback(
    (value: string) => {
      if (slugTimerRef.current) clearTimeout(slugTimerRef.current);

      if (!value || value === profile.slug) {
        setSlugStatus("idle");
        setSlugSuggestions([]);
        return;
      }

      setSlugStatus("checking");
      slugTimerRef.current = setTimeout(async () => {
        try {
          const result = await checkSlugAvailability(value, profile.id);
          setSlugStatus(result.available ? "available" : "taken");
          setSlugSuggestions(result.suggestions);
        } catch {
          setSlugStatus("idle");
        }
      }, 500);
    },
    [profile.slug, profile.id],
  );

  function handleSlugChange(value: string) {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(sanitized);
    checkSlug(sanitized);
  }

  function handleSave() {
    setError("");

    // Run validations
    const phoneOk = validatePhone(phone);
    const emailOk = validateEmail(email);
    const websiteOk = validateWebsite(website);
    if (!phoneOk || !emailOk || !websiteOk) return;

    startSave(async () => {
      try {
        const formData = new FormData();
        formData.set("name", name);
        formData.set("title", title);
        formData.set("slug", slug);
        formData.set("bio", bio);

        // Prepend dial code for phone (strip dashes), https:// for website
        const phoneDigits = phone.replace(/\D/g, "");
        const fullPhone = phoneDigits
          ? `${DEFAULT_COUNTRY.dialCode}${phoneDigits}`
          : undefined;
        const fullWebsite = website ? `https://${website}` : undefined;

        formData.set(
          "contactInfo",
          JSON.stringify({
            phone: fullPhone,
            email: email || undefined,
            website: fullWebsite,
            address: address || undefined,
          }),
        );
        const validLinks = socialLinks.filter((l) => l.url.trim());
        if (validLinks.length > 0) {
          formData.set("socialLinks", JSON.stringify(validLinks));
        }
        await updateProfile(profile.id, formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`https://neo-id.com/p/${profile.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePublish() {
    startPublish(async () => {
      await togglePublish(profile.id);
    });
  }

  function handleDelete() {
    startDelete(async () => {
      await deleteProfile(profile.id);
    });
  }

  const isPublished = profile.isPublished;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profiles">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {profile.title || profile.slug}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>neo-id.com/p/{profile.slug}</span>
              <span>·</span>
              <Eye className="size-3" />
              <span>{profile.views} views</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPublished && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/p/${profile.slug}`} target="_blank">
                <ExternalLink className="mr-2 size-3" />
                View Live
              </Link>
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-5">
              {/* Avatar section — centered like public profile */}
              <div className="flex flex-col items-center">
                <div className="relative -mt-1 mb-2">
                  <AvatarUpload
                    currentUrl={profile.avatarUrl}
                    name={userName}
                    onUploaded={(url) => {
                      updateAvatar(profile.id, url);
                    }}
                    onUploadingChange={setAvatarUploading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {avatarUploading ? "Uploading avatar..." : "Click to change avatar"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="size-3.5 cursor-help text-neo-teal" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px]">
                        <p><span className="font-semibold">Headline on your public card.</span>{" "}This is the main name displayed on this NEO ID — can differ per card.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="title">Occupation</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="size-3.5 cursor-help text-neo-teal" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px]">
                        <p><span className="font-semibold">Shown below your name on the public card.</span>{" "}Your role or job title — e.g. &quot;Product Manager&quot; or &quot;Founder &amp; CEO&quot;.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Product Manager, Software Engineer"
                />
              </div>
              <FormField label="Profile URL" htmlFor="slug">
                {profile.isSlugLocked ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2">
                      <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        neo-id.com/p/
                      </span>
                      <span className="text-sm font-medium">{slug}</span>
                      <Lock className="ml-auto size-3.5 shrink-0 text-muted-foreground/60" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Profile URL is locked after a card order or request. This URL is encoded into your physical NFC card.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <SlugInput
                      id="slug"
                      value={slug}
                      onChange={handleSlugChange}
                      status={slugStatus}
                      suggestions={slugSuggestions}
                      onSuggestionClick={(s) => {
                        setSlug(s);
                        checkSlug(s);
                      }}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Choose carefully — this URL will be permanently locked once you order or request a card.
                    </p>
                  </div>
                )}
              </FormField>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A brief introduction..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>
                Shown on your public profile
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Phone" htmlFor="phone" error={phoneError}>
                  <PrefixInput
                    addon={
                      <span className="flex items-center gap-1.5 text-sm">
                        <Image
                          src={DEFAULT_COUNTRY.flagSrc}
                          alt={DEFAULT_COUNTRY.name}
                          width={20}
                          height={14}
                          className="h-3.5 w-5 rounded-[2px] object-cover"
                        />
                        <span>{DEFAULT_COUNTRY.dialCode}</span>
                      </span>
                    }
                    addonClassName="px-2.5"
                    id="phone"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => validatePhone(phone)}
                    placeholder="5XX-XXX-XXXX"
                    className={phoneError ? "border-destructive focus-visible:ring-destructive/25" : ""}
                  />
                </FormField>
                <FormField label="Email" htmlFor="email" error={emailError}>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                    placeholder="you@company.com"
                    className={emailError ? "border-destructive focus-visible:ring-destructive/25" : ""}
                  />
                </FormField>
              </div>
              <FormField label="Website" htmlFor="website" error={websiteError}>
                <PrefixInput
                  addon="https://"
                  addonClassName="px-2.5"
                  id="website"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    if (websiteError) validateWebsite(e.target.value);
                  }}
                  onBlur={() => validateWebsite(website)}
                  placeholder="yoursite.com"
                  className={websiteError ? "border-destructive focus-visible:ring-destructive/25" : ""}
                />
              </FormField>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="address">Address</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="size-3.5 cursor-help text-neo-teal" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px]">
                        <p><span className="font-semibold">Show as much or as little as you like</span> — a full address, city, or just a region. e.g. &quot;Jeddah, Saudi Arabia&quot;</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Riyadh, Saudi Arabia"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Links</CardTitle>
              <CardDescription>
                Add your social media and web profiles
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent>
              <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visibility</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPublished ? (
                    <Globe className="size-4 text-neo-teal" />
                  ) : (
                    <GlobeLock className="size-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={handlePublish}
                  disabled={publishing}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isPublished
                  ? "Your profile is visible to anyone with the link."
                  : "Your profile is hidden. Publish it to make it accessible."}
              </p>
              {isPublished && (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="group flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/50 px-3 py-2.5 text-left transition-colors hover:border-neo-teal/50 hover:bg-neo-teal/5"
                >
                  <span className="truncate text-xs text-muted-foreground group-hover:text-foreground">
                    neo-id.com/p/{profile.slug}
                  </span>
                  <span className="ml-2 flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    {copied ? (
                      <>
                        <Check className="size-3 text-neo-teal" />
                        <span className="text-neo-teal">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </span>
                </button>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border/50">
                <div className="flex flex-col items-center gap-1 bg-card py-4">
                  <Eye className="size-3.5 text-muted-foreground/60" />
                  <p className="text-2xl font-semibold tracking-tight text-foreground/90">
                    {profile.views.toLocaleString()}
                  </p>
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground/70 uppercase">
                    Views
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 bg-card py-4">
                  <CreditCard className="size-3.5 text-muted-foreground/60" />
                  <p className="text-2xl font-semibold tracking-tight text-foreground/90">
                    {profile.taps.toLocaleString()}
                  </p>
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground/70 uppercase">
                    Taps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attach NFC Card */}
          <AttachNeoCardCard
            profileId={profile.id}
            hasCard={profile.hasCard}
            cardRequestStatus={profile.cardRequestStatus}
            cardFrontSvg={profile.cardFrontSvg}
            cardBackSvg={profile.cardBackSvg}
          />

          {/* Danger zone */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <Separator className="bg-destructive/20" />
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="mr-2 size-4" />
                    Delete Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete this profile?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete &quot;{profile.title || profile.slug}&quot;
                      and all associated cards. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Yes, delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
