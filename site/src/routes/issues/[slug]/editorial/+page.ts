import {error} from '@sveltejs/kit';
import {issues, site, type Contribution} from '#lib/data/fixtures.ts';
import {citationOf} from '#lib/data/format.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => issues.map((x) => ({slug: x.slug}));

// The editorial of an issue, shaped as a contribution (so that its page
// is the article's): its own title, "A Note from the Editors", and the
// issue's editors as its people. No text yet (CMS: the issue's
// Editorial field).
export const load: PageLoad = ({params}) => {
  const issue = issues.find((x) => x.slug === params.slug);
  if (!issue) error(404);
  const authors = issue.publication.editedBy.split(', ');
  const contribution: Contribution = {title: 'A Note from the Editors', slug: 'editorial', people: []};
  // Surname first, for the citation: "Sara Frikech" → "Frikech, Sara"
  const by = authors.map((name) => ({name, sortName: name.replace(/^(.*) (\S+)$/, '$2, $1')}));
  const citation = citationOf(issue, contribution, by, `DELUS: ${site.tagline}`);
  return {contribution, authors, issue, citation};
};
