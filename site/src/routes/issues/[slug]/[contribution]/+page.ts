import {error} from '@sveltejs/kit';
import {issues, journal, peopleOf} from '#lib/data/fixtures.ts';
import {citationOf} from '#lib/data/format.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () =>
  issues.flatMap((issue) => issue.contributions.map((c) => ({slug: issue.slug, contribution: c.slug})));

// The contribution, its issue, the names of its people, in their order,
// and how to cite it
export const load: PageLoad = ({params}) => {
  const issue = issues.find((x) => x.slug === params.slug);
  const contribution = issue?.contributions.find((c) => c.slug === params.contribution);
  if (!issue || !contribution) error(404);
  const by = peopleOf(contribution);
  const authors = by.map((x) => x.name);
  const citation = citationOf(issue, contribution, by, journal);
  return {contribution, authors, issue, citation};
};
