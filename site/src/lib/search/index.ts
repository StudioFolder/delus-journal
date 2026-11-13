/**
 * SEARCH — what can be found
 *
 * One entry for each thing the search can lead to: every article and
 * editors' note (title, people, abstract, text, captions, notes), every
 * issue (title, abstract) and every news item (title, text).
 * A contributor has no entry: a name finds that person's articles.
 * Imprint and Privacy are left out.
 *
 * The list is written once, when the site is built, to /search.json
 * (routes/search.json), which the search page reads. When the site reads
 * from the CMS, only where this list comes from changes.
 */
import {issues, newestFirst, peopleOf, posts, type Block, type Inline} from '#lib/data/fixtures.ts';
import {
  articleHref,
  editorialHref,
  editorialTitle,
  editorsOf,
  issueLabel,
  plain
} from '#lib/data/format.ts';

export type Entry = {
  href: string;
  where: string; // "Issue 01", or a news item's category
  title: string;
  by: string; // the people, comma separated ('' when there are none)
  text: string; // everything else, as plain text, one paragraph per line
};

const inline = (x: string | Inline[]) => (typeof x === 'string' ? x : plain(x));

const block = (b: Block) =>
  typeof b === 'string' || Array.isArray(b)
    ? inline(b)
    : 'quote' in b
      ? inline(b.quote)
      : 'heading' in b
        ? b.heading
        : plain(b.figure.caption);

// The parts of a text, one per line; composed letters (é as one letter),
// so that finding ignores accents letter by letter (find.ts)
const lines = (...parts: (string | undefined)[]) =>
  parts
    .filter((x) => x)
    .join('\n')
    .normalize('NFC');

const textOf = (x: {abstract?: string; body?: Block[]; notes?: Inline[][]}) =>
  lines(x.abstract, ...(x.body ?? []).map(block), ...(x.notes ?? []).map(plain));

export function entries(): Entry[] {
  const list: Entry[] = [];
  for (const issue of newestFirst) {
    const where = issueLabel(issue.number);
    list.push({
      href: `/issues/${issue.slug}/`,
      where,
      title: issue.title,
      by: '',
      text: lines(inline(issue.abstract))
    });
    list.push({
      href: editorialHref(issue),
      where,
      title: editorialTitle,
      by: editorsOf(issue).join(', '),
      text: textOf(issue.editorial ?? {})
    });
    for (const c of issue.contributions)
      list.push({
        href: articleHref(issue, c),
        where,
        title: c.title,
        by: peopleOf(c)
          .map((x) => x.name)
          .join(', '),
        text: textOf(c)
      });
  }
  for (const post of posts)
    list.push({
      href: `/events/${post.slug}/`,
      where: post.kind,
      title: post.title,
      by: '',
      text: lines(...(post.body ?? []))
    });
  return list;
}
