/**
 * Extract up to 2 uppercase initials from a full name.
 * e.g. "John Doe" → "JD", "Ahmed" → "A"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
