<!--
  The stage: background, the band (menu + footer), and the grid overlay.
  This layout never re-renders between pages; only what changes animates.

  The stage carries the tone (dark or light), chosen with the dot at the
  bottom right; the colours travel from one tone to the other
  (see TONES in styles.css).

  Desktop: the band is a vertical strip placed on the 36-column grid.
  Mobile (under 768px): the band becomes a header across the top; the dot
  on its right opens it to full screen and the menu cascades in.
-->
<script lang="ts">
  import '#lib/styles.css';
  import {page} from '$app/state';
  import {afterNavigate} from '$app/navigation';
  import {onMount} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import GridOverlay from '#lib/grid/GridOverlay.svelte';
  import {current} from '#lib/grid/layout.svelte.ts';
  import {isSmall, backFor} from '#lib/grid/layouts.ts';
  import {cascade} from '#lib/motion/cascade.ts';
  import {tone} from '#lib/tone/tone.svelte.ts';
  import ToneDot from '#lib/tone/ToneDot.svelte';

  let {children} = $props();

  // The menu. Home has no item: "DELUS" in the footer leads there.
  const nav = [
    {href: '/about/', label: 'About'},
    {href: '/issues/', label: 'Issues'},
    {href: '/contributors/', label: 'Contributors'},
    {href: '/events/', label: 'News'}
  ];
  const isActive = (href: string) => page.url.pathname.startsWith(href);

  const band = $derived(current.layout.band);
  const bandCols = $derived(band[1] - band[0] + 1);

  // In the Small band the menu is replaced by a back link to the Medium band
  const small = $derived(isSmall(current.layout));
  const back = $derived(backFor(current.layout, page.params as Record<string, string>));

  // False during the very first load, when nothing moves (see FADE in styles.css)
  let live = $state(false);
  onMount(() => void (live = true));

  // Mobile menu
  let menuOpen = $state(false);
  afterNavigate(() => (menuOpen = false));
  const onkeydown = (e: KeyboardEvent) => e.key === 'Escape' && (menuOpen = false);
</script>

<svelte:window {onkeydown} />

<div
  class="stage"
  class:menu-open={menuOpen}
  class:is-live={live}
  data-tone={tone.current}
>
  <Panel area="band" inset class="band-bg">
    <!-- Mobile only -->
    <button
      class="dot"
      aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = !menuOpen)}
    ></button>

    <a class="back fade" class:is-hidden={!small} href={back}>Back</a>

    <nav use:cascade>
      {#each nav as item}
        <span class="item hover fade" class:active={isActive(item.href)} class:is-hidden={small}>
          <a href={item.href}>{item.label}</a>
        </span>
      {/each}
    </nav>

    <footer>
      <a href="/">DELUS</a>
      <!-- Text that doesn't fit the band fades out instead of being cut -->
      <span class="fade" class:is-hidden={bandCols < 10}>Journal for Landscape and Urban Studies</span>
    </footer>
  </Panel>

  {@render children()}

  <ToneDot />
</div>

<GridOverlay />

<style>
  .stage {
    position: fixed;
    inset: 0;
    background: var(--bg);
  }

  .stage :global(.band-bg) {
    background: var(--band);
    overflow: hidden;
    z-index: 1;
  }

  /* Page content that sits on the background: under the band, centred vertically */
  .stage :global(.on-ground) {
    display: flex;
    align-items: center;
  }

  /* Page content that sits on the band: above it, centred vertically —
     or, with `from-top`, starting under the menu; with `from-bottom`,
     ending above the footer, at the same distance.
     Like the menu, the panel itself doesn't catch clicks, only what's in it */
  .stage :global(.on-band) {
    z-index: 1;
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  .stage :global(.on-band.from-top) {
    align-items: flex-start;
    padding-top: calc(12 * var(--u)); /* menu: 5 units + its line of 2; then 5 units of air */
  }
  .stage :global(.on-band.from-bottom) {
    align-items: flex-end;
    padding-bottom: calc(12 * var(--u)); /* footer: 5 units + its line of 2; then 5 units of air */
  }
  .stage :global(.on-band > *) {
    pointer-events: auto;
  }

  nav,
  footer,
  .back {
    position: absolute;
    left: var(--col);
    font: var(--type-ui);
    white-space: nowrap;
  }

  /* Menu items follow one another from column 3, 4 units apart; they
     don't move while the band resizes */
  nav {
    top: calc(5 * var(--u));
    display: flex;
    gap: calc(4 * var(--u));
    pointer-events: none; /* only the visible items catch clicks, so "Back" stays clickable */
  }
  /* The item, not its link, carries the colour and the hover effect
     (see LINKS and HOVER in styles.css) */
  nav a {
    pointer-events: auto;
  }
  nav .is-hidden a {
    pointer-events: none;
  }

  .back {
    top: calc(5 * var(--u));
  }

  /* Footer: DELUS on column 3, tagline from column 5, both fixed */
  footer {
    bottom: calc(5 * var(--u));
    right: var(--col);
    display: grid;
    grid-template-columns: calc(2 * var(--col)) auto;
  }
  footer {
    pointer-events: none; /* as for the menu: only the link catches clicks */
  }
  footer a {
    pointer-events: auto;
  }
  footer span {
    color: var(--ink-quiet);
  }

  .dot {
    display: none;
  }

  /* ---------- Mobile: the band becomes a header ---------- */
  @media (max-width: 767px) {
    /* Header bar across the top; opens downwards to full screen */
    .stage :global(.band-bg) {
      left: 0;
      width: 100%;
      padding: 0;
      top: 0;
      bottom: auto;
      height: var(--header);
      transition: height var(--move);
    }
    .stage.menu-open :global(.band-bg) {
      height: 100%;
    }

    /* Content that sits on the band on desktop goes under the header,
       full width; it fades away while the menu is open */
    .stage :global(.on-band) {
      left: var(--pad);
      right: var(--pad);
      width: auto;
      padding-inline: 0;
      top: var(--header);
      transition: opacity var(--fade-time) ease var(--move-time);
    }
    .stage :global(.on-band.from-top) {
      padding-top: var(--pad);
    }
    .stage.menu-open :global(.on-band) {
      opacity: 0;
      transition: opacity var(--fade-out-time) ease 0s;
    }

    .dot {
      display: block;
      position: absolute;
      right: calc(var(--pad) - var(--dot-edge)); /* the visible dot sits --pad from the edge, like DELUS on the left */
      top: calc((var(--header) - var(--dot-hit)) / 2);
      width: var(--dot-hit);
      height: var(--dot-hit);
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
    }
    .dot::before {
      content: '';
      position: absolute;
      inset: var(--dot-edge);
      border-radius: 50%;
      border: 1.5px solid var(--ink);
      background: var(--ink);
      transition: background-color var(--hover);
    }
    .menu-open .dot::before {
      background: transparent; /* filled = closed, ring = open */
    }

    /* DELUS on the left of the header; tagline at the bottom of the open band */
    footer {
      top: calc(3 * var(--u)); /* its line centred in the header */
      bottom: auto;
      left: var(--pad);
      right: auto;
      display: block;
    }
    footer span {
      position: fixed;
      left: var(--pad);
      bottom: var(--pad);
    }

    /* Menu: a vertical list under the header, only while open */
    nav {
      top: calc(var(--header) + 2 * var(--u));
      left: var(--pad);
      flex-direction: column;
      gap: var(--u);
    }

    /* Back: right side of the header, just before the dot */
    .back {
      top: calc(3 * var(--u));
      left: auto;
      right: calc(var(--pad) + 4 * var(--u));
    }

    /* Closed: menu and tagline hidden. Open: both shown (cascading in after
       the band has opened), whatever the desktop rules say; Back hidden */
    .stage:not(.menu-open) nav .item,
    .stage:not(.menu-open) footer span {
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--fade-out-time) ease 0s;
    }
    .stage.menu-open nav .item,
    .stage.menu-open footer span {
      opacity: 1;
    }
    .stage:not(.menu-open) nav a {
      pointer-events: none;
    }
    .stage.menu-open nav a {
      pointer-events: auto;
    }
    .stage.menu-open .back {
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--fade-out-time) ease 0s;
    }
  }
</style>
