/**
 * THE IMAGE OF EACH ENTRY of an issue's contents — its "cover image", to
 * be chosen in the CMS. For now only its proportions (width / height;
 * Sanity knows them from the image), upright and lying formats in turn,
 * so the layouts can be judged. The first entry of an issue is its
 * editorial, then the contributions in their order.
 * Used by the issue's page (gallery and grid) and by the links to an
 * article in a text (the miniature in the margin: ArticleBody).
 */
import {issues} from './fixtures.ts';
import {articleHref} from './format.ts';

const formats = [4 / 5, 3 / 2, 1, 2 / 3, 16 / 9, 3 / 4];

/** The image of the entry at this place in an issue's contents (0 = the editorial) */
export const entryImage = (place: number) => ({ratio: formats[place % formats.length]});

/** The image of the article at this address of the site, if it is one */
export function imageAt(href: string) {
  for (const issue of issues) {
    const i = issue.contributions.findIndex((c) => articleHref(issue, c) === href);
    if (i >= 0) return entryImage(i + 1);
  }
}
