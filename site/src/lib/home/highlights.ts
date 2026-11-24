// What a highlight of the home page shows, from what it is (fixtures.ts:
// `Highlight`, as in the CMS — an issue, a news item or an article; nothing
// else can be one): a line of labels in small capitals, then a text in the
// large type (Marco, 15 Nov):
// - issue: its number, then Buy ↗ (its Hatje Cantz link) or *forthcoming*;
//   its abstract;
// - article: Read, then From Issue 01 (where it comes from); its abstract
//   (its title where it has none, as an editors' note);
// - news: its category, then its date (12.11.2026); its title.
// Its image is a link to it (`href`; `name`: for those who can't see it).
// The image (`image`): an article's is its entry image, as on its issue's
// page (its Cover image in the CMS, else its first figure with a file:
// data/images.ts), in its own format. An issue's will be its cover, a news
// item's its first image — none in the CMS yet (24 Nov): their box stays
// empty, in the proportions of the book cover.
import {issues, posts, type Highlight, type Img, type Inline} from '#lib/data/fixtures.ts';
import {entryImage} from '#lib/data/images.ts';
import {articleHref, editorialHref, editorialTitle, fullDate, issueLabel, plainText} from '#lib/data/format.ts';

/** One label: plain; a link (`href`; `external`: to another site, with
 *  the arrow ↗); or in italics (`em`) */
export type Tag = {text: string; href?: string; external?: boolean; em?: boolean};

export type Shown = {
  kind: 'issue' | 'news' | 'article';
  tags: Tag[];
  text: string | Inline[];
  href?: string;
  name?: string;
  image?: {ratio: number; image: Img};
};

// (only an image that has its file: a box of its own format otherwise
// would stand for nothing)
const pictured = (entry: {ratio: number; image?: Img}) =>
  entry.image ? {ratio: entry.ratio, image: entry.image} : undefined;

export function shown(highlight: Highlight): Shown {
  if (highlight._type === 'newsHighlight') {
    const post = posts.find((x) => x.slug === highlight.post);
    return {
      kind: 'news',
      tags: post ? [{text: post.kind}, {text: fullDate(post.date)}] : [],
      text: post?.title ?? '',
      href: post && `/events/${post.slug}/`,
      name: post && plainText(post.title)
    };
  }
  const issue = issues.find((x) => x.slug === highlight.issue);
  if (!issue) return {kind: 'issue', tags: [], text: ''};
  const number = {text: issueLabel(issue.number)};
  if (highlight._type === 'articleHighlight') {
    const from = {text: `From ${number.text}`};
    if (highlight.article === 'editorial')
      return {
        kind: 'article',
        tags: [{text: 'Read'}, from],
        text: editorialTitle,
        href: editorialHref(issue),
        name: editorialTitle,
        image: pictured(entryImage(issue, 0))
      };
    const place = issue.contributions.findIndex((x) => x.slug === highlight.article);
    const contribution = issue.contributions[place];
    return {
      kind: 'article',
      tags: [{text: 'Read'}, from],
      text: contribution?.abstract ?? contribution?.title ?? '',
      href: contribution && articleHref(issue, contribution),
      name: contribution?.title,
      image: contribution && pictured(entryImage(issue, place + 1))
    };
  }
  const {buyUrl, forthcoming} = issue.publication;
  return {
    kind: 'issue',
    tags: [
      number,
      ...(buyUrl
        ? [{text: 'Buy', href: buyUrl, external: true}]
        : forthcoming
          ? [{text: 'forthcoming', em: true}]
          : [])
    ],
    text: issue.abstract,
    href: `/issues/${issue.slug}/`,
    name: `${number.text}, ${issue.title}`
  };
}
