/**
 * Format an ISO date string to a short, readable date.
 * e.g. "2026-03-08T..." → "Mar 8, 2026"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
