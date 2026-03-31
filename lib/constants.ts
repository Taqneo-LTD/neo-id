// ─── Platform Constants ─────────────────────────────────

/** Platform admin emails — used for admin role assignment */
export const ADMIN_EMAILS = [
  "taqneo101@gmail.com",
  "chnspart@gmail.com",
] as const;

/** Check if an email belongs to a platform admin */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email as typeof ADMIN_EMAILS[number]);
}

/** Card material slugs (match DB seed) */
export const MATERIAL_SLUGS = {
  PLASTIC: "plastic",
  WOOD: "wood",
  METAL: "metal",
} as const;

/** Base template slugs (match DB seed) */
export const TEMPLATE_SLUGS = {
  PRIME: "prime",
} as const;
