/**
 * LEAVE
 *
 * Put `out:leave|global` on a page element with the `fade` class: when the
 * page is left it fades out straight away, like every disappearing element
 * (see FADE in styles.css). Arriving is handled by `fade` itself.
 */
import {time} from './time.ts';

export function leave(_node: Element) {
  return {duration: time('--fade-out-time'), css: (t: number) => `opacity: ${t}`};
}
