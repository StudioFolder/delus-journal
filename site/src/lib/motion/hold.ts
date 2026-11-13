/**
 * HOLD — while something lies over the page (the phone's menu, an
 * article's gallery), a finger doesn't scroll the page under it.
 *
 *   $effect(() => {
 *     if (open) return hold();
 *   });
 *
 * It matters where the page scrolls the window (FLOW in
 * routes/+layout.svelte). CSS can't say it there: iOS Safari scrolls
 * the window whatever `touch-action` says, and `overflow: hidden` on
 * the window needs a rule that knows what is open (`:has`), which
 * Safari doesn't always look at again — the page stayed blocked.
 * Returns the way to let go.
 */
export function hold() {
  const stop = (e: TouchEvent) => e.preventDefault();
  addEventListener('touchmove', stop, {passive: false});
  return () => removeEventListener('touchmove', stop);
}
