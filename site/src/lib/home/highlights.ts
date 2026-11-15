// What a highlight of the home page shows, from what it is (fixtures.ts:
// `Highlight`, as in the CMS — an issue, a news item or an article; nothing
// else can be one). Each kind is meant to have its own block; only the
// issue's is designed so far:
// - issue: its number, with Buy (its Hatje Cantz link) or "forthcoming"
//   beside it, and its abstract;
// - news, article: for now the same block, as a placeholder — the post's
//   category and title; the article's issue and title.
import {issues, posts, type Highlight} from '#lib/data/fixtures.ts';
import {articleHref, editorialHref, editorialTitle, issueLabel} from '#lib/data/format.ts';
import type {Inline} from '#lib/data/fixtures.ts';

export type Shown = {
  kind: 'issue' | 'news' | 'article';
  label: string;
  text: string | Inline[];
  href?: string;
  buy?: string; // an issue on sale
  forthcoming?: boolean; // an issue not out yet
};

export function shown(highlight: Highlight): Shown {
  if (highlight._type === 'newsHighlight') {
    const post = posts.find((x) => x.slug === highlight.post);
    return {kind: 'news', label: post?.kind ?? 'News', text: post?.title ?? '', href: post && `/events/${post.slug}/`};
  }
  const issue = issues.find((x) => x.slug === highlight.issue);
  if (!issue) return {kind: 'issue', label: '', text: ''};
  if (highlight._type === 'articleHighlight') {
    const label = issueLabel(issue.number);
    if (highlight.article === 'editorial')
      return {kind: 'article', label, text: editorialTitle, href: editorialHref(issue)};
    const contribution = issue.contributions.find((x) => x.slug === highlight.article);
    return {
      kind: 'article',
      label,
      text: contribution?.title ?? '',
      href: contribution && articleHref(issue, contribution)
    };
  }
  return {
    kind: 'issue',
    label: issueLabel(issue.number),
    text: issue.abstract,
    href: `/issues/${issue.slug}/`,
    buy: issue.publication.buyUrl,
    forthcoming: issue.publication.forthcoming
  };
}
