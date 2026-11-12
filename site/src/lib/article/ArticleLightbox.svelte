<!--
  The figures of an article seen large, one at a time — in place of the
  text: the image (for now an empty box in its proportions) in the middle
  of the space to the right of the band, as large as the screen allows
  (at most 20 columns wide, and 16 units kept free above and below). Its
  letter and caption are at the bottom, centred, their last line on the
  footer's line.

  GALLERY — from the figure that was clicked, all the figures of the
  article can be seen, in the order of their letters (`figures`), round
  and round. One figure fades out, the next fades in.
  - To the left of the image a click shows the one before, to its right
    the next one; on the image (and above and under it) a click closes.
    Everywhere the pointer itself becomes the word for what a click does
    — Previous, Next, Close (use:word, #lib/pointer). Esc closes too.
  - The left and right arrow keys; on touch screens a swipe to the left
    or to the right (a tap closes).

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
  miniatures are found by their letter (`data-figure`, ArticleFigure).
-->
<script lang="ts">
  import {tick} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import {time} from '#lib/motion/time.ts';
  import {word} from '#lib/pointer/word.svelte.ts';
  import Inlines from './Inlines.svelte';
  import type {Figure} from '#lib/data/fixtures.ts';

  let {figures, hidden = $bindable(false)}: {figures: Figure[]; hidden?: boolean} = $props();

  let figure = $state<Figure>(); // the one shown (it stays while closing)
  let phase = $state<'closed' | 'opening' | 'open' | 'changing' | 'closing'>('closed');
  let moving = $state(false); // the image is travelling: its move is animated
  let place = $state(''); // the transform that puts the large image on its miniature
  let image = $state<HTMLElement>();
  let miniature: HTMLElement | undefined;
  let byKeyboard = false; // opened from the keyboard: the focus goes back to the miniature

  const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    const at = figures.findIndex((f) => f.label === figure!.label);
    figure = figures[(at + by + figures.length) % figures.length];
    await tick();
    phase = 'open'; // …and the other one fades in
  }

  async function close() {
    if (phase !== 'open' || !figure) return;
    // Back onto the miniature of the figure on view: if it is another one
    // than the one that was opened, the text goes to its passage first
    const own = document.querySelector<HTMLElement>(`[data-figure="${figure.label}"] .image`);
    if (own && own !== miniature) {
      miniature = own;
      own.scrollIntoView({block: 'center'});
    }
    phase = 'closing'; // the caption fades out…
    moving = !still(); // …while the image goes back
    place = onMiniature();
    await wait(moving ? time('--move-time') : time('--fade-out-time'));
    hidden = false; // the text fades in
    await wait(time('--fade-time'));
    moving = false;
    phase = 'closed';
    if (byKeyboard) miniature?.focus({preventScroll: true});
  }

  function keys(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  }
  const shown = $derived(phase === 'open' || phase === 'changing');

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

<Panel area="rest" class="on-ground from-top lightbox">
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
    {#if figures.length > 1}
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
      <div class="large fade now" class:is-hidden={phase === 'changing'} style:--ratio={figure.ratio}>
        <div
          bind:this={image}
          class="image"
          class:moving
          class:small={phase === 'opening' && place !== ''}
          role="img"
          aria-label="Figure {figure.label}"
          style:transform={place || null}
        ></div>
      </div>
      <p class="caption fade now" class:is-hidden={phase !== 'open'}>
        <span class="n">{figure.label}</span><Inlines parts={figure.caption} />
      </p>
    {/if}
    {#if figures.length > 1}
      <button
        type="button"
        class="beside after"
        aria-label="Next figure"
        tabindex="-1"
        onclick={tap(() => step(1))}
        use:word={shown ? 'Next' : ''}
      ></button>
    {/if}
  </div>
</Panel>


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
  button {
    padding: 0;
    border: 0;
    background: none;
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
  /* When it leaves its miniature (.small) it has the miniature's hover
     colour, which it loses on the way */
  .image {
    aspect-ratio: var(--ratio);
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * 6%), var(--band));
    transform-origin: 0 0;
  }
  .image.small {
    --lit: 1;
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
  .n {
    display: inline-block;
    width: calc(3 * var(--u)); /* as a note's number */
    text-align: left;
    font: var(--type-ui);
    color: var(--ink);
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
  }
</style>
