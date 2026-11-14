// The sitemap: every page worth finding, as one file written when the
// site is built — from the same lists the pages are made from, so a new
// issue, article or news item is in it without anything to add here.
// Left out: the search, the pages still empty (Donate, Shop, a
// contributor's own), and the articles of a forthcoming issue (names only).
import {issues, legal, posts, site} from '#lib/data/fixtures.ts';
import {articleHref, editorialHref} from '#lib/data/format.ts';

export const prerender = true;

export function GET() {
  const paths = [
    '/',
    '/about/',
    '/issues/',
    ...issues.flatMap((issue) => [
      `/issues/${issue.slug}/`,
      ...(issue.publication.forthcoming
        ? []
        : [editorialHref(issue), ...issue.contributions.map((c) => articleHref(issue, c))])
    ]),
    '/contributors/',
    '/events/',
    ...posts.map((post) => `/events/${post.slug}/`),
    ...legal.map((text) => `/${text.slug}/`)
  ];
  const urls = paths.map((path) => `  <url><loc>${site.url}${path}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {headers: {'Content-Type': 'application/xml'}}
  );
}
