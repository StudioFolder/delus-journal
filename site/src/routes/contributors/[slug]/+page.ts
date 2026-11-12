import {error} from '@sveltejs/kit';
import {issues, people} from '#lib/data/fixtures.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => people.map((x) => ({slug: x.slug}));

// The person and, for now, their (first) contribution: its title, the
// names of all its people, in their order, and its issue
export const load: PageLoad = ({params}) => {
  const person = people.find((x) => x.slug === params.slug);
  if (!person) error(404);
  const issue = issues.find((i) => i.contributions.some((c) => c.people.includes(person.slug)));
  const contribution = issue?.contributions.find((c) => c.people.includes(person.slug));
  if (!issue || !contribution) error(404);
  const authors = contribution.people.map((slug) => people.find((x) => x.slug === slug)?.name ?? slug);
  return {person, contribution, authors, issue};
};
