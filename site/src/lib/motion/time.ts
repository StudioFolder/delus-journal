/**
 * Reads a duration set in styles.css (e.g. '--tone-time') in milliseconds,
 * so timings are written in one place only.
 */
export function time(name: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 0;
  return value.endsWith('ms') ? n : n * 1000;
}
