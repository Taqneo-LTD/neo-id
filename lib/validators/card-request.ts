import { z } from "zod";

export const createCardRequestSchema = z.object({
  profileId: z.string().min(1),
  materialId: z.string().min(1),
  templateId: z.string().min(1),
  variantId: z.string().min(1),
});

export const placeCompanyOrderSchema = z.object({
  requestIds: z.array(z.string().min(1)).min(1),
  shipping: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional().default(""),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
  }),
});
