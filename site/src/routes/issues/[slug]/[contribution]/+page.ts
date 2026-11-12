import {error} from '@sveltejs/kit';
import {issues, people} from '#lib/data/fixtures.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () =>
  issues.flatMap((issue) => issue.contributions.map((c) => ({slug: issue.slug, contribution: c.slug})));

// The contribution, its issue and the names of its people, in their order
export const load: PageLoad = ({params}) => {
  const issue = issues.find((x) => x.slug === params.slug);
  const contribution = issue?.contributions.find((c) => c.slug === params.contribution);
  if (!issue || !contribution) error(404);
  const authors = contribution.people.map((slug) => people.find((x) => x.slug === slug)?.name ?? slug);
  return {contribution, authors, issue};
};
