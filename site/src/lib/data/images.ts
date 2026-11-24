/**
 * THE IMAGE OF EACH ENTRY of an issue's contents — its cover image: the
 * piece's Cover image in the CMS (fixtures.ts: `cover`), else its first
 * figure that has its file (Marco, 24 Nov), shown in the file's own
 * proportions. A piece with
 * none yet keeps an empty box, upright and lying formats in turn
 * (width / height), so the layouts can be judged. The first entry of an
 * issue is its editorial, then the contributions in their order.
 * Used by the issue's page (gallery, grid, Phone list) and by the links
 * to an article in a text (the miniature in the margin: ArticleBody).
 */
import {issues, type Img, type Issue} from './fixtures.ts';
import {articleHref} from './format.ts';

const formats = [4 / 5, 3 / 2, 1, 2 / 3, 16 / 9, 3 / 4];

/** The image of the entry at this place in an issue's contents (0 = the editorial) */
export function entryImage(issue: Issue, place: number): {ratio: number; image?: Img} {
  const piece = place ? issue.contributions[place - 1] : issue.editorial;
  if (piece?.cover) return {ratio: Math.round((piece.cover.width / piece.cover.height) * 1000) / 1000, image: piece.cover};
  const figure = (piece?.body ?? []).flatMap((b) => (typeof b === 'object' && !Array.isArray(b) && 'figure' in b ? [b.figure] : [])).find((f) => f.image);
  return figure?.image ? {ratio: figure.ratio, image: figure.image} : {ratio: formats[place % formats.length]};
}

/** The image of the article at this address of the site, if it is one */
export function imageAt(href: string) {
  for (const issue of issues) {
    const i = issue.contributions.findIndex((c) => articleHref(issue, c) === href);
    if (i >= 0) return entryImage(issue, i + 1);
  }
}
