import {page} from '$app/state';
import {layoutFor, type Layout} from './layouts.ts';

let focused = $state(false); // true while the visitor points at the page's image

/** The layout of the route currently shown — reactive */
export const current = {
  get layout(): Layout {
    const layout = layoutFor(page.route.id);
    return focused && layout.focus ? {...layout, ...layout.focus} : layout;
  },
  get focused() {
    return focused;
  },
  set focused(value: boolean) {
    focused = value;
  }
};
