import {posts} from '#lib/data/fixtures.ts';
import type {EntryGenerator} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => posts.map((x) => ({slug: x.slug}));
