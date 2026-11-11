import {error} from '@sveltejs/kit';
import {issues} from '#lib/data/fixtures.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => issues.map((x) => ({slug: x.slug}));

export const load: PageLoad = ({params}) => {
  const issue = issues.find((x) => x.slug === params.slug);
  if (!issue) error(404);
  return {issue};
};
