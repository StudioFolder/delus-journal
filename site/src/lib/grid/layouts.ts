/**
 * DESKTOP BAND LAYOUTS
 *
 * The screen is divided into 36 equal columns (40px each at 1440px wide).
 * Columns are numbered 1–36, left to right, like in Figma.
 * A span [from, to] covers columns `from` to `to`, both included:
 *   [2, 13] = column 2 through column 13 = 12 columns.
 *
 * Each URL sets where the band sits and which tone the site takes
 * (dark or light — the colours of each tone are in styles.css).
 * Change a value here and the page changes; navigating between two URLs
 * animates the band and the colours from one setting to the other.
 *
 * More panels (content, media…) will be added here the same way.
 */

export const COLUMNS = 36;

export type Span = [from: number, to: number];
export type Tone = 'dark' | 'light';
export type Layout = {
  band: Span;
  tone: Tone;
  /** Small band only: where "Back" leads (default: home, the Medium band) */
  back?: string | ((params: Record<string, string>) => string);
};

// Band sizes
export const sizes = {
  s: [2, 7], //   6 columns
  m: [2, 13], // 12 columns
  l: [2, 19], // 18 columns
  xl: [2, 25] // 24 columns
} satisfies Record<string, Span>;

const {s, m, l, xl} = sizes;

export const layouts: Record<string, Layout> = {
  // Default: Medium
  '/': {band: m, tone: 'dark'},

  // Temporary: the menu items Small, Large, X-Large lead to these sections
  '/about': {band: s, tone: 'light'},
  '/contributors': {band: l, tone: 'light'},
  '/events': {band: xl, tone: 'dark'},

  '/issues': {band: m, tone: 'dark'},
  '/issues/[slug]': {band: m, tone: 'dark'},
  '/issues/[slug]/editorial': {band: s, tone: 'light', back: (p) => `/issues/${p.slug}/`},
  '/contributors/[slug]': {band: s, tone: 'light', back: '/contributors/'},
  '/events/[slug]': {band: m, tone: 'light'},
  '/donate': {band: m, tone: 'light'},
  '/shop': {band: m, tone: 'dark'}
};

export const fallback: Layout = {band: m, tone: 'dark'};

export const isSmall = (layout: Layout) =>
  layout.band[0] === sizes.s[0] && layout.band[1] === sizes.s[1];

export function backFor(layout: Layout, params: Record<string, string>): string {
  const b = layout.back ?? '/';
  return typeof b === 'function' ? b(params) : b;
}

export function layoutFor(routeId: string | null): Layout {
  return (routeId && layouts[routeId]) || fallback;
}

/** CSS for a span: left edge and width in column units */
export function spanStyle([from, to]: Span): string {
  return `--from:${from - 1};--cols:${to - from + 1};`;
}
