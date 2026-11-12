<!--
  The switch between two views of the images beside the band — one at a
  time (a carousel, a gallery) or all together in a grid: the issues
  list, an issue's page. `grid` says which view is on (bind it);
  `onswitch` is called at each change; `what` names the images for
  those who can't see the icon ("covers", "images").

  A button on the footer's line, its left edge one column in from the
  band — the mirror of the tone switch. It shows the view it leads to.
  Not on phones: no grid there.
-->
<script lang="ts">
  import Panel from './Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';

  let {
    grid = $bindable(false),
    what = 'covers',
    onswitch
  }: {grid?: boolean; what?: string; onswitch?: () => void} = $props();
</script>

<Panel area="rest" class="view-switch">
  <button
    class="switch fade"
    class:is-grid={grid}
    type="button"
    aria-label={grid ? `Show the ${what} one by one` : `Show all the ${what}`}
    onclick={() => ((grid = !grid), onswitch?.())}
    out:leave|global
  >
    <span class="icon to-grid"></span>
    <span class="icon to-carousel"></span>
  </button>
</Panel>

<style>
  /* The switch: on the footer's line, its left edge one column in from
     the band — the mirror of the tone switch. 1.5 units square, filled
     shapes like the sun and moon (Marco's request), inside
     a larger area that catches the click (--dot-hit, as the tone switch).
     Quiet, full ink under the pointer. */
  :global(.panel.view-switch) {
    z-index: 1;
    pointer-events: none;
  }
  .switch {
    --size: calc(1.5 * var(--u));
    --edge: calc((var(--dot-hit) - var(--size)) / 2);
    position: absolute;
    left: calc(var(--col) - var(--edge));
    bottom: calc(6 * var(--u) - var(--dot-hit) / 2); /* centre on the centre of the footer's line */
    width: var(--dot-hit);
    height: var(--dot-hit);
    --focus-offset: calc(-1 * var(--u));
    cursor: pointer;
    pointer-events: auto;
  }
  .switch:hover .icon {
    --lit: 1;
  }
  /* The icon shows the view the button leads to; one fades into the
     other with the time and curve of every icon (--icon, styles.css) */
  .icon {
    /* At rest the quiet grey taken a quarter towards the background: a
       full shape reads darker than thin text, so this is what looks like
       the footer's tagline (Marco's choice among four) */
    --rest: color-mix(in srgb, var(--ink-quiet) 75%, var(--bg));
    position: absolute;
    inset: var(--edge);
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * 100%), var(--rest));
    transition:
      opacity var(--icon),
      --lit var(--hover);
  }
  @media (prefers-reduced-motion: reduce) {
    .icon {
      transition: --lit var(--hover);
    }
  }
  /* A full square cut in four by a 1px cross, as the grid */
  .to-grid {
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M0 0h5.5v5.5H0zM6.5 0H12v5.5H6.5zM0 6.5h5.5V12H0zM6.5 6.5H12V12H6.5z'/%3E%3C/svg%3E")
      center / contain no-repeat;
  }
  /* One cover: a full upright 3:4 block, as tall as the grid icon (9 × 12) */
  .to-carousel {
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M1.5 0h9v12h-9z'/%3E%3C/svg%3E")
      center / contain no-repeat;
  }
  .switch:not(.is-grid) .to-carousel,
  .switch.is-grid .to-grid {
    opacity: 0;
  }

  @media (max-width: 767px) {
    .switch {
      display: none;
    }
  }
</style>
