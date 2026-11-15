<!--
  THE HIGHLIGHTS' DOTS — the home page (Marco, 15 Nov): one dot per
  highlight, on the footer's line, its left edge one column in from the
  band (where the grid switch stands on other pages). Desktop only.

  The dots are 0.75 units round, 1 unit apart; the current one is
  longer (3 units) and holds a progress bar: the
  time until the next highlight comes up (--highlight-time), filling in
  from the left, halfway between quiet and full ink. When it is full, `onend` is called (the page
  goes to the next one). Changing highlight, the old dot shrinks and the
  new one grows with the time and curve of every icon (--icon); the bar
  starts again from empty.
  Dots at rest in the grey of the view switch (--rest: the quiet grey a
  quarter towards the background); full ink under the pointer (--hover)
  — the current one only its bar, the time gone.
  A click on a dot shows its highlight.

  `running`: the bar fills only while true (the intro over, nothing
  asked of the reader); with reduced motion it never fills, and the
  highlights don't move on by themselves.
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';

  let {
    count,
    at,
    running = true,
    hidden = false,
    onpick,
    onend
  }: {
    count: number;
    at: number;
    running?: boolean;
    hidden?: boolean;
    onpick: (i: number) => void;
    onend: () => void;
  } = $props();
</script>

<Panel area="rest" class="dots-panel">
  <nav class="dots fade" class:is-hidden={hidden} aria-label="Highlights" out:leave|global>
    {#each {length: count}, i (i)}
      <button
        type="button"
        class="dot"
        class:current={i === at}
        aria-label="Highlight {i + 1} of {count}"
        aria-current={i === at ? 'true' : undefined}
        onclick={() => onpick(i)}
      >
        <span class="track">
          {#if i === at}
            {#key at}
              <span class="bar" class:running onanimationend={onend}></span>
            {/key}
          {/if}
        </span>
      </button>
    {/each}
  </nav>
</Panel>

<style>
  :global(.panel.dots-panel) {
    z-index: 1;
    pointer-events: none;
  }
  /* On the footer's line, centred on it, from one column in (as the view
     switch's icon) */
  .dots {
    --size: calc(0.75 * var(--u));
    position: absolute;
    left: var(--col);
    bottom: calc(6 * var(--u) - var(--size) / 2);
    display: flex;
    gap: var(--u);
    pointer-events: auto;
  }
  .dot {
    position: relative;
    width: var(--size);
    height: var(--size);
    cursor: pointer;
    transition: width var(--icon);
    --focus-offset: calc(var(--u) / 2);
  }
  .dot.current {
    width: calc(3 * var(--u));
    cursor: default;
  }
  /* What catches the pointer: the line's height, and half the gap on
     either side */
  .dot::after {
    content: '';
    position: absolute;
    inset: calc(-2 * var(--u)) calc(-1 * var(--u) / 2);
  }
  /* What is seen: round ends, the bar inside it */
  .track {
    --rest: color-mix(in srgb, var(--ink-quiet) 75%, var(--bg));
    position: absolute;
    inset: 0;
    border-radius: var(--size);
    overflow: hidden;
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * 100%), var(--rest));
    transition: --lit var(--hover);
  }
  /* Not the current one: it is not a link, and its bar must stay readable */
  .dot:not(.current):hover .track {
    --lit: 1;
  }

  /* The time until the next highlight: halfway between quiet and full
     ink (quiet alone was too faint on the dot's grey), full ink under the
     pointer (the time gone only; the rest of the dot stays as it is).
     It slides in from the left, inside the dot (a scale from 0 is not
     even in Safari: the bar sped up) */
  .bar {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--ink) calc(50% + var(--lit) * 50%), var(--ink-quiet));
    transform: translateX(-100%);
    transition: --lit var(--hover);
  }
  .dot.current:hover .bar {
    --lit: 1;
  }
  /* (longhands: Safari reads `linear` wrongly in the shorthand with a
     var() in it, and eases the bar) */
  .bar.running {
    animation-name: fill;
    animation-duration: var(--highlight-time);
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
  @keyframes fill {
    to {
      transform: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .dot {
      transition: none;
    }
    .bar.running {
      animation: none;
    }
  }

  @media (max-width: 767px) {
    .dots {
      display: none;
    }
  }
</style>
