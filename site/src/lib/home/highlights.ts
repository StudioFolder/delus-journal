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
import {issues, posts, type Highlight, type Inline} from '#lib/data/fixtures.ts';
import {articleHref, editorialHref, editorialTitle, fullDate, issueLabel} from '#lib/data/format.ts';

/** One label: plain; a link (`href`; `external`: to another site, with
 *  the arrow ↗); or in italics (`em`) */
export type Tag = {text: string; href?: string; external?: boolean; em?: boolean};

export type Shown = {
  kind: 'issue' | 'news' | 'article';
  tags: Tag[];
  text: string | Inline[];
  href?: string;
  name?: string;
};

export function shown(highlight: Highlight): Shown {
  if (highlight._type === 'newsHighlight') {
    const post = posts.find((x) => x.slug === highlight.post);
    return {
      kind: 'news',
      tags: post ? [{text: post.kind}, {text: fullDate(post.date)}] : [],
      text: post?.title ?? '',
      href: post && `/events/${post.slug}/`,
      name: post?.title
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
        name: editorialTitle
      };
    const contribution = issue.contributions.find((x) => x.slug === highlight.article);
    return {
      kind: 'article',
      tags: [{text: 'Read'}, from],
      text: contribution?.abstract ?? contribution?.title ?? '',
      href: contribution && articleHref(issue, contribution),
      name: contribution?.title
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
