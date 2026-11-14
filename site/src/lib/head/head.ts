/**
 * HEAD — what a page says about itself outside the page: its title (the
 * browser's tab, a search engine's result, a bookmark) and its
 * description (under the title in a search engine, in a link shared).
 * Written into the page's head by the root layout (routes/+layout.svelte).
 *
 * - A section's page takes its name from the list below, by its route.
 * - A page made from content (an issue, an article, a news item) gives
 *   its own from its `load`: `title` and, if it has one, `description`
 *   (its abstract or first paragraph). So a new issue, article or news
 *   item in the CMS has its head without anything to add here.
 * - Anything else: the site's own (the journal's name; the statement of
 *   the home page).
 */
import {site, type Block, type Inline} from '#lib/data/fixtures.ts';
import {plain} from '#lib/data/format.ts';

/** The sections, by route (the names of the menu, and of the legal pages) */
export const sections: Record<string, string> = {
  '/about': 'About',
  '/issues': 'Issues',
  '/contributors': 'Contributors',
  '/events': 'News',
  '/search': 'Search',
  '/(legal)/imprint': 'Imprint',
  '/(legal)/privacy': 'Privacy'
};

/** The site's own title, and a page's: "Chasing Water — DELUS" */
export const siteTitle = `DELUS — ${site.tagline}`;
export const pageTitle = (name?: string) => (name ? `${name} — DELUS` : siteTitle);

/** A text as a description: plain, on one line, cut at a word's end */
export function brief(text: string | Inline[] | undefined, max = 160): string | undefined {
  if (!text) return;
  const line = (typeof text === 'string' ? text : plain(text)).replace(/\s+/g, ' ').trim();
  if (line.length <= max) return line || undefined;
  const cut = line.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.–—-]+$/, '')}…`;
}

/** The first paragraph of a text, for a page without an abstract */
export const opening = (body?: Block[]) =>
  body?.find((b): b is string | Inline[] => typeof b === 'string' || Array.isArray(b));
