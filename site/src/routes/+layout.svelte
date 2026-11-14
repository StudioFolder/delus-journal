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
  Where the page scrolls the window (FLOW, in the styles) it stays
  meanwhile where it was scrolled to.
-->
<script lang="ts">
  import '#lib/styles.css';
  import {page} from '$app/state';
  import {afterNavigate, onNavigate} from '$app/navigation';
  import {onMount} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import GridOverlay from '#lib/grid/GridOverlay.svelte';
  import {current} from '#lib/grid/layout.svelte.ts';
  import {isSmall, backFor, layoutFor} from '#lib/grid/layouts.ts';
  import {tone} from '#lib/tone/tone.svelte.ts';
  import ToneDot from '#lib/tone/ToneDot.svelte';
  import {snapshot} from '#lib/motion/carry.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {hold} from '#lib/motion/hold.ts';
  import {time} from '#lib/motion/time.ts';
  import {ready} from '#lib/search/keyboard.ts';
  import {site, legal, issues} from '#lib/data/fixtures.ts';
  import {issueLabel} from '#lib/data/format.ts';

  let {children} = $props();

  // The menu. Home has no item: "DELUS" in the footer leads there.
  // Search is drawn, not written, on the band (`glass`: a lens at the
  // right end of the menu's line); in the Phone menu it is a word.
  const nav = [
    {href: '/about/', label: 'About'},
    {href: '/issues/', label: 'Issues'},
    {href: '/contributors/', label: 'Contributors'},
    {href: '/events/', label: 'News'},
    {href: '/search/', label: 'Search', glass: true}
  ];
  const isActive = (href: string) => page.url.pathname.startsWith(href);

  const band = $derived(current.layout.band);
  const bandCols = $derived(band[1] - band[0] + 1);

  // In the Small band the menu is replaced by "Back" (where it leads:
  // layouts.ts) — also while that band is opened wider (an article being
  // searched): it goes by the page's own band
  const small = $derived(isSmall(layoutFor(page.route.id)));
  const back = $derived(backFor(current.layout, page.params as Record<string, string>));

  // Under an issue (an article, the editors' note) "Back" reads as the
  // issue it leads to ("Issue 01"), and as "Back" only while the pointer
  // is over the band. Elsewhere (a contributor's page) always "Back".
  const issue = $derived(
    page.route.id?.startsWith('/issues/[slug]/')
      ? issues.find((x) => x.slug === page.params.slug)
      : undefined
  );
  let overBand = $state(false);
  onMount(() => {
    const onmove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const band = document.querySelector('.band-bg');
      overBand = !!band && e.clientX < band.getBoundingClientRect().right;
    };
    const onleave = () => (overBand = false);
    addEventListener('pointermove', onmove, {passive: true});
    document.documentElement.addEventListener('mouseleave', onleave);
    return () => {
      removeEventListener('pointermove', onmove);
      document.documentElement.removeEventListener('mouseleave', onleave);
    };
  });

  // Phone: the section's name at the top of the page (not on pages with "Back")
  const section = $derived(small ? undefined : nav.find((item) => isActive(item.href))?.label);

  // The window carries the tone as the stage does: on a phone its colour
  // is what shows past the page's ends, and around the browser's bars
  $effect(() => {
    document.documentElement.dataset.tone = tone.current;
  });

  // False during the very first load, when nothing moves (see FADE in styles.css)
  let live = $state(false);
  onMount(() => void (live = true));

  // Elements that travel to the next page: note where they are (motion/carry.ts)
  onNavigate(snapshot);

  // Phone: whether the page scrolls the window (FLOW, in the styles) — as
  // its URL says (layouts.ts), and for as long as a page that does is
  // still fading out
  let leaving = $state(false);
  const flows = $derived(current.layout.flows || leaving);
  onNavigate(() => {
    if (!current.layout.flows) return;
    leaving = true;
    setTimeout(() => (leaving = false), time('--fade-out-time'));
  });

  // Mobile menu. `held`: how far the window is scrolled while the page
  // is pushed down — its edge is cut that much further (0 on the pages
  // that scroll inside their panels). A finger doesn't scroll the window
  // then (the page's edge would leave the menu's); if something else
  // does (a wheel), the edge follows
  let menuOpen = $state(false);
  let held = $state(0);
  const toggle = () => {
    if (!menuOpen) held = scrollY;
    menuOpen = !menuOpen;
  };
  afterNavigate(() => {
    menuOpen = false;
    away = false;
    held = scrollY; // the new page's own place
  });
  const onkeydown = (e: KeyboardEvent) => e.key === 'Escape' && (menuOpen = false);
  $effect(() => {
    if (menuOpen && flows) return hold();
  });

  // Phone: the band (header) goes away while the page is scrolled down
  // and comes back as soon as it is scrolled up (or back to its top).
  // Pages scroll inside their panels, or the window itself (FLOW): scroll
  // events don't bubble, so they are caught on their way down (capture).
  // Sideways scrolling (scrollTop unchanged) and the bounce at the end
  // are ignored.
  let away = $state(false);
  const tops = new WeakMap<Element, number>();
  onMount(() => {
    const phone = matchMedia('(max-width: 767px)');
    const onscroll = (e: Event) => {
      if (!phone.matches) return;
      const el = e.target instanceof Element ? e.target : document.scrollingElement;
      if (!el) return;
      if (menuOpen && el === document.scrollingElement) held = scrollY;
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
  class:flows
  class:is-live={live}
  data-tone={tone.current}
  style:--items={nav.length + legal.length}
  style:--held="{held}px"
>
  <Panel area="band" inset class="band-bg">
    <!-- Mobile only -->
    <button
      class="menu-button"
      aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={menuOpen}
      onclick={toggle}
    ></button>

    <!-- The two words lie in the same place: one fades out, then the
         other fades in -->
    <a class="back fade" class:is-hidden={!small} href={back}>
      <span class="word-back" class:shown={!issue || overBand}>Back</span>
      {#if issue}<span class:shown={!overBand}>{issueLabel(issue.number)}</span>{/if}
    </a>

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
          class:glass={item.glass}
          style:--i={i}
        >
          <!-- (Search: the phone's keyboard is called in the tap — #lib/search/keyboard.ts) -->
          <a href={item.href} onclick={item.glass ? ready : undefined}>{item.label}</a>
        </span>
      {/each}
      <!-- Phone only: Imprint and Privacy, after a break (on desktop they
           are in the footer) -->
      {#each legal as text, j (text.slug)}
        <span
          class="item legal hover fade"
          class:active={isActive(`/${text.slug}/`)}
          class:is-hidden={small}
          style:--i={nav.length + j}
        >
          <a href="/{text.slug}/">{text.title}</a>
        </span>
      {/each}
    </nav>

    <footer>
      <a href="/">DELUS</a>
      <!-- Text that doesn't fit the band fades out instead of being cut.
           The tagline and the links lie in the same place: one fades out,
           then the other fades in -->
      <span class="line fade" class:is-hidden={bandCols < 10}>
        <span class="tagline">{site.tagline}</span>
        <span class="links">
          {#each legal as text (text.slug)}
            <span class="item hover" class:active={isActive(`/${text.slug}/`)}>
              <a href="/{text.slug}/">{text.title}</a>
            </span>
          {/each}
        </span>
      </span>
    </footer>
  </Panel>

  <!-- The page: on mobile, pushed down while the menu is open; a tap on
       it closes the menu (it still scrolls then, where it scrolls inside
       its panels) -->
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
  /* On mobile (below): whether the page is cut at its sheet's edge,
     whether its sheet is lifted to the top of the screen, and how far
     the band is away (where the page scrolls the window) */
  @property --cut {
    syntax: '<number>';
    inherits: false;
    initial-value: 0;
  }
  @property --lift {
    syntax: '<number>';
    inherits: false;
    initial-value: 0;
  }
  @property --away {
    syntax: '<number>';
    inherits: false;
    initial-value: 0;
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
  nav .legal {
    display: none;
  }
  /* Search: on the band, a lens in place of the word (drawn, stroke
     1.25, as the other icons), on the menu's line but against the
     band's right edge, one column in, as the content — so it follows the
     band when it resizes. It is drawn on the menu's line of text (1.5
     units wide, the line's 2 units high): its circle stands on the
     baseline and is as tall as the capitals, its short handle goes
     below, as a descender. In the item's colour: quiet, full ink under
     the pointer and on the search page. The word stays in the page, for
     screen readers. It catches the pointer one unit around itself.
     Not on Phone, where the menu is a list of words */
  @media (min-width: 768px) {
    nav {
      right: var(--col);
    }
    nav .glass {
      margin-left: auto;
    }
    nav .glass a {
      position: relative;
      display: block;
      width: calc(1.5 * var(--u));
      height: calc(2 * var(--u));
      font-size: 0;
    }
    nav .glass a::before {
      content: '';
      position: absolute;
      inset: 0 calc(-0.5 * var(--u)) 0 0; /* the handle's end passes the edge by a hair */
      background: currentColor;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='black' stroke-width='1.25'%3E%3Ccircle cx='6.125' cy='9' r='4.375'/%3E%3Cpath d='M9.22 12.09 12.3 15.17'/%3E%3C/svg%3E")
        center / contain no-repeat;
    }
    nav .glass a::after {
      content: '';
      position: absolute;
      inset: calc(-1 * var(--u));
    }
  }

  .back {
    top: calc(5 * var(--u));
    display: grid;
  }
  .back span {
    grid-area: 1 / 1;
    opacity: 0;
    transition: opacity var(--fade-out-time) ease 0s;
  }
  .back span.shown {
    opacity: 1;
    transition: opacity var(--fade-time) ease var(--fade-out-time);
  }
  /* A small left arrow (←, 1 unit square, as the ↗ of links) before
     "Back", in the margin: the word stays on column 3 */
  .word-back {
    position: relative;
  }
  .word-back::before {
    content: '';
    position: absolute;
    right: calc(100% + var(--u));
    top: calc(50% - var(--u) / 2 + 0.1em); /* on the middle of the capitals */
    width: var(--u);
    height: var(--u);
    background: var(--ink);
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' fill='none' stroke='black' stroke-width='1.25'%3E%3Cpath d='M7.5 4H0.5M3.5 1 0.5 4l3 3'/%3E%3C/svg%3E")
      center / contain no-repeat;
  }

  /* Footer: DELUS on column 3, tagline from column 5, both fixed. The
     whole line catches the pointer (nothing lies under it), so moving
     from DELUS to the links keeps them there */
  footer {
    bottom: calc(5 * var(--u));
    right: var(--col);
    display: grid;
    grid-template-columns: calc(2 * var(--col)) auto;
  }
  /* The tagline and the links to Imprint and Privacy, in the same place:
     under the pointer the tagline fades out, then the links fade in
     (4 units apart, as the menu's items; quiet → full ink) */
  .line {
    display: grid;
    justify-items: start;
  }
  .line > * {
    grid-area: 1 / 1;
  }
  .tagline {
    color: var(--ink-quiet);
    transition: opacity var(--fade-time) ease var(--fade-out-time);
  }
  .links {
    display: flex;
    gap: calc(4 * var(--u));
    opacity: 0;
    transition: opacity var(--fade-out-time) ease 0s;
  }
  .links a {
    pointer-events: none;
  }
  /* Shown: under the pointer, or with the keyboard on the footer. Not
     where the tagline itself is hidden (a narrow band). On Phone they are
     in the menu instead */
  @media (hover: hover) {
    footer:hover .line:not(.is-hidden) .tagline {
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--fade-out-time) ease 0s;
    }
    footer:hover .line:not(.is-hidden) .links {
      opacity: 1;
      transition: opacity var(--fade-time) ease var(--fade-out-time);
    }
    footer:hover .line:not(.is-hidden) .links a {
      pointer-events: auto;
    }
  }
  footer:has(:focus-visible) .line:not(.is-hidden) .tagline {
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--fade-out-time) ease 0s;
  }
  footer:has(:focus-visible) .line:not(.is-hidden) .links {
    opacity: 1;
    transition: opacity var(--fade-time) ease var(--fade-out-time);
  }
  footer:has(:focus-visible) .line:not(.is-hidden) .links a {
    pointer-events: auto;
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
      inset: calc((1 - var(--lift, 0)) * var(--sheet)) 0 0;
      z-index: -1;
      background: var(--bg);
      box-shadow: 0 0 calc(3 * var(--u)) var(--shade);
      transition: --lift 0s linear var(--move-time); /* back under the band once it has come back */
    }
    /* With the band away, the sheet reaches the top of the screen.
       --lift says so (1), a number of its own: only that waits for the
       band — not the band's height, which changes at once from a page
       to the next (the sheet waiting showed the menu's ground there,
       and the soft edge on it) */
    .stage.band-away .page::before {
      --lift: 1;
      transition-delay: 0s;
    }
    .stage.menu-open .page {
      transform: translateY(calc(50% - var(--sheet))); /* the sheet's edge halfway down the screen */
    }
    /* The content runs above the sheet's edge, under the band: pushed
       down, the page is cut at its edge (a clip, not a cover: on iOS the
       scrolling boxes are layers of their own and would show through
       one), until it is back under the band. --cut says whether it is
       cut (1) or whole (0): a number of its own, so that the edge itself
       can change meanwhile (--held, as the window's scroll does when a
       page is opened from the menu) */
    .page {
      clip-path: inset(calc(var(--cut, 0) * (var(--held) + var(--sheet))) 0 0);
      transition:
        transform var(--move),
        --cut 0s linear var(--move-time);
    }
    .stage.menu-open .page {
      --cut: 1;
      transition:
        transform var(--move),
        --cut 0s;
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
    footer .line {
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
    /* Imprint and Privacy after the sections, a line apart */
    nav .legal {
      display: block;
    }
    nav .item:not(.legal) + .legal {
      margin-top: calc(3 * var(--u));
    }

    /* No "Back" on phones (the browser's own back does it) */
    .back {
      display: none;
    }

    /* Closed: menu and tagline hidden. Open: both shown (cascading in after
       the band has opened), whatever the desktop rules say */
    .stage:not(.menu-open) nav .item,
    .stage:not(.menu-open) footer .line {
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--fade-out-time) ease 0s;
    }
    .stage.menu-open nav .item,
    .stage.menu-open footer .line {
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

    /* ---------- FLOW: the page scrolls the window ----------

       A phone's browser shrinks its bars only when the window itself
       scrolls, and only then does the page run under them, to the very
       bottom of the screen. So a page can let the window scroll its
       content, instead of the panel that holds it: its URL says so
       (`flows`, grid/layouts.ts) and the panel has the class `flows`
       (so far the article; the other pages follow, and then every
       `from-top` panel flows).

       The stage then (`.flows`, set above: a class, not `:has()`, which
       Safari doesn't always look at again) is not fixed to the screen:
       it is as long as the page, and the window (free to scroll on
       phones: styles.css) scrolls it. The panels that flow lie in it
       one over the other (one cell), as panels do on the screen — so a
       page leaving and the page arriving still overlap. What must stay
       on the screen is fixed to it: the band, the tone dot in the open
       menu, and any panel that doesn't flow (a page that scrolls inside
       its panels, leaving or arriving). */
    .stage.flows {
      position: relative;
      inset: auto;
      min-height: 100svh;
      overflow: clip; /* the page pushed down is cut at the bottom; nothing scrolls here */
    }
    .stage.flows .page {
      position: relative;
      inset: auto;
      min-height: 100svh;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      padding-inline: var(--pad);
    }
    .stage :global(.panel.flows) {
      position: static;
      grid-area: 1 / 1;
    }
    .stage :global(.panel.flows > *) {
      max-height: none;
      overflow: visible;
    }
    .stage.flows :global(:is(.band-bg, .tone-dot, .page > .panel:not(.flows))) {
      position: fixed;
    }
    /* The band slides away and back by a number of its own (--away)
       that sets its place, not by a transition of its transform: that
       one the browser runs apart from the page, and iOS Safari drops it
       when it starts while the window is scrolling — the band jumped. A
       number is counted with the page, frame by frame, and shows. (Its
       place, not a transform: the tagline of the open menu is fixed to
       the screen, and inside a transformed band it would not be) */
    .stage.flows :global(.band-bg) {
      top: calc(var(--away, 0) * -1 * var(--sheet));
      transform: none;
      transition:
        box-shadow var(--move),
        --away var(--move);
    }
    .stage.flows.band-away :global(.band-bg) {
      --away: 1;
    }
    /* The menu open: the page is pushed down by half the screen (not
       half its own length), and stays where it was scrolled (`hold`,
       above) */
    .stage.flows.menu-open .page {
      transform: translateY(calc(50dvh - var(--sheet)));
    }
  }
</style>
