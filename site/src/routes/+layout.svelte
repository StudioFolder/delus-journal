<!--
  The stage: background, the band (menu + footer), and the grid overlay.
  This layout never re-renders between pages; only what changes animates.

  The stage carries the tone (dark or light), chosen with the dot at the
  bottom right; the colours travel from one tone to the other
  (see TONES in styles.css).

  Desktop: the band is a vertical strip placed on the 36-column grid.
  Mobile (under 768px): the band becomes a header across the top; the
  menu button on its right (two lines, turning into a cross) opens the
  menu: the menu lies under the page, on the band's colour, and the page
  (a layer with its own background) slides down to half the screen to
  show it; the menu, then the tagline and the tone dot at its bottom,
  cascade in. Only the page moves, as one piece (a transform).
-->
<script lang="ts">
  import '#lib/styles.css';
  import {page} from '$app/state';
  import {afterNavigate, onNavigate} from '$app/navigation';
  import {onMount} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import GridOverlay from '#lib/grid/GridOverlay.svelte';
  import {current} from '#lib/grid/layout.svelte.ts';
  import {isSmall, backFor} from '#lib/grid/layouts.ts';
  import {tone} from '#lib/tone/tone.svelte.ts';
  import ToneDot from '#lib/tone/ToneDot.svelte';
  import {snapshot} from '#lib/motion/carry.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {site} from '#lib/data/fixtures.ts';

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

  // In the Small band the menu is replaced by "Back" (where it leads: layouts.ts)
  const small = $derived(isSmall(current.layout));
  const back = $derived(backFor(current.layout, page.params as Record<string, string>));

  // Phone: the section's name at the top of the page (not on pages with "Back")
  const section = $derived(small ? undefined : nav.find((item) => isActive(item.href))?.label);

  // False during the very first load, when nothing moves (see FADE in styles.css)
  let live = $state(false);
  onMount(() => void (live = true));

  // Elements that travel to the next page: note where they are (motion/carry.ts)
  onNavigate(snapshot);

  // Mobile menu
  let menuOpen = $state(false);
  afterNavigate(() => {
    menuOpen = false;
    away = false;
  });
  const onkeydown = (e: KeyboardEvent) => e.key === 'Escape' && (menuOpen = false);

  // Phone: the band (header) goes away while the page is scrolled down
  // and comes back as soon as it is scrolled up (or back to its top).
  // Pages scroll inside their panels: scroll events don't bubble, so
  // they are caught on their way down (capture). Sideways scrolling
  // (scrollTop unchanged) and the bounce at the end are ignored.
  let away = $state(false);
  const tops = new WeakMap<Element, number>();
  onMount(() => {
    const phone = matchMedia('(max-width: 767px)');
    const onscroll = (e: Event) => {
      const el = e.target;
      if (!(el instanceof Element) || !phone.matches) return;
      const top = el.scrollTop;
      const last = tops.get(el) ?? 0;
      tops.set(el, top);
      const end = el.scrollHeight - el.clientHeight;
      if (top <= 0) away = false;
      else if (top > last) away = true;
      else if (top < last - 2 && top < end - 2) away = false;
    };
    addEventListener('scroll', onscroll, {capture: true, passive: true});
    return () => removeEventListener('scroll', onscroll, {capture: true});
  });
</script>

<svelte:window {onkeydown} />

<div
  class="stage"
  class:menu-open={menuOpen}
  class:band-away={away && !menuOpen}
  class:has-section={section}
  class:is-live={live}
  data-tone={tone.current}
  style:--items={nav.length}
>
  <Panel area="band" inset class="band-bg">
    <!-- Mobile only -->
    <button
      class="menu-button"
      aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = !menuOpen)}
    ></button>

    <a class="back fade" class:is-hidden={!small} href={back}>Back</a>

    <!-- Phone only: the section's name, on the band, which extends down
         under the header to hold it -->
    {#key section}
      {#if section}
        <p class="section fade" style:--i={0} out:leave|global>{section}</p>
      {/if}
    {/key}

    <nav>
      {#each nav as item, i}
        <span
          class="item hover fade"
          class:active={isActive(item.href)}
          class:is-hidden={small}
          style:--i={i}
        >
          <a href={item.href}>{item.label}</a>
        </span>
      {/each}
    </nav>

    <footer>
      <a href="/">DELUS</a>
      <!-- Text that doesn't fit the band fades out instead of being cut -->
      <span class="fade" class:is-hidden={bandCols < 10}>{site.tagline}</span>
    </footer>
  </Panel>

  <!-- The page: on mobile, pushed down while the menu is open; it still
       scrolls then, and a tap on it closes the menu -->
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="page" onclick={() => (menuOpen = false)}>
    {@render children()}
  </div>

  <ToneDot />
</div>

<GridOverlay />

<style>
  .stage {
    position: fixed;
    inset: 0;
    background: var(--bg);
  }

  .page {
    position: absolute;
    inset: 0;
  }

  .stage :global(.band-bg) {
    background: var(--band);
    box-shadow: 0 0 calc(3 * var(--u)) var(--shade); /* small and faint, the same on every side */
    overflow: hidden;
    z-index: 1;
  }

  /* Page content that sits on the background: under the band, centred
     vertically — or, with `from-top`, starting at the height of the band's
     `from-top` content (below) */
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
  /* Content longer than the band scrolls inside it, between menu and
     footer, without a visible scrollbar */
  .stage :global(.on-band.from-top) {
    align-items: flex-start;
    padding-top: calc(12 * var(--u)); /* menu: 5 units + its line of 2; then 5 units of air */
    padding-bottom: calc(12 * var(--u)); /* the same above the footer */
  }
  /* On the background nothing frames the content: it scrolls the whole
     height of the screen and disappears at its very edges. What's inside
     keeps --edge above it, so at rest it starts at the same height as the
     band's content (see News) */
  .stage :global(.on-ground.from-top) {
    align-items: flex-start;
    --edge: calc(12 * var(--u));
  }
  .stage :global(.on-band.from-top > *),
  .stage :global(.on-ground.from-top > *) {
    max-height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
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
    pointer-events: none; /* as for the menu: only the link catches clicks */
  }
  footer a {
    pointer-events: auto;
  }
  footer span {
    color: var(--ink-quiet);
  }

  .menu-button,
  .section {
    display: none;
  }

  /* ---------- Mobile: the band becomes a header ---------- */
  @media (max-width: 767px) {
    /* --sheet: where the page begins, under the band — the header, and on
       a section's pages (About, Issues…) a line more for its name (its
       line, then --pad: as DELUS in the header) */
    .stage {
      --sheet: var(--header);
    }
    .stage.has-section {
      --sheet: calc(var(--header) + 2 * var(--u) + var(--pad));
    }
    /* Header bar across the top */
    .stage :global(.band-bg) {
      left: 0;
      width: 100%;
      padding: 0;
      top: 0;
      bottom: auto;
      height: var(--sheet);
      overflow: visible; /* the menu lies below the header */
      transition:
        box-shadow var(--move),
        transform var(--move);
    }
    /* Scrolled down: the band slides up out of the screen. Only the band
       moves: the content already runs under it (below), so it moves with
       the finger alone */
    .stage.band-away :global(.band-bg) {
      transform: translateY(-100%);
      box-shadow: none;
    }
    /* The soft edge: under the band, --pad of the page's colour fading
       out, over the content passing under it; it follows the band (with
       the band away, along the top of the screen) */
    .stage :global(.band-bg::after) {
      content: '';
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      height: var(--pad);
      background: linear-gradient(var(--bg), transparent);
      pointer-events: none;
      /* while the menu is open it is not there: it goes at once, and
         comes back only once the page is back under the band */
      transition: opacity 0s linear var(--move-time);
    }
    .stage.menu-open :global(.band-bg::after) {
      opacity: 0;
      transition-delay: 0s;
    }
    /* Open, the header and the menu under it are one surface */
    .stage.menu-open :global(.band-bg) {
      box-shadow: none;
    }
    /* Under the page: the menu's ground */
    .stage {
      overflow: hidden; /* the page pushed down goes off the bottom */
      background: var(--band);
    }
    /* The page: a layer lying on the menu. Its sheet (background and
       shadow) begins under the band, so its edge keeps the same distance
       from its content, closed or open */
    .page {
      z-index: 0; /* the sheet (z-index -1) stays under the page's content */
    }
    .page::before {
      content: '';
      position: absolute;
      inset: var(--sheet) 0 0;
      z-index: -1;
      background: var(--bg);
      box-shadow: 0 0 calc(3 * var(--u)) var(--shade);
      transition: top 0s linear var(--move-time); /* back under the band once it has come back */
    }
    /* With the band away, the sheet reaches the top of the screen */
    .stage.band-away .page::before {
      top: 0;
      transition-delay: 0s;
    }
    .stage.menu-open .page {
      transform: translateY(calc(50% - var(--sheet))); /* the sheet's edge halfway down the screen */
    }
    /* The content runs above the sheet's edge, under the band: pushed
       down, the page is cut at its edge (a clip, not a cover: on iOS the
       scrolling boxes are layers of their own and would show through
       one), until it is back under the band */
    .page {
      clip-path: inset(0);
      transition:
        transform var(--move),
        clip-path 0s linear var(--move-time);
    }
    .stage.menu-open .page {
      clip-path: inset(var(--sheet) 0 0);
      transition:
        transform var(--move),
        clip-path 0s;
    }

    /* Content that sits on the band on desktop goes on the page, under
       the band, full width */
    .stage :global(.on-band) {
      left: var(--pad);
      right: var(--pad);
      width: auto;
      padding-inline: 0;
      top: var(--sheet);
    }
    /* Content scrolls the whole height of the screen, under the band
       and to the bottom edge (no zone kept there: the tone dot is in the
       menu). At rest it starts --pad under the band (the soft edge's
       height, see .band-bg::after) */
    .stage :global(.on-band.from-top) {
      top: 0;
      padding-top: 0;
      padding-bottom: 0;
    }
    .stage :global(.on-band.from-top > *) {
      padding-top: calc(var(--sheet) + var(--pad));
    }
    /* The section's name (About, Issues…) on the band, under DELUS, as a
       menu item; while the menu is open it gives way to the menu */
    .section {
      display: block;
      position: absolute;
      top: var(--header);
      left: var(--pad);
      font: var(--type-ui);
    }
    .stage.menu-open .section {
      opacity: 0;
      transition: opacity var(--fade-out-time) ease 0s;
    }
    /* Content at the bottom ends above the bottom zone */
    .stage :global(.on-band.from-bottom) {
      padding-bottom: var(--header);
    }
    /* Content on the background with `from-top` takes the same place:
       the whole height, full width (e.g. a news text); what's inside keeps
       --edge above itself: the band and the soft edge */
    .stage :global(.on-ground.from-top) {
      --edge: calc(var(--sheet) + var(--pad));
      left: var(--pad);
      right: var(--pad);
      width: auto;
      top: 0;
      padding-top: 0;
      padding-bottom: 0;
    }

    /* Menu button: two short lines one unit apart; open, they turn into
       a cross (an icon changing state: --icon). The lines' right end sits
       --pad from the edge, like DELUS on the left; the button catches
       the touch over the dot's area (--dot-hit). */
    .menu-button {
      --lines: calc(2 * var(--u)); /* the lines' length */
      display: block;
      position: absolute;
      right: calc(var(--pad) - (var(--dot-hit) - var(--lines)) / 2);
      top: calc((var(--header) - var(--dot-hit)) / 2);
      width: var(--dot-hit);
      height: var(--dot-hit);
      cursor: pointer;
    }
    .menu-button::before,
    .menu-button::after {
      content: '';
      position: absolute;
      left: calc((var(--dot-hit) - var(--lines)) / 2);
      top: calc(50% - 0.75px);
      width: var(--lines);
      height: 1.5px;
      background: var(--ink);
      transition: transform var(--icon);
    }
    .menu-button::before {
      transform: translateY(calc(var(--u) / -2));
    }
    .menu-button::after {
      transform: translateY(calc(var(--u) / 2));
    }
    .menu-open .menu-button::before {
      transform: rotate(45deg);
    }
    .menu-open .menu-button::after {
      transform: rotate(-45deg);
    }

    /* DELUS on the left of the header; tagline at the bottom of the open band */
    footer {
      top: calc(3 * var(--u)); /* its line centred in the header */
      bottom: auto;
      left: var(--pad);
      right: auto;
      display: block;
    }
    /* Tagline and tone dot: on one line at the bottom of the open menu,
       --pad above its edge; they come after the menu's items */
    footer span {
      position: fixed;
      left: var(--pad);
      bottom: calc(50% + var(--pad));
      --i: var(--items);
    }
    .stage :global(.tone-dot) {
      bottom: calc(50% + var(--pad) + var(--u) - var(--dot-hit) / 2);
      transition: opacity var(--fade-time) ease
        calc(var(--move-time) + var(--items) * var(--cascade-step));
    }
    .stage:not(.menu-open) :global(.tone-dot) {
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--fade-out-time) ease 0s;
    }

    /* Menu: a vertical list under the header, only while open */
    nav {
      top: calc(var(--header) + 2 * var(--u));
      left: var(--pad);
      flex-direction: column;
      gap: var(--u);
    }

    /* No "Back" on phones (the browser's own back does it) */
    .back {
      display: none;
    }

    /* Closed: menu and tagline hidden. Open: both shown (cascading in after
       the band has opened), whatever the desktop rules say */
    .stage:not(.menu-open) nav .item,
    .stage:not(.menu-open) footer span {
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--fade-out-time) ease 0s;
    }
    .stage.menu-open nav .item,
    .stage.menu-open footer span {
      opacity: 1;
      /* the cascade of .fade, also where the desktop band hides them
         (is-hidden: Small band, a narrow band's tagline) */
      transition:
        opacity var(--fade-time) ease calc(var(--move-time) + var(--i, 0) * var(--cascade-step)),
        --lit var(--hover);
    }
    .stage:not(.menu-open) nav a {
      pointer-events: none;
    }
    .stage.menu-open nav a {
      pointer-events: auto;
    }
  }
</style>
