import {error} from '@sveltejs/kit';
import {issues, people} from '#lib/data/fixtures.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => people.map((x) => ({slug: x.slug}));

// The person and, for now, their (first) contribution: its title and the
// names of all its people, in their order
export const load: PageLoad = ({params}) => {
  const person = people.find((x) => x.slug === params.slug);
  if (!person) error(404);
  const contribution = issues
    .flatMap((issue) => issue.contributions)
    .find((c) => c.people.includes(person.slug));
  if (!contribution) error(404);
  const authors = contribution.people.map((slug) => people.find((x) => x.slug === slug)?.name ?? slug);
  return {person, contribution, authors};
};
