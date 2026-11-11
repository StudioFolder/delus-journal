<!--
  The stage: background, the band (menu + footer), and the grid overlay.
  This layout never re-renders between pages; only what changes animates.

  Desktop: the band is a vertical strip placed on the 36-column grid.
  Mobile (under 768px): the band becomes a header across the top; the dot
  on its left opens it to full screen and the menu cascades in.
-->
<script lang="ts">
  import '#lib/styles.css';
  import {page} from '$app/state';
  import {afterNavigate} from '$app/navigation';
  import Panel from '#lib/grid/Panel.svelte';
  import GridOverlay from '#lib/grid/GridOverlay.svelte';
  import {current} from '#lib/grid/layout.svelte.ts';
  import {isSmall, backFor} from '#lib/grid/layouts.ts';
  import {cascade} from '#lib/motion/cascade.ts';

  let {children} = $props();

  // Temporary menu: one item per band size (see layouts.ts)
  const nav = [
    {href: '/about/', label: 'Small'},
    {href: '/', label: 'Medium'},
    {href: '/contributors/', label: 'Large'},
    {href: '/events/', label: 'X-Large'}
  ];
  const isActive = (href: string) =>
    href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);

  const band = $derived(current.layout.band);
  const bandCols = $derived(band[1] - band[0] + 1);

  // In the Small band the menu is replaced by a back link to the Medium band
  const small = $derived(isSmall(current.layout));
  const back = $derived(backFor(current.layout, page.params as Record<string, string>));

  // Mobile menu
  let menuOpen = $state(false);
  afterNavigate(() => (menuOpen = false));
  const onkeydown = (e: KeyboardEvent) => e.key === 'Escape' && (menuOpen = false);
</script>

<svelte:window {onkeydown} />

<div class="stage" class:menu-open={menuOpen}>
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
      {#each nav as item, i}
        <!-- Desktop: item i takes columns 3+2i and 4+2i; hidden in the Small band
             or where the band's inner edge would cut it -->
        <a
          href={item.href}
          class="fade"
          class:active={isActive(item.href)}
          class:is-hidden={small || 4 + 2 * i > band[1] - 1}>{item.label}</a
        >
      {/each}
    </nav>

    <footer>
      <a href="/">DELUS</a>
      <!-- Text that doesn't fit the band fades out instead of being cut -->
      <span class="fade" class:is-hidden={bandCols < 10}>Journal for Landscape and Urban Studies</span>
    </footer>
  </Panel>

  {@render children()}
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

  nav,
  footer,
  .back {
    position: absolute;
    left: var(--col);
    font: 13px/1.4 var(--sans);
    white-space: nowrap;
  }

  /* Menu items sit on fixed columns (two each, from column 3), so they
     don't move while the band resizes */
  nav {
    top: 40px;
    right: var(--col);
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: calc(2 * var(--col));
    pointer-events: none; /* only the visible items catch clicks, so "Back" stays clickable */
  }
  nav a {
    color: var(--ink-quiet);
    pointer-events: auto;
  }
  nav a.is-hidden {
    pointer-events: none;
  }
  nav a:hover,
  nav a.active {
    color: var(--ink);
  }

  .back {
    top: 40px;
    color: var(--ink);
  }

  /* Footer: DELUS on column 3, tagline from column 5, both fixed */
  footer {
    bottom: 40px;
    right: var(--col);
    display: grid;
    grid-template-columns: calc(2 * var(--col)) auto;
  }
  footer {
    pointer-events: none; /* as for the menu: only the link catches clicks */
  }
  footer a {
    color: var(--ink);
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
    .stage {
      --header: 64px;
      --pad: 24px;
    }

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

    .dot {
      display: block;
      position: absolute;
      left: calc(var(--pad) - 12px);
      top: calc(var(--header) / 2 - 17px);
      width: 34px;
      height: 34px;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
    }
    .dot::before {
      content: '';
      position: absolute;
      inset: 12px;
      border-radius: 50%;
      border: 1.5px solid var(--ink);
      background: var(--ink);
      transition: background-color 200ms;
    }
    .menu-open .dot::before {
      background: transparent; /* filled = closed, ring = open */
    }

    /* DELUS next to the dot; tagline at the bottom of the open band */
    footer {
      top: calc(var(--header) / 2 - 9px);
      bottom: auto;
      left: calc(var(--pad) + 22px);
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
      top: calc(var(--header) + 16px);
      left: var(--pad);
      right: var(--pad);
      grid-auto-flow: row;
      grid-auto-columns: auto;
      gap: 8px;
    }

    /* Back: right side of the header */
    .back {
      top: calc(var(--header) / 2 - 9px);
      left: auto;
      right: var(--pad);
    }

    /* Closed: menu and tagline hidden. Open: both shown (cascading in after
       the band has opened), whatever the desktop rules say; Back hidden */
    .stage:not(.menu-open) nav a,
    .stage:not(.menu-open) footer span {
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--fade-out-time) ease 0s;
    }
    .stage.menu-open nav a,
    .stage.menu-open footer span {
      opacity: 1;
      pointer-events: auto;
    }
    .stage.menu-open .back {
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--fade-out-time) ease 0s;
    }
  }
</style>
