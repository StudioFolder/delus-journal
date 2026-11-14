<!--
  The figures of an article seen large, one at a time — in place of the
  text: the image (for now an empty box in its proportions) in the middle
  of the space to the right of the band, as large as the screen allows
  (at most 20 columns wide, and 16 units kept free above and below). Its
  caption is at the bottom, centred, its last line on the footer's line
  (without the figure's letter: the text that names it is not there).

  GALLERY — from the figure that was clicked, all the figures of the
  article can be seen, in the order of their letters (`figures`; the
  ones without a letter after, as they come in the text), round and
  round. One figure fades out, the next fades in.
  - To the left of the image a click shows the one before, to its right
    the next one; on the image (and above and under it) a click closes.
    Everywhere the pointer itself becomes the word for what a click does
    — Previous, Next, Close (use:word, #lib/pointer). Esc closes too.
  - The left and right arrow keys; on touch screens a swipe to the left
    or to the right (a tap closes).

  GRID — all the figures together, as the images of an issue (the same
  switch, on the footer's line: ViewSwitch; not on phones): the figure
  on view and its caption fade out, then the figures appear one after
  another, four per row (three on Medium and Narrow screens, as every
  grid of images), in the order of their letters, the rows sharing
  the height between the top and the bottom of the band's content. No
  captions there. A click on one shows it large (the pointer says Open);
  a click anywhere else closes, as Esc. Closing from the grid, nothing
  travels: the grid fades out and the text comes back, at the passage
  of the figure last seen large.

  HOW IT OPENS AND CLOSES — the miniature itself seems to grow:
    1. the text fades out (the page does it: `hidden`), while the large
       image already lies exactly on the miniature, at its size;
    2. the image moves to the middle and grows (--move, as the band);
    3. its caption fades in.
  Closing is the same backwards: the caption fades out while the image
  goes back onto its miniature, then the text fades in. After browsing,
  that is the miniature of the figure on view: the text (still hidden)
  is first brought to the passage that names it, so the reader comes
  back there.
  With reduced motion the image doesn't travel: it changes place at once.

  From the page: `bind:this`, then `show(figure, miniature)`; `hidden`
  (bind) says when the text and the notes must be out of the way. The
  miniatures are found by their place among the figures of the text
  (`inText`; `data-figure`, ArticleFigure).
-->
<script lang="ts">
  import {tick} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import ViewSwitch from '#lib/grid/ViewSwitch.svelte';
  import {time} from '#lib/motion/time.ts';
  import {hold} from '#lib/motion/hold.ts';
  import {still} from '#lib/motion/still.ts';
  import {word} from '#lib/pointer/word.svelte.ts';
  import Inlines from './Inlines.svelte';
  import type {Figure} from '#lib/data/fixtures.ts';

  let {
    figures,
    inText,
    hidden = $bindable(false)
  }: {figures: Figure[]; inText: Figure[]; hidden?: boolean} = $props();

  let figure = $state.raw<Figure>(); // the one shown (it stays while closing)
  let phase = $state<'closed' | 'opening' | 'open' | 'changing' | 'grid' | 'closing'>('closed');
  let grid = $state(false); // what the switch says: all the figures together
  let plain = $state(false); // closing from the grid: the large image stays out of it
  // The rows of the grid, with four and with three figures per row
  const rows = $derived({four: Math.ceil(figures.length / 4), three: Math.ceil(figures.length / 3)});
  let moving = $state(false); // the image is travelling: its move is animated
  let place = $state(''); // the transform that puts the large image on its miniature
  let image = $state<HTMLElement>();
  let miniature: HTMLElement | undefined;
  let byKeyboard = false; // opened from the keyboard: the focus goes back to the miniature

  const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

  // The move and scale that lay the large image on the miniature
  function onMiniature() {
    if (!image || !miniature) return '';
    const was = image.style.transform;
    image.style.transform = 'none';
    const to = image.getBoundingClientRect();
    image.style.transform = was;
    const from = miniature.getBoundingClientRect();
    return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`;
  }

  export async function show(which: Figure, from: HTMLElement) {
    if (phase !== 'closed') return;
    figure = which;
    miniature = from;
    byKeyboard = document.activeElement === from;
    await tick();
    moving = false;
    place = onMiniature();
    phase = 'opening';
    hidden = true; // 1. the text fades out
    await wait(time('--fade-out-time'));
    moving = !still(); // 2. the image goes to the middle
    place = '';
    await wait(moving ? time('--move-time') : 0);
    moving = false;
    phase = 'open'; // 3. the caption and the words fade in
  }

  // To the next figure (1) or the one before (-1), round and round
  async function step(by: number) {
    if (phase !== 'open' || !figure || figures.length < 2) return;
    phase = 'changing'; // the figure fades out…
    await wait(time('--fade-out-time'));
    const at = figures.indexOf(figure);
    figure = figures[(at + by + figures.length) % figures.length];
    await tick();
    phase = 'open'; // …and the other one fades in
  }

  // The switch: to the grid, or back to the figure that was on view
  function toggle() {
    if (grid && phase === 'open') phase = 'grid';
    else if (!grid && phase === 'grid') pick(figure!);
    else grid = phase === 'grid'; // in the middle of something else: as it was
  }
  // From the grid to one figure, large
  async function pick(which: Figure) {
    if (phase !== 'grid') return;
    grid = false;
    phase = 'changing'; // the grid fades out…
    await wait(time('--fade-out-time'));
    figure = which;
    await tick();
    phase = 'open'; // …and the figure fades in
  }

  async function close() {
    if ((phase !== 'open' && phase !== 'grid') || !figure) return;
    plain = phase === 'grid';
    // Back onto the miniature of the figure on view: if it is another one
    // than the one that was opened, the text goes to its passage first
    const own = document.querySelector<HTMLElement>(`[data-figure="${inText.indexOf(figure)}"] .image`);
    if (own && own !== miniature) {
      miniature = own;
      own.scrollIntoView({block: 'center'});
    }
    phase = 'closing'; // the caption fades out…
    moving = !plain && !still(); // …while the image goes back
    place = onMiniature();
    await wait(moving ? time('--move-time') : time('--fade-out-time'));
    hidden = false; // the text fades in
    await wait(time('--fade-time'));
    moving = false;
    phase = 'closed';
    grid = plain = false;
    if (byKeyboard) miniature?.focus({preventScroll: true});
  }

  function keys(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  }
  const shown = $derived(phase === 'open' || phase === 'changing' || phase === 'grid');

  // While the gallery is on, the page doesn't scroll under it
  $effect(() => {
    if (phase !== 'closed') return hold();
  });

  // SWIPE (touch screens): to the left, the next figure; to the right,
  // the one before. The tap that ends a swipe doesn't close.
  let down: number | undefined;
  let swiped = false;
  function press(e: PointerEvent) {
    down = e.pointerType === 'touch' ? e.clientX : undefined;
    swiped = false;
  }
  function release(e: PointerEvent) {
    if (down === undefined) return;
    const moved = e.clientX - down;
    down = undefined;
    if (Math.abs(moved) < 40) return;
    swiped = true;
    step(moved < 0 ? 1 : -1);
  }
  const tap = (act: () => void) => () => (swiped ? (swiped = false) : act());
</script>

<svelte:window onkeydown={keys} />

<Panel area="rest" class="on-ground from-top flows lightbox">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="view" class:is-on={phase !== 'closed'} onpointerdown={press} onpointerup={release}>
    <!-- On the image, above and under it: close -->
    <button
      type="button"
      class="around"
      aria-label="Close the images"
      tabindex="-1"
      onclick={tap(close)}
      use:word={shown ? 'Close' : ''}
    ></button>
    <!-- Beside it: the one before, the next one -->
    {#if figures.length > 1 && phase !== 'grid'}
      <button
        type="button"
        class="beside before"
        aria-label="Previous figure"
        tabindex="-1"
        onclick={tap(() => step(-1))}
        use:word={shown ? 'Previous' : ''}
      ></button>
    {/if}
    {#if figure}
      <div
        class="large fade now"
        class:is-hidden={phase === 'changing' || phase === 'grid' || plain}
        style:--ratio={figure.ratio}
      >
        <div
          bind:this={image}
          class="image"
          class:moving
          class:small={phase === 'opening' && place !== ''}
          role="img"
          aria-label={figure.label ? `Figure ${figure.label}` : 'Image'}
          style:transform={place || null}
        ></div>
      </div>
      <p class="caption fade now" class:is-hidden={phase !== 'open'}>
        <Inlines parts={figure.caption} />
      </p>
    {/if}
    {#if figures.length > 1 && phase !== 'grid'}
      <button
        type="button"
        class="beside after"
        aria-label="Next figure"
        tabindex="-1"
        onclick={tap(() => step(1))}
        use:word={shown ? 'Next' : ''}
      ></button>
    {/if}
    <!-- All the figures together -->
    {#if figures.length > 1}
      <div class="grid image-grid on-screen" inert={phase !== 'grid'} style:--rows-4={rows.four} style:--rows-3={rows.three}>
        {#each figures as each, i (i)}
          <div class="cell fade next" class:is-hidden={phase !== 'grid'} style:--i={i}>
            <button
              type="button"
              class="thumb"
              aria-label={each.label ? `Figure ${each.label}` : `Image ${i + 1}`}
              style:--ratio={each.ratio}
              onclick={tap(() => pick(each))}
              use:word={phase === 'grid' ? 'Open' : ''}
            ></button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</Panel>

{#if shown && figures.length > 1}
  <ViewSwitch bind:grid what="figures" onswitch={toggle} />
{/if}


<style>
  /* The panel lies over the text: it must not catch what is meant for it */
  :global(.lightbox) {
    pointer-events: none;
  }
  .view {
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr auto 1fr; /* before · the image · after */
    align-items: center;
    visibility: hidden;
    touch-action: pan-y; /* sideways the finger is ours: the swipe */
  }
  .view.is-on {
    visibility: visible;
    pointer-events: auto;
  }
  .around {
    position: absolute;
    inset: 0;
  }
  /* The two sides, the whole height, above the button around */
  .beside {
    position: relative;
    align-self: stretch;
  }
  .before {
    grid-column: 1;
  }
  .after {
    grid-column: 3;
  }
  .large {
    --free: calc(100vh - 32 * var(--u)); /* the height left for the image */
    grid-column: 2;
    grid-row: 1;
    position: relative; /* above the button around it… */
    pointer-events: none; /* …but a click on it closes too */
    width: min(20 * var(--col), var(--free) * var(--ratio));
  }
  /* Opening, it is there at once, lying on its miniature (which has the
     same colour): it doesn't fade in as it would arriving with a page —
     the two fading across each other would dim for a moment */
  @starting-style {
    :global(.is-live) .large {
      opacity: 1;
    }
  }
  /* When it leaves its miniature (.small) it has the miniature's hover
     colour, which it loses on the way — only where there is a hover
     (on a touch screen the miniature never had it) */
  .image {
    aspect-ratio: var(--ratio);
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * var(--lit-tint)), var(--band));
    transform-origin: 0 0;
  }
  @media (hover: hover) {
    .image.small {
      --lit: 1;
    }
  }
  .image.moving {
    transition:
      transform var(--move),
      --lit var(--move);
  }
  /* The caption: centred, its last line on the footer's line; at most as
     wide as the largest image */
  .caption {
    position: absolute;
    left: 50%;
    bottom: calc(5 * var(--u));
    width: max-content;
    max-width: min(20 * var(--col), 100% - 2 * var(--col));
    transform: translateX(-50%);
    text-align: center;
    font: var(--type-note);
    color: var(--ink-quiet);
    pointer-events: none;
  }
  /* The grid, as the images of an issue (routes/issues/[slug]): four
     cells per row, two columns apart, one column clear at the sides; the
     rows, 8 units apart, share the height between the top and the bottom
     of the band's content. Each figure is as large as fits in its cell,
     in the middle of it. Between the figures a click goes to the button
     around (Close) */
  .grid {
    pointer-events: none; /* (the grid itself: GRIDS OF IMAGES in styles.css) */
  }
  .thumb {
    display: block;
    aspect-ratio: var(--ratio);
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * var(--lit-tint)), var(--band));
  }
  .cell:not(.is-hidden) .thumb {
    pointer-events: auto;
  }
  @media (hover: hover) {
    .thumb {
      transition: --lit var(--hover);
    }
    .thumb:hover {
      --lit: 1;
    }
  }
  /* Mobile: the image as wide as the column (nothing beside it: swipe);
     the caption at the foot of the column */
  @media (max-width: 767px) {
    .view {
      grid-template-columns: 0 1fr 0;
    }
    .beside {
      display: none;
    }
    .large {
      justify-self: center;
      width: min(100%, var(--free) * var(--ratio));
    }
    .caption {
      bottom: 0;
      max-width: 100%;
    }
    .grid {
      display: none;
    }
    /* The page scrolls the window (`flows`: FLOW, routes/+layout.svelte),
       so the panel is as long as the text: the view stays on the screen,
       as high as it (the page doesn't scroll under it meanwhile: `hold`) */
    .view {
      position: sticky;
      top: 0;
      height: 100dvh;
    }
  }
</style>
