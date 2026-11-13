import type {Entry} from '#lib/search/index.ts';
import type {PageLoad} from './$types';

// Everything the search can find: read when the page is opened, not before
export const load: PageLoad = async ({fetch}) => {
  const entries: Entry[] = await (await fetch('/search.json')).json();
  return {entries};
};
