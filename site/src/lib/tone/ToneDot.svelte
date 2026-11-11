<!--
  The dot at the bottom right of the screen: switches between the dark
  and light versions of the site (see tone.svelte.ts).

  Desktop: on the footer's line, its right edge one column in from the
  right edge of the screen — the mirror of the band on the left.
  Mobile: same margin as the header (--pad), from the right and the bottom.
-->
<script lang="ts">
  import {tone} from './tone.svelte.ts';
</script>

<button class="tone-dot" aria-label="Switch to the {tone.next} version" onclick={tone.toggle}
></button>

<style>
  /* The button is larger than the dot it shows, to be easy to hit
     (sizes: --dot, --dot-hit, --dot-edge in styles.css) */
  .tone-dot {
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
  .tone-dot::before {
    content: '';
    position: absolute;
    inset: var(--dot-edge);
    border-radius: 50%;
    background: var(--ink);
  }
  .tone-dot:focus-visible {
    outline: 1px solid var(--ink-quiet);
    outline-offset: calc(-1 * var(--u));
    border-radius: 50%;
  }

  @media (max-width: 767px) {
    .tone-dot {
      right: calc(var(--pad) - var(--dot-edge));
      bottom: calc(var(--pad) - var(--dot-edge));
    }
  }
</style>
