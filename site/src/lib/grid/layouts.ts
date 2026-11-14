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
 * A URL can also have a `focus` setting: a second state of the page,
 * with another band. An article's band opens to Medium while the article
 * is searched (#lib/search/Find.svelte).
 * The menu or "Back", and Back's address, go by the page's own band.
 *
 * More panels (content, media…) will be added here the same way.
 */

export const COLUMNS = 36;

export type Span = [from: number, to: number];
export type Layout = {
  band: Span;
  /** The page's second state (an article being searched) */
  focus?: {band: Span};
  /** Small band only: where "Back" leads (default: home) */
  back?: string | ((params: Record<string, string>) => string);
  /** Phone: the page scrolls the window, not its panels (FLOW in routes/+layout.svelte) */
  flows?: boolean;
};

// Band sizes
export const sizes = {
  s: [2, 7], //   6 columns
  m: [2, 13], // 12 columns
  l: [2, 19] // 18 columns
} satisfies Record<string, Span>;

const {s, m, l} = sizes;

export const layouts: Record<string, Layout> = {
  // Home: Large
  '/': {band: l},

  // The menu's five sections. News lives at /events/ for now.
  '/about': {band: m},
  '/issues': {band: m},
  '/contributors': {band: m},
  '/events': {band: m},
  '/search': {band: m},

  '/issues/[slug]': {band: m},
  // An issue's editorial ("A Note from the Editors"): as an article
  '/issues/[slug]/editorial': {band: s, focus: {band: m}, back: (p) => `/issues/${p.slug}/`, flows: true},
  // An article (a contribution): under its issue; Medium while it is searched
  '/issues/[slug]/[contribution]': {band: s, focus: {band: m}, back: (p) => `/issues/${p.slug}/`, flows: true},
  '/contributors/[slug]': {band: s, back: '/contributors/'},
  '/events/[slug]': {band: m},
  // Imprint and Privacy (from the footer): laid out as News
  '/(legal)/imprint': {band: m},
  '/(legal)/privacy': {band: m},
  '/donate': {band: m},
  '/shop': {band: m}
};

export const fallback: Layout = {band: m};

/** The name of a band size ('s', 'm', 'l'), if the span is one of them */
export function sizeOf([from, to]: Span): string | undefined {
  return Object.entries(sizes).find(([, [f, t]]) => f === from && t === to)?.[0];
}

export const isSmall = (layout: Layout) =>
  layout.band[0] === sizes.s[0] && layout.band[1] === sizes.s[1];

export function backFor(layout: Layout, params: Record<string, string>): string {
  const b = layout.back ?? '/';
  return typeof b === 'function' ? b(params) : b;
}

export function layoutFor(routeId: string | null): Layout {
  return (routeId && layouts[routeId]) || fallback;
}

/**
 * The space to the right of the band, and a span of `cols` columns in the
 * middle of it. With the Large band [2, 19] and 13 columns: [22, 34];
 * with the Medium band [2, 13]: [19, 31].
 */
export function centredRight(band: Span, cols: number): Span {
  const free = COLUMNS - band[1];
  const from = band[1] + 1 + (free - cols) / 2;
  return [from, from + cols - 1];
}

/** Everything to the right of the band. With the Medium band [2, 13]: [14, 36] */
export function restOfScreen(band: Span): Span {
  return [band[1] + 1, COLUMNS];
}

/** The width of a column of text beside the band, one column after it (as the Large band) */
export const TEXT_COLUMNS = 18;

/** The width of a cover image, in columns */
export const COVER_COLUMNS = 13;

/** CSS for a span: left edge and width in column units */
export function spanStyle([from, to]: Span): string {
  return `--from:${from - 1};--cols:${to - from + 1};`;
}
