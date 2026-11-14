/**
 * WHICH SIDE THE POINTER IS ON — over the band (from the screen's left
 * edge to the band's right edge, whatever lies on it) or over the page
 * to its right. Found once, here; the root layout starts it (`watch`).
 *
 *   side.now   'band' | 'page' | undefined
 *
 * Undefined until the pointer first moves, and when it is out of the
 * window. Mouse only: a finger is on neither.
 * Read by the root layout ("Back" / "Issue 01") and by the article's
 * page (its notes show over the page, the details of Download and Cite
 * over the band).
 */
export const side = $state<{now: 'band' | 'page' | undefined}>({now: undefined});

/** Starts listening; returns the way to stop */
export function watch() {
  const onmove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const band = document.querySelector('.band-bg');
    if (band) side.now = e.clientX < band.getBoundingClientRect().right ? 'band' : 'page';
  };
  const onleave = () => (side.now = undefined);
  addEventListener('pointermove', onmove, {passive: true});
  document.documentElement.addEventListener('mouseleave', onleave);
  return () => {
    removeEventListener('pointermove', onmove);
    document.documentElement.removeEventListener('mouseleave', onleave);
  };
}
