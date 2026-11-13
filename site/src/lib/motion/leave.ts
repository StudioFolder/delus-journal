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
 *
 * And it stays where it is on the screen: on phones, where a page can
 * scroll the window (FLOW in routes/+layout.svelte), the new page starts
 * at its top — or, going back, where it was left — and the window jumps
 * there under the page still fading out.
 */
import {time} from './time.ts';

export function leave(node: HTMLElement) {
  const from = Number(getComputedStyle(node).opacity);
  stay(node);
  return {
    duration: from ? time('--fade-out-time') : 0,
    css: (t: number) => `opacity: ${t * from}`
  };
}

/** If the window scrolls under it now, the element is put back where it was */
function stay(node: HTMLElement) {
  const scrolled = scrollY;
  const {top} = node.getBoundingClientRect();
  requestAnimationFrame(() => {
    if (scrollY !== scrolled) node.style.translate = `0 ${top - node.getBoundingClientRect().top}px`;
  });
}
