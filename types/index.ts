export type { User, Company, Profile, Template, Card, Order, Plan } from "@/lib/generated/prisma/client";
export { UserRole, AccountType, CardType, CardStatus, OrderStatus, TemplateTier, PlanTier } from "@/lib/generated/prisma/enums";

export type SocialLink = {
  platform: string;
  url: string;
  label?: string;
};

export type ContactInfo = {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  addressAr?: string;
  city?: string;
  country?: string;
};

export type BrandColors = {
  primary: string;
  secondary: string;
  accent: string;
};
