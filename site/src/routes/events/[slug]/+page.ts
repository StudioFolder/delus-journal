import {error} from '@sveltejs/kit';
import {posts} from '#lib/data/fixtures.ts';
import {brief} from '#lib/head/head.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => posts.map((x) => ({slug: x.slug}));

export const load: PageLoad = ({params}) => {
  const post = posts.find((x) => x.slug === params.slug);
  if (!post) error(404);
  // The page's head: the item's title, and how its text opens
  return {post, title: post.title, description: brief(post.body?.[0])};
};
