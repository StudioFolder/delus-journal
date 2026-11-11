<!--
  The dot at the bottom right of the screen: switches between the dark
  and light versions of the site (see tone.svelte.ts).

  Desktop: on the footer's line, its right edge one column in from the
  right edge of the screen — the mirror of the band on the left.
  Mobile: in a zone at the bottom as high as the header, under the menu dot.

  It shows the tone on view: in the light tone a full dot (the sun); in
  the dark tone a fat crescent (the moon). Switching, a second circle of
  the same size slides in from the left and bites into the dot, while
  the shape turns a little clockwise, so the crescent leans instead of standing
  upright — and back. One number, --moon (0 → 1), drives both, with the
  same duration and curve as the change of colours (--icon = --tone). Drawn in SVG
  so that both edges of the crescent are equally sharp.
  Under the pointer a slight halo of ink fades in around the shape.
-->
<script lang="ts">
  import {tone} from './tone.svelte.ts';
</script>

<button
  class="tone-dot"
  class:is-dark={tone.current === 'dark'}
  aria-label="Switch to the {tone.next} version"
  onclick={tone.toggle}
>
  <!-- The dot, centred on 0,0, one unit = one pixel of --dot -->
  <svg viewBox="-4 -4 8 8" aria-hidden="true">
    <mask id="tone-bite">
      <rect x="-4" y="-4" width="8" height="8" fill="#fff" />
      <circle class="bite" r="4" fill="#000" />
    </mask>
    <circle r="4" mask="url(#tone-bite)" />
  </svg>
</button>

<style>
  /* The button is larger than the dot it shows, to be easy to hit
     (sizes: --dot, --dot-hit, --dot-edge in styles.css) */
  .tone-dot {
    /* this dot is larger than the menu dot (--dot in styles.css): 12px */
    --dot: calc(1.5 * var(--u));
    --dot-edge: calc((var(--dot-hit) - var(--dot)) / 2);
    position: absolute;
    z-index: 2; /* above the band */
    right: calc(var(--col) - var(--dot-edge));
    /* the dot's centre on the centre of the footer's line: 5 units + half a line */
    bottom: calc(6 * var(--u) - var(--dot-hit) / 2);
    width: var(--dot-hit);
    height: var(--dot-hit);
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
  }
  @property --moon {
    syntax: '<number>';
    inherits: true;
    initial-value: 0;
  }
  /* The dot, cut by a circle of the same size (black in the mask): with
     --moon at 0 that circle only touches the dot, one diameter to the
     left; at 1 it has slid half a diameter in, leaving a crescent half
     the dot wide, turned 30° clockwise (SVG lengths: 8 units = the dot) */
  svg {
    position: absolute;
    inset: var(--dot-edge);
    width: var(--dot);
    height: var(--dot);
    overflow: visible;
    fill: var(--ink);
    rotate: calc(var(--moon) * 30deg);
    /* the halo: --lit fades it in, as for every hover (HOVER in styles.css) */
    filter: drop-shadow(
      0 0 var(--u) color-mix(in srgb, var(--ink) calc(var(--lit) * 50%), transparent)
    );
    transition:
      --moon var(--icon),
      --lit var(--hover);
  }
  .tone-dot:hover svg {
    --lit: 1;
  }
  .bite {
    translate: calc((var(--moon) * 4 - 8) * 1px);
  }
  .is-dark svg {
    --moon: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    svg {
      transition: none;
    }
  }
  .tone-dot:focus-visible {
    outline: 1px solid var(--ink-quiet);
    outline-offset: calc(-1 * var(--u));
    border-radius: 50%;
  }

  @media (max-width: 767px) {
    .tone-dot {
      right: calc(var(--pad) - var(--dot-edge));
      bottom: calc((var(--header) - var(--dot-hit)) / 2); /* centred in the bottom zone, as the menu dot is in the header */
    }
  }
</style>
