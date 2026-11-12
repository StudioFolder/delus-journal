<!--
  A figure of an article seen large — in place of the text, which the
  page fades out meanwhile: the image (for now an empty box in its
  proportions) in the middle of the space to the right of the band, as
  large as the screen allows (at most 20 columns wide, and 16 units kept
  free above and below), with its letter and caption under it, as under
  the miniature but always shown.
  One figure at a time. A click anywhere in that space, or Esc, closes
  it. It appears once the text has faded out (.fade.next) and fades out
  at once.
  `figure`: the one to show; it stays in place while fading out.
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import Inlines from './Inlines.svelte';
  import type {Figure} from '#lib/data/fixtures.ts';

  let {figure, onclose}: {figure?: Figure; onclose: () => void} = $props();

  // The last figure shown stays while the lightbox fades out
  let last = $state<Figure>();
  $effect(() => {
    if (figure) last = figure;
  });
</script>

<svelte:window onkeydown={(e) => figure && e.key === 'Escape' && onclose()} />

<Panel area="rest" class="on-ground from-top lightbox">
  <button
    type="button"
    class="view fade next"
    class:is-hidden={!figure}
    aria-label="Close the image"
    tabindex={figure ? 0 : -1}
    onclick={onclose}
    out:leave|global
  >
    {#if last}
      <span class="large" style:--ratio={last.ratio}>
        <span class="image" role="img" aria-label="Figure {last.label}"></span>
        <span class="caption"><span class="n">{last.label}</span><Inlines parts={last.caption} /></span>
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
  }
  .view:not(.is-hidden) {
    pointer-events: auto;
  }
  /* It goes at once (only its arrival waits for the text to fade out) */
  .view.is-hidden {
    transition-delay: 0s;
  }
  .large {
    --free: calc(100vh - 32 * var(--u)); /* the height left for the image */
    width: min(20 * var(--col), var(--free) * var(--ratio));
    display: grid;
    gap: calc(2 * var(--u));
  }
  .image {
    aspect-ratio: var(--ratio);
    background: var(--band);
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
