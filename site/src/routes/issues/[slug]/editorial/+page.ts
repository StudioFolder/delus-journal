import {issues} from '#lib/data/fixtures.ts';
import type {EntryGenerator} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => issues.map((x) => ({slug: x.slug}));
