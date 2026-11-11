import {page} from '$app/state';
import {layoutFor} from './layouts.ts';

/** The layout of the route currently shown — reactive */
export const current = {
  get layout() {
    return layoutFor(page.route.id);
  }
};
