/**
 * LEAVE
 *
 * Put `out:leave|global` on a page element with the `fade` class: when the
 * page is left it fades out straight away, like every disappearing element
 * (see FADE in styles.css). Arriving is handled by `fade` itself.
 *
 * It fades from the opacity the element has at that moment: one already
 * hidden (`is-hidden`, e.g. the issues carousel under the grid) stays
 * hidden instead of flashing back to full and fading out.
 */
import {time} from './time.ts';

export function leave(node: Element) {
  const from = Number(getComputedStyle(node).opacity);
  return {
    duration: from ? time('--fade-out-time') : 0,
    css: (t: number) => `opacity: ${t * from}`
  };
}
