<!--
  An image, inside the box that stands for it. THE BOX COMES FIRST: every
  image on the site is a box in the image's proportions (drawn by whoever
  places it: a figure, a cell of a grid, a cover), and this component only
  fills that box — so the layout is the same with the image, without it
  (none yet, or still loading) and in the wireframe (#lib/image/wireframe),
  where nothing is drawn nor loaded.
  Put it straight inside the box, which must be `position: relative` (or
  otherwise hold what is absolutely placed in it).
  - `image`: the file's address and its size in pixels (Sanity: the
    image's asset). From Sanity's image server each width is asked for as
    it is needed (`sizes`: how wide the box is on the screen, as in
    HTML), in the format the browser takes best; never wider than the
    file.
  - It fades in over its box once it has arrived (--fade-time).
  - `first`: the `sizes` of a smaller copy of the same image already on
    the page (a figure's miniature, when the figure opens large): that
    copy is drawn at once, under the full one, so the box is never empty.
  - `eager`: asked for at once and before the others (the image a page
    opens on: the home's highlight, an issue's cover) — every other image
    waits until it is near the screen.
  - Without JavaScript it is simply there (app.html, noscript).
  - Under the pointer it dims slightly, softly — as the empty box takes a
    touch of ink: it follows the box's own --lit (which doesn't inherit:
    asked for here), by --lit-dim.
  The same in the dark and the light tone (Marco, 24 Nov: to be looked at
  again later).
  - A CUT-OUT (`image.alpha`: a PNG with a transparency, as the objects
    printed as silhouettes; Marco, 24 Nov: keep the transparency): its box
    draws nothing behind it, so the object stands on the page's own
    ground, in both tones — the box's tint would show through. Under the
    pointer it only dims. In the wireframe the box is drawn as ever (the
    picture isn't there). The smaller copy (`first`) goes once the full
    one is in: two copies would show through each other at the edges.
  - A DRAWING (an SVG exported from the print PDF: black lines on nothing)
    lies on a sheet of the light tone's ground, in both tones (Marco,
    24 Nov: in the dark tone, a white ground under the whole image) — in
    the light tone the sheet is the page itself; in the dark one it keeps
    the lines readable. The sheet carries `data-tone="light"`, so its
    colour is the light tone's --bg (no colour of its own). It fades in
    and dims with the drawing.
-->
<script lang="ts">
  import {wire} from './wireframe.svelte.ts';
  import type {Img} from '#lib/data/fixtures.ts';

  let {
    image,
    sizes,
    first,
    alt = '',
    eager = false
  }: {image?: Img; sizes: string; first?: string; alt?: string; eager?: boolean} = $props();

  // The widths asked of the image server: steps up to the file's own
  const STEPS = [240, 320, 480, 640, 800, 1024, 1280, 1600, 2000, 2560, 3200, 4000];
  // (an SVG — a drawing exported from the print PDF — is sharp at any size:
  // it is loaded as it is, never through the image server's widths)
  const served = (url: string) => url.includes('cdn.sanity.io') && !url.endsWith('.svg');
  const at = (url: string, w: number) => `${url}?w=${w}&fit=max&auto=format&q=85`;
  const set = $derived.by(() => {
    if (!image || !served(image.url)) return undefined;
    const widths = STEPS.filter((w) => w < image.width);
    if (image.width <= STEPS[STEPS.length - 1]) widths.push(image.width);
    return widths.map((w) => `${at(image.url, w)} ${w}w`).join(', ');
  });
  const vector = $derived(image?.url.endsWith('.svg') ?? false);
  const src = $derived(image && (served(image.url) ? at(image.url, Math.min(image.width, 1280)) : image.url));

  let loaded = $state(false);
  // (an image already in the browser's memory may be there before its `load` is heard)
  const there = (el: HTMLImageElement) => {
    if (el.complete && el.naturalWidth) loaded = true;
  };
</script>

{#if image && !wire.on}
  {#if first && !(image.alpha && loaded)}
    <img class="picture" class:cutout={image.alpha} {src} srcset={set} sizes={first} alt="" aria-hidden="true" />
  {/if}
  {#if vector}
    <span class="picture full sheet" class:loaded data-tone="light" aria-hidden="true"></span>
  {/if}
  <img
    class="picture full"
    class:cutout={image.alpha}
    class:loaded
    {src}
    srcset={set}
    {sizes}
    {alt}
    width={image.width}
    height={image.height}
    loading={eager ? 'eager' : 'lazy'}
    fetchpriority={eager ? 'high' : undefined}
    decoding="async"
    onload={() => (loaded = true)}
    use:there
  />
{/if}

<style>
  .picture {
    --lit: inherit;
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(calc(1 - var(--lit) * var(--lit-dim)));
    pointer-events: none;
  }
  /* (the box's own rules draw its tint: this one, global, wins over them) */
  :global(:has(> img.cutout)) {
    background: none !important;
  }
  .sheet {
    background: var(--bg);
  }
  .full {
    opacity: 0;
    transition: opacity var(--fade-time) ease;
  }
  .full.loaded {
    opacity: 1;
  }
</style>
