import { z } from "zod";

export const brandColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
});

export const createCompanySchema = z.object({
  nameEn: z.string().min(2).max(100),
  nameAr: z.string().max(100).optional(),
  crNumber: z.string().max(20).optional(),
  website: z.string().url().optional(),
});

export const updateCompanySchema = createCompanySchema.partial().extend({
  brandColors: brandColorsSchema.optional(),
});

export const inviteEmployeeSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});
