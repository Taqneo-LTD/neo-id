"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrefixInput } from "@/components/ui/form-fields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORM_META, PLATFORM_KEYS } from "@/constants/social-platforms";

type SocialLink = {
  platform: string;
  url: string;
  label?: string;
};

/**
 * Given a full URL and a platform, strip the known prefix to get the handle.
 * If the URL doesn't start with the prefix, return as-is.
 */
function stripPrefix(url: string, platform: string): string {
  const meta = PLATFORM_META[platform];
  if (!meta) return url;
  if (url.startsWith(meta.prefix)) return url.slice(meta.prefix.length);
  // Also handle http variant
  const httpPrefix = meta.prefix.replace("https://", "http://");
  if (url.startsWith(httpPrefix)) return url.slice(httpPrefix.length);
  return url;
}

/** Format phone-like input with dashes for display (e.g. 966-XXX-XXX-XXXX) */
function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** Build the full URL from handle + platform prefix */
function buildUrl(handle: string, platform: string): string {
  const meta = PLATFORM_META[platform];
  if (!meta) return handle;
  // If user pasted a full URL, keep it
  if (handle.startsWith("http://") || handle.startsWith("https://")) return handle;
  // For WhatsApp, strip dashes before building URL
  if (platform === "whatsapp") {
    const digits = handle.replace(/\D/g, "");
    return digits ? `${meta.prefix}${digits}` : "";
  }
  return handle ? `${meta.prefix}${handle}` : "";
}

export function SocialLinksEditor({
  links,
  onChange,
}: {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}) {
  function addLink() {
    onChange([...links, { platform: "linkedin", url: "" }]);
  }

  function removeLink(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }

  function updatePlatform(index: number, newPlatform: string) {
    const updated = links.map((link, i) => {
      if (i !== index) return link;
      // When switching platform, try to keep the handle and rebuild with new prefix
      const handle = stripPrefix(link.url, link.platform);
      return { ...link, platform: newPlatform, url: buildUrl(handle, newPlatform) };
    });
    onChange(updated);
  }

  function updateHandle(index: number, rawHandle: string, platform: string) {
    // Format WhatsApp numbers with dashes for display
    const handle = platform === "whatsapp" ? formatPhoneDisplay(rawHandle) : rawHandle;
    const updated = links.map((link, i) => {
      if (i !== index) return link;
      return { ...link, url: buildUrl(handle, link.platform) };
    });
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {links.map((link, i) => {
        const meta = PLATFORM_META[link.platform];
        const Icon = meta?.icon;
        const rawHandle = stripPrefix(link.url, link.platform);
        // Show WhatsApp numbers with dashes
        const handle = link.platform === "whatsapp" ? formatPhoneDisplay(rawHandle) : rawHandle;

        return (
          <div key={i} className="flex items-start gap-2">
            <Select
              value={link.platform}
              onValueChange={(v) => updatePlatform(i, v)}
            >
              <SelectTrigger className="w-[160px] shrink-0">
                <SelectValue>
                  {meta && (
                    <span className="flex items-center gap-2">
                      <span
                        className="flex size-5 items-center justify-center rounded"
                        style={{
                          backgroundColor:
                            link.platform === "github"
                              ? "rgba(255,255,255,0.1)"
                              : `${meta.color}15`,
                        }}
                      >
                        {Icon && (
                          <Icon
                            size={12}
                            className="size-3"
                            style={{ color: meta.color }}
                          />
                        )}
                      </span>
                      <span className="text-sm">{meta.label}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_KEYS.map((key) => {
                  const p = PLATFORM_META[key];
                  const PIcon = p.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span
                          className="flex size-5 items-center justify-center rounded"
                          style={{
                            backgroundColor:
                              key === "github"
                                ? "rgba(255,255,255,0.1)"
                                : `${p.color}15`,
                          }}
                        >
                          <PIcon
                            size={12}
                            className="size-3"
                            style={{ color: p.color }}
                          />
                        </span>
                        <span>{p.label}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <PrefixInput
              addon={meta?.prefix ?? "https://"}
              placeholder={meta?.placeholder ?? "URL"}
              value={handle}
              onChange={(e) => updateHandle(i, e.target.value, link.platform)}
              className="flex-1"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeLink(i)}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLink}
        className="w-full"
      >
        <Plus className="mr-2 size-4" />
        Add Link
      </Button>
    </div>
  );
}
