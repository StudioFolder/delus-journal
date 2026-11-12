import {error} from '@sveltejs/kit';
import {issues, journal, peopleOf} from '#lib/data/fixtures.ts';
import {
  articleHref,
  editorialHref,
  editorialTitle,
  editorsOf,
  issueCitationOf
} from '#lib/data/format.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => issues.map((x) => ({slug: x.slug}));

// The issue and its table of contents: each contribution with its
// address and the names of its people. First comes the editorial, as in
// print: the editors' note (editorialTitle), by the issue's editors, at its own
// address (CMS: the issue's Editorial field).
// Each entry has a "cover image", to be chosen in the CMS: for now only
// its proportions (width / height; Sanity knows them from the image),
// upright and lying formats in turn, so the layouts can be judged.
const formats = [4 / 5, 3 / 2, 1, 2 / 3, 16 / 9, 3 / 4];
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
  const contents = rows.map((row, i) => ({...row, image: {ratio: formats[i % formats.length]}}));
  // How to cite the issue (not before it is published)
  const citation = issue.publication.forthcoming ? undefined : issueCitationOf(issue, journal);
  return {issue, contents, citation};
};
