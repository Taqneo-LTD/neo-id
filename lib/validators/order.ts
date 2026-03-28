import { z } from "zod";

export const shippingAddressSchema = z.object({
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("SA"),
  phone: z.string().min(1),
});

export const createOrderSchema = z.object({
  cards: z
    .array(
      z.object({
        profileId: z.string().cuid(),
        cardType: z.enum(["PLASTIC", "WOOD", "METAL"]),
        quantity: z.number().int().min(1).max(500),
      })
    )
    .min(1),
  shippingAddr: shippingAddressSchema,
  shippingSpeed: z.enum(["standard", "express"]).default("standard"),
});

// ─── PayPal Order Flow Schemas ───────────────────────────

const wizardShippingSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional().default(""),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
});

export const orderInputSchema = z.object({
  profileId: z.string().min(1),
  materialId: z.string().min(1),
  templateId: z.string().min(1),
  variantId: z.string().min(1),
  materialSlug: z.string().min(1),
  materialUnitPrice: z.number().min(0),
  templatePrice: z.number().min(0),
  shipping: wizardShippingSchema,
  pendingRequestIds: z.array(z.string()),
  requestOverrides: z
    .record(
      z.string(),
      z.object({
        materialId: z.string().min(1),
        templateId: z.string().min(1),
        variantId: z.string().min(1),
        materialSlug: z.string().min(1),
        materialUnitPrice: z.number().min(0),
      }),
    )
    .optional(),
  memberCardOrders: z
    .array(
      z.object({
        userId: z.string().min(1),
        profileId: z.string().nullable(),
        profileSlug: z.string().nullable(),
        materialId: z.string().min(1),
        materialSlug: z.string().min(1),
        materialUnitPrice: z.number().min(0),
        templateId: z.string().min(1),
        variantId: z.string().min(1),
      }),
    )
    .optional(),
  emptySeatCards: z
    .array(
      z.object({
        materialId: z.string().min(1),
        materialSlug: z.string().min(1),
        materialUnitPrice: z.number().min(0),
        templateId: z.string().min(1),
        variantId: z.string().min(1),
      }),
    )
    .optional(),
});

export const captureOrderSchema = z.object({
  paypalOrderId: z.string().min(1),
  dbOrderId: z.string().min(1),
});
