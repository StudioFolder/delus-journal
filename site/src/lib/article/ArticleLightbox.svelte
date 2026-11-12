<!--
  A figure of an article seen large — in place of the text: the image
  (for now an empty box in its proportions) in the middle of the space to
  the right of the band, as large as the screen allows (at most 20
  columns wide, and 16 units kept free above and below), with its letter
  and caption under it, as under the miniature but always shown.
  One figure at a time. A click anywhere in that space, or Esc, closes it.

  HOW IT OPENS AND CLOSES — the miniature itself seems to grow:
    1. the text fades out (the page does it: `hidden`), while the large
       image already lies exactly on the miniature, at its size;
    2. the image moves to the middle and grows (--move, as the band);
    3. its caption fades in.
  Closing is the same backwards: the caption fades out while the image
  goes back onto its miniature, then the text fades in.
  With reduced motion the image doesn't travel: it changes place at once.

  From the page: `bind:this`, then `show(figure, miniature)`; `hidden`
  (bind) says when the text and the notes must be out of the way.
-->
<script lang="ts">
  import {tick} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import {time} from '#lib/motion/time.ts';
  import Inlines from './Inlines.svelte';
  import type {Figure} from '#lib/data/fixtures.ts';

  let {hidden = $bindable(false)}: {hidden?: boolean} = $props();

  let figure = $state<Figure>(); // the one shown (it stays while closing)
  let phase = $state<'closed' | 'opening' | 'open' | 'closing'>('closed');
  let moving = $state(false); // the image is travelling: its move is animated
  let place = $state(''); // the transform that puts the large image on its miniature
  let image = $state<HTMLElement>();
  let miniature: HTMLElement | undefined;

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
    phase = 'open'; // 3. the caption fades in
  }

  async function close() {
    if (phase !== 'open') return;
    phase = 'closing'; // the caption fades out…
    moving = !still(); // …while the image goes back
    place = onMiniature();
    await wait(moving ? time('--move-time') : time('--fade-out-time'));
    hidden = false; // the text fades in
    await wait(time('--fade-time'));
    moving = false;
    phase = 'closed';
    miniature?.focus({preventScroll: true});
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />

<Panel area="rest" class="on-ground from-top lightbox">
  <button
    type="button"
    class="view"
    class:is-on={phase !== 'closed'}
    aria-label="Close the image"
    tabindex={phase === 'open' ? 0 : -1}
    onclick={close}
  >
    {#if figure}
      <span class="large" style:--ratio={figure.ratio}>
        <span
          bind:this={image}
          class="image"
          class:moving
          class:small={phase === 'opening' && place !== ''}
          role="img"
          aria-label="Figure {figure.label}"
          style:transform={place || null}
        ></span>
        <span class="caption fade now" class:is-hidden={phase !== 'open'}>
          <span class="n">{figure.label}</span><Inlines parts={figure.caption} />
        </span>
      </span>
    {/if}
  </button>
</Panel>

<style>
  /* The panel lies over the text: it must not catch what is meant for it */
  :global(.lightbox) {
    pointer-events: none;
  }
  .view {
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
    text-align: left;
    display: grid;
    place-items: center;
    cursor: zoom-out;
    visibility: hidden;
  }
  .view.is-on {
    visibility: visible;
    pointer-events: auto;
  }
  .large {
    --free: calc(100vh - 32 * var(--u)); /* the height left for the image */
    width: min(20 * var(--col), var(--free) * var(--ratio));
    display: grid;
    gap: calc(2 * var(--u));
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
  .caption {
    font: var(--type-note);
    color: var(--ink-quiet);
  }
  .n {
    display: inline-block;
    width: calc(3 * var(--u)); /* as a note's number */
    font: var(--type-ui);
    color: var(--ink);
  }
  /* Mobile: the width of the column */
  @media (max-width: 767px) {
    .large {
      width: min(100%, var(--free) * var(--ratio));
    }
  }
</style>
