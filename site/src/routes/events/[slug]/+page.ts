import {error} from '@sveltejs/kit';
import {posts} from '#lib/data/fixtures.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => posts.map((x) => ({slug: x.slug}));

export const load: PageLoad = ({params}) => {
  const post = posts.find((x) => x.slug === params.slug);
  if (!post) error(404);
  return {post};
};
