/**
 * DESKTOP BAND LAYOUTS
 *
 * The screen is divided into 36 equal columns (40px each at 1440px wide).
 * Columns are numbered 1–36, left to right, like in Figma.
 * A span [from, to] covers columns `from` to `to`, both included:
 *   [2, 13] = column 2 through column 13 = 12 columns.
 *
 * Each URL sets where the band sits.
 * Change a number here and the band moves; navigating between two URLs
 * animates the band from one setting to the other.
 *
 * A URL can also have a `focus` setting: what changes while the visitor
 * points at the page's image (see focus.ts). On the home page the band
 * is Large, and Medium while the pointer is on the image.
 *
 * More panels (content, media…) will be added here the same way.
 */

export const COLUMNS = 36;

export type Span = [from: number, to: number];
export type Layout = {
  band: Span;
  /** What changes while the visitor points at the page's image */
  focus?: {band: Span};
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
  // Home: Large; Medium while pointing at the image
  '/': {band: l, focus: {band: m}},

  // The menu's four sections. News lives at /events/ for now.
  '/about': {band: s},
  '/issues': {band: m},
  '/contributors': {band: l},
  '/events': {band: m},

  '/issues/[slug]': {band: m},
  '/issues/[slug]/editorial': {band: s, back: (p) => `/issues/${p.slug}/`},
  '/contributors/[slug]': {band: s, back: '/contributors/'},
  '/events/[slug]': {band: m},
  '/donate': {band: m},
  '/shop': {band: m}
};

export const fallback: Layout = {band: m};

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
