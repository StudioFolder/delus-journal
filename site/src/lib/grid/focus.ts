/**
 * FOCUS
 *
 * Put `use:focus` on a page's image: while the pointer is on it, the
 * page takes its `focus` setting from layouts.ts (e.g. a narrower band).
 * It ends when the pointer leaves, or when the page is left.
 */
import {current} from './layout.svelte.ts';

export function focus(node: HTMLElement) {
  const on = () => (current.focused = true);
  const off = () => (current.focused = false);
  node.addEventListener('pointerenter', on);
  node.addEventListener('pointerleave', off);
  return {
    destroy() {
      off();
      node.removeEventListener('pointerenter', on);
      node.removeEventListener('pointerleave', off);
    }
  };
}
