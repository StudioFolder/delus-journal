import {error} from '@sveltejs/kit';
import {issues, journal, peopleOf} from '#lib/data/fixtures.ts';
import {
  articleHref,
  editorialHref,
  editorialTitle,
  editorsOf,
  issueCitationOf,
  issueLabel
} from '#lib/data/format.ts';
import {entryImage} from '#lib/data/images.ts';
import {brief} from '#lib/head/head.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => issues.map((x) => ({slug: x.slug}));

// The issue and its table of contents: each contribution with its
// address and the names of its people. First comes the editorial, as in
// print: the editors' note (editorialTitle), by the issue's editors, at its own
// address (CMS: the issue's Editorial field).
// Each entry has a "cover image" (for now only its proportions:
// #lib/data/images.ts).
export const load: PageLoad = ({params}) => {
  const issue = issues.find((x) => x.slug === params.slug);
  if (!issue) error(404);
  const rows = [
    {title: editorialTitle, href: editorialHref(issue), by: editorsOf(issue).join(', ')},
    ...issue.contributions.map((c) => ({
      title: c.title,
      href: articleHref(issue, c),
      by: peopleOf(c)
        .map((x) => x.name)
        .join(', ')
    }))
  ];
  const contents = rows.map((row, i) => ({...row, image: entryImage(i)}));
  // How to cite the issue (not before it is published)
  const citation = issue.publication.forthcoming ? undefined : issueCitationOf(issue, journal);
  // The page's head: "Issue 01, Chasing Water" (Issue 00's title is the journal's name)
  const title = issue.title === 'DELUS' ? issueLabel(issue.number) : `${issueLabel(issue.number)}, ${issue.title}`;
  return {issue, contents, citation, title, description: brief(issue.abstract)};
};
