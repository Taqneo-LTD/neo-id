// ─── NEO ID Pricing Constants ──────────────────────────
// All prices in SAR. Yearly billing only. VAT (15%) applied at checkout.
// These constants are the source of truth for the codebase.
// Update here when prices change — DB seed references these values.

// ─── Subscription Plans (Yearly Only) ──────────────────

export const PLAN_PRICES = {
  INDIVIDUAL_PRO: 29, // SAR/year
  COMPANY_STARTUP: 348, // SAR/year — 5 seats
  COMPANY_BUSINESS: 948, // SAR/year — 25 seats
  COMPANY_ENTERPRISE: 0, // Custom quotation — negotiated per deal
} as const;

/**
 * NEO ID limits per plan.
 * Individual: maxNeoIds = how many profiles the user can create (0 = unlimited).
 * Company: maxSeats = total NEO IDs across the company (1 seat = 1 NEO ID).
 * No free company plan — all companies must subscribe.
 */
export const PLAN_LIMITS = {
  INDIVIDUAL_FREE: { maxNeoIds: 3, includesPlasticCard: false },
  INDIVIDUAL_PRO: { maxNeoIds: 0, includesPlasticCard: false }, // 0 = unlimited
  COMPANY_STARTUP: {
    maxSeats: 5,
    includesPlasticCard: true,
  },
  COMPANY_BUSINESS: {
    maxSeats: 25,
    includesPlasticCard: true,
  },
  COMPANY_ENTERPRISE: {
    maxSeats: 100, // default; actual count negotiated per deal
    includesPlasticCard: true,
  },
} as const;

// ─── Card Material Prices ──────────────────────────────
// Edition names: Classic (PVC), Artisan (Wood), Prestige (Metal)

export const CARD_PRICES = {
  CLASSIC: { unit: 45, bulk50: 35, bulk100: 28 },
  ARTISAN: { unit: 95, bulk50: 80, bulk100: 70 },
  PRESTIGE: { unit: 175, bulk50: 150, bulk100: 130 },
} as const;

/** Base price for Classic edition — used to calculate upgrade cost for company plans */
export const CLASSIC_BASE_PRICE = CARD_PRICES.CLASSIC.unit; // SAR 45

// ─── Template Prices ───────────────────────────────────

export const TEMPLATE_PRICES = {
  PREMIUM_SINGLE: 25,
  PACK_5: 79,
  CUSTOM_DESIGN: 299,
} as const;

// ─── Shipping ──────────────────────────────────────────

export const SHIPPING = {
  STANDARD: 25, // SAR, 3–5 business days
  EXPRESS: 45, // SAR, 1–2 business days
  FREE_THRESHOLD: 200, // SAR — free shipping above this
} as const;

// ─── VAT ───────────────────────────────────────────────

export const VAT_RATE = 0.15; // 15% Saudi VAT
