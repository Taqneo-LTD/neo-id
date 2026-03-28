// ─── Phone Country Codes ────────────────────────────────
// Add new countries here as needed — the first entry is the default.

export type CountryCode = {
  code: string;
  dialCode: string;
  /** Path to flag SVG in /public/flags/ */
  flagSrc: string;
  name: string;
  placeholder: string;
};

export const COUNTRY_CODES: CountryCode[] = [
  {
    code: "SA",
    dialCode: "+966",
    flagSrc: "/flags/sa.svg",
    name: "Saudi Arabia",
    placeholder: "5X XXX XXXX",
  },
];

export const DEFAULT_COUNTRY = COUNTRY_CODES[0];
