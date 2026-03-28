import { z } from "zod";

export const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
  label: z.string().optional(),
});

export const contactInfoSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  addressAr: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const createProfileSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  name: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  contactInfo: contactInfoSchema.optional(),
  templateId: z.string().cuid().optional(),
});

export const updateProfileSchema = createProfileSchema.partial();
