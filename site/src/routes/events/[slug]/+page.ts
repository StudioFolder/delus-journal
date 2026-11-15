import {error} from '@sveltejs/kit';
import {posts, type Inline} from '#lib/data/fixtures.ts';
import {brief} from '#lib/head/head.ts';
import {plainText} from '#lib/data/format.ts';
import type {EntryGenerator, PageLoad} from './$types';

// Which URLs to generate (placeholder list until Sanity is connected)
export const entries: EntryGenerator = () => posts.map((x) => ({slug: x.slug}));

export const load: PageLoad = ({params}) => {
  const post = posts.find((x) => x.slug === params.slug);
  if (!post) error(404);
  // The page's head: the item's title, and how its text opens
  const opening = post.body?.find((b): b is string | Inline[] => typeof b === 'string' || Array.isArray(b));
  return {post, title: plainText(post.title), description: brief(opening)};
};
