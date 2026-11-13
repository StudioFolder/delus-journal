// Everything the search can find, as one file written when the site is
// built (see #lib/search/index.ts). Read by the search page only.
import {json} from '@sveltejs/kit';
import {entries} from '#lib/search/index.ts';

export const prerender = true;

export const GET = () => json(entries());
