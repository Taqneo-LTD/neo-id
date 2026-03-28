import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Download,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PLATFORM_META } from "@/constants/social-platforms";
import { getInitials } from "@/lib/string-utils";

type ProfileData = {
  slug: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  name: string;
  companyName?: string | null;
  companyLogo?: string | null;
  contactInfo: Record<string, string> | null;
  socialLinks: Array<{ platform: string; url: string; label?: string }> | null;
};

export function ProfilePublic({ profile }: { profile: ProfileData }) {
  const contact = profile.contactInfo;
  const socials = profile.socialLinks ?? [];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 pt-4 pb-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg">
          {/* Header gradient */}
          <div className="h-24 bg-gradient-to-br from-neo-teal/30 via-neo-blue/20 to-neo-lime/10" />

          {/* Avatar + Name */}
          <div className="relative px-6 pb-6 text-center">
            <div className="-mt-14 mb-4 flex justify-center">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="size-24 rounded-full border-4 border-card object-cover"
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-full border-4 border-card bg-neo-teal/10 text-3xl font-bold text-neo-teal">
                  {getInitials(profile.name)}
                </div>
              )}
            </div>

            <h1 className="text-xl font-bold">{profile.name}</h1>
            {profile.title && (
              <p className="text-sm text-muted-foreground">{profile.title}</p>
            )}
            {profile.companyName && (
              <div className="mt-1 flex items-center justify-center gap-2">
                {profile.companyLogo && (
                  <Image
                    src={profile.companyLogo}
                    alt={profile.companyName}
                    width={16}
                    height={16}
                    className="size-4"
                  />
                )}
                <p className="text-sm text-muted-foreground">
                  {profile.companyName}
                </p>
              </div>
            )}
            {profile.bio && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Contact action buttons */}
          {contact && (contact.phone || contact.email) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-2 p-4">
                {contact.phone && (
                  <Button variant="outline" asChild className="w-full py-3">
                    <a href={`tel:${contact.phone}`}>
                      <Phone className="mr-2 size-4" />
                      Call
                    </a>
                  </Button>
                )}
                {contact.email && (
                  <Button variant="outline" asChild className="w-full py-3">
                    <a href={`mailto:${contact.email}`}>
                      <Mail className="mr-2 size-4" />
                      Email
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Contact details */}
          {contact && (contact.website || contact.address) && (
            <>
              <Separator />
              <div className="space-y-3 p-4">
                {contact.website && (
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Globe className="size-4 shrink-0" />
                    <span className="truncate">
                      {contact.website.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                )}
                {contact.address && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    <span>{contact.address}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Social links */}
          {socials.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1 p-4">
                {socials.map((link, i) => {
                  const meta = PLATFORM_META[link.platform];
                  const Icon = meta?.icon;

                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm transition-colors hover:bg-muted"
                    >
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: meta
                            ? link.platform === "github"
                              ? "rgba(255,255,255,0.1)"
                              : `${meta.color}15`
                            : "hsl(var(--muted))",
                        }}
                      >
                        {Icon ? (
                          <Icon
                            size={16}
                            className="size-4"
                            style={{ color: meta.color }}
                          />
                        ) : link.platform === "website" ? (
                          <Globe className="size-4 text-muted-foreground" />
                        ) : (
                          <LinkIcon className="size-4 text-muted-foreground" />
                        )}
                      </span>
                      <span className="flex-1 font-medium">
                        {link.label || meta?.label || link.platform}
                      </span>
                      <ExternalLink className="size-3.5 text-muted-foreground" />
                    </a>
                  );
                })}
              </div>
            </>
          )}

          {/* Save contact / vCard */}
          <Separator />
          <div className="p-4">
            <Button className="w-full py-3.5 text-base" asChild>
              <a href={`/api/profiles/${profile.slug}/vcard`}>
                <Download className="mr-2 size-4" />
                Save Contact
              </a>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Image
              src="/brandings/logo-icon.svg"
              alt="NEO ID"
              width={14}
              height={13}
              className="h-[13px] w-auto"
            />
            Get your NEO ID card
          </Link>
        </div>
      </div>
    </div>
  );
}
