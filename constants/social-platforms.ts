import {
  Globe,
  Link as LinkIcon,
  Linkedin,
} from "lucide-react";
import {
  SiX,
  SiInstagram,
  SiSnapchat,
  SiTiktok,
  SiGithub,
  SiYoutube,
  SiFacebook,
  SiWhatsapp,
  SiTelegram,
} from "@icons-pack/react-simple-icons";
import type { ComponentType, SVGProps } from "react";

export type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { size?: number | string; className?: string }
>;

export type PlatformMeta = {
  label: string;
  icon: IconComponent;
  color: string;
  /** URL prefix for the platform (user only types their handle/path) */
  prefix: string;
  /** Placeholder shown in the input after the prefix */
  placeholder: string;
};

export const PLATFORM_META: Record<string, PlatformMeta> = {
  linkedin:  { label: "LinkedIn",  icon: Linkedin as IconComponent, color: "#0A66C2", prefix: "https://linkedin.com/in/", placeholder: "username" },
  x:         { label: "X",         icon: SiX,         color: "#000000", prefix: "https://x.com/",             placeholder: "username" },
  instagram: { label: "Instagram", icon: SiInstagram, color: "#E4405F", prefix: "https://instagram.com/",     placeholder: "username" },
  snapchat:  { label: "Snapchat",  icon: SiSnapchat,  color: "#FFFC00", prefix: "https://snapchat.com/add/",  placeholder: "username" },
  tiktok:    { label: "TikTok",    icon: SiTiktok,    color: "#FF0050", prefix: "https://tiktok.com/@",       placeholder: "username" },
  github:    { label: "GitHub",    icon: SiGithub,    color: "#FFFFFF", prefix: "https://github.com/",        placeholder: "username" },
  youtube:   { label: "YouTube",   icon: SiYoutube,   color: "#FF0000", prefix: "https://youtube.com/@",      placeholder: "channel" },
  facebook:  { label: "Facebook",  icon: SiFacebook,  color: "#0866FF", prefix: "https://facebook.com/",      placeholder: "username" },
  whatsapp:  { label: "WhatsApp",  icon: SiWhatsapp,  color: "#25D366", prefix: "https://wa.me/",             placeholder: "966-XXX-XXX-XXXX" },
  telegram:  { label: "Telegram",  icon: SiTelegram,  color: "#26A5E4", prefix: "https://t.me/",              placeholder: "username" },
  website:   { label: "Website",   icon: Globe as IconComponent,    color: "#8BDFD7", prefix: "https://",                  placeholder: "yoursite.com" },
  other:     { label: "Other",     icon: LinkIcon as IconComponent, color: "#888888", prefix: "https://",                  placeholder: "link URL" },
};

export const PLATFORM_KEYS = Object.keys(PLATFORM_META);
