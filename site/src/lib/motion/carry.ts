/**
 * CARRY — an element that travels from one page to the next.
 *
 * Page content normally fades out with its page while the new page's
 * content fades in (FADE in styles.css). A few things instead stay and
 * move: from the issues list to an issue, the abstract rises from the
 * bottom of the band to the top, and the issue's cover stays in place.
 *
 *   page being left:   <div use:carry={'abstract:02-season-creep'}>
 *   page arriving:     const from = arriving('abstract:02-season-creep');
 *                      <div class:fade={!from} use:land={from}>
 *
 * Just before each navigation the root layout calls `snapshot()`, which
 * notes where every `carry` element is. On the new page `arriving(key)`
 * returns that place if an element with the same key was on view; `land`
 * hides the old one and moves the new one from the old place to its own,
 * with the band's movement (--move). Without a match (a direct visit,
 * another issue's abstract on view, mobile, reduced motion) `arriving`
 * returns null and the element simply fades in.
 */

import {still} from './still.ts';

type Place = {node: HTMLElement; rect: DOMRect};

const onView = new Map<string, HTMLElement>();
let places = new Map<string, Place>();

/** Action for the page being left: this element can travel */
export function carry(node: HTMLElement, key: string) {
  const forget = () => onView.get(key) === node && onView.delete(key);
  onView.set(key, node);
  return {
    update(next: string) {
      forget();
      key = next;
      onView.set(key, node);
    },
    destroy: forget
  };
}

/** Called by the root layout just before a navigation */
export function snapshot() {
  places = new Map();
  if (still()) return;
  for (const [key, node] of onView) {
    const rect = node.getBoundingClientRect();
    if (rect.width && rect.height) places.set(key, {node, rect}); // not hidden (e.g. on mobile)
  }
}

/** For the arriving page, while it is created: where the element comes from, if anywhere */
export function arriving(key: string): Place | null {
  const place = places.get(key) ?? null;
  places.delete(key);
  return place;
}

/** Action for the arriving element: moves it from where it was to its place */
export function land(node: HTMLElement, from: Place | null) {
  if (!from) return;
  from.node.style.visibility = 'hidden';
  const to = node.getBoundingClientRect();
  const dx = from.rect.left - to.left;
  const dy = from.rect.top - to.top;
  if (!dx && !dy) return;
  node.style.transform = `translate(${dx}px, ${dy}px)`;
  node.getBoundingClientRect(); // fixes the starting place
  node.style.transition = 'transform var(--move)';
  node.style.transform = '';
  node.addEventListener('transitionend', () => (node.style.transition = ''), {once: true});
}
