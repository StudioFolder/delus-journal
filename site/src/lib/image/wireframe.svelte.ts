// WIREFRAME — the whole site without its images: every image is drawn as
// the empty box it stands in (its proportions, the band's colour), as
// the site was before it had any. Kept for documenting the layout
// (Marco, 24 Nov).
// - `?wireframe` at the end of any address opens the site this way.
// - The W key then turns it off and on (also without the address while
//   the site is run locally). Not otherwise: a visitor's stray key must
//   not empty the site.
// It stays as it is set while browsing; a reload starts again from the
// address. Nothing is loaded for an image that isn't shown.
// Every image goes through Picture.svelte, which reads `wire.on`.
export const wire = $state({on: false, armed: false});

/** Read the address once the page is there; returns the key's handler */
export function arm(dev: boolean) {
  const asked = new URLSearchParams(location.search).has('wireframe');
  wire.on = asked;
  wire.armed = asked || dev;
}

export function key(e: KeyboardEvent) {
  if (!wire.armed || e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target as HTMLElement;
  if (t.isContentEditable || ['INPUT', 'TEXTAREA'].includes(t.tagName)) return;
  if (e.key === 'w' || e.key === 'W') wire.on = !wire.on;
}
