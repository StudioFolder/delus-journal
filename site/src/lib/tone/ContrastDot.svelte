<!--
  The dot that appears above the tone dot while the pointer is on it (or
  the keyboard): switches the high-contrast version of the tone on view
  on and off (see tone.svelte.ts; CONTRAST in styles.css). Desktop only.

  A ring, half full: the usual sign for contrast, at the tone dot's
  size. On, it has turned half a turn — the full half to the right
  (--high, 0 → 1, with --icon as every icon that changes state).
  It comes and goes softly (--hover); where nothing can hover it is
  always there. Under the pointer, the tone dot's halo.

  The button reaches down to the tone dot's own area, so the pointer
  can travel from one to the other without losing it.
-->
<script lang="ts">
  import {contrast} from './tone.svelte.ts';
</script>

<button
  class="contrast-dot"
  class:is-high={contrast.high}
  aria-label="High contrast"
  aria-pressed={contrast.high}
  onclick={contrast.toggle}
>
  <!-- Centred on 0,0, 8 units = the dot -->
  <svg viewBox="-4 -4 8 8" aria-hidden="true">
    <circle class="ring" r="3.583" />
    <path d="M0 -4A4 4 0 0 0 0 4Z" />
  </svg>
</button>

<style>
  .contrast-dot {
    display: none;
  }
  @property --high {
    syntax: '<number>';
    inherits: true;
    initial-value: 0;
  }
  @media (min-width: 768px) {
    .contrast-dot {
      /* as the tone dot (ToneDot.svelte) */
      --dot: calc(1.5 * var(--u));
      --dot-edge: calc((var(--dot-hit) - var(--dot)) / 2);
      display: block;
      position: absolute;
      z-index: 3; /* above the tone dot, where their areas meet */
      right: calc(var(--col) - var(--dot-edge));
      /* its dot 3 units above the tone dot (edge to edge); its area
         from 2 units above the tone dot's centre, 5 units tall */
      bottom: calc(8 * var(--u));
      width: var(--dot-hit);
      height: calc(5 * var(--u));
      --focus-offset: calc(-1 * var(--u));
      cursor: pointer;
    }
    svg {
      position: absolute;
      left: var(--dot-edge);
      bottom: calc(1.75 * var(--u));
      width: var(--dot);
      height: var(--dot);
      overflow: visible;
      fill: var(--ink);
      rotate: calc(var(--high) * 180deg);
      filter: drop-shadow(
        0 0 var(--u) color-mix(in srgb, var(--ink) calc(var(--lit) * 50%), transparent)
      );
      transition:
        --high var(--icon),
        --lit var(--hover);
    }
    .ring {
      fill: none;
      stroke: var(--ink);
      stroke-width: 0.833; /* 1.25px, as the other drawn icons */
    }
    .contrast-dot:hover svg {
      --lit: 1;
    }
    .is-high svg {
      --high: 1;
    }
    .contrast-dot:focus-visible {
      border-radius: calc(2 * var(--u));
    }
    /* Shown only with the tone dot under the pointer or the keyboard —
       where a pointer can hover */
    @media (hover: hover) {
      .contrast-dot {
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--hover);
      }
      :global(.stage:has(.tone-dot:hover, .tone-dot:focus-visible)) .contrast-dot,
      .contrast-dot:hover,
      .contrast-dot:focus-visible {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }
  @media (prefers-reduced-motion: reduce) {
    svg {
      transition: none;
    }
  }
</style>
