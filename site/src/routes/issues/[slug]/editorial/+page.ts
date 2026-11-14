import {error} from '@sveltejs/kit';
import {issues, journal, type Contribution} from '#lib/data/fixtures.ts';
import {citationOf, editorialTitle, editorsOf, issueLabel, surnameFirst} from '#lib/data/format.ts';
import {brief, opening} from '#lib/head/head.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => issues.map((x) => ({slug: x.slug}));

// The editorial of an issue, shaped as a contribution (so that its page
// is the article's): its own title (editorialTitle) and the
// issue's editors as its people, and its text and notes when the
// issue has them (Issue 01, from the print; CMS: the issue's Editorial
// field).
export const load: PageLoad = ({params}) => {
  const issue = issues.find((x) => x.slug === params.slug);
  if (!issue) error(404);
  const authors = editorsOf(issue);
  const contribution: Contribution = {
    title: editorialTitle,
    slug: 'editorial',
    people: [],
    page: issue.editorial?.page,
    doi: issue.editorial?.doi,
    body: issue.editorial?.body,
    notes: issue.editorial?.notes
  };
  // Surname first, for the citation
  const by = authors.map((name) => ({name, sortName: surnameFirst(name)}));
  const citation = citationOf(issue, contribution, by, journal);
  // The page's head: "A Note from the Editors, Issue 01", and how the text opens
  const title = `${editorialTitle}, ${issueLabel(issue.number)}`;
  return {contribution, authors, issue, citation, title, description: brief(opening(contribution.body))};
};
