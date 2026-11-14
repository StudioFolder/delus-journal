<!--
  News: the list of all news on the band, and — once one is opened — the
  texts of all news in the space to the right. Both live in this layout,
  shared by the list (/events/) and each news item (/events/[slug]/), so
  nothing reloads while moving from one item to another.
  The band for these URLs is set in #lib/grid/layouts.ts.

  LIST — newest first. Each entry is two lines: category and date in
  small capitals, then the title. Entries are quiet and turn to full ink
  under the pointer; the entry on view is in full ink. The date (11.2026)
  appears only under the pointer, quiet, from column 6, so all the dates
  line up whatever the category; on touch screens, which have no pointer
  to hover with, it is always shown. The whole entry is the link.


  TEXTS — on an item's URL, and on desktop also on the list's own URL
  (/events/, which opens on the newest item, selected — Marco's request,
  so arriving from the menu there is already a text to read), all the
  news texts, in the same order, one
  below the other, each as tall as the screen: scrolling anywhere right
  of the band moves from one to the next and snaps to it, the text
  starting at the height of the list; while scrolling, the texts run to
  the very top and bottom edges of the screen. A text longer than the
  screen scrolls inside its own page, like a normal page, with some space
  after its last line; once at its end, the next gesture snaps on to the
  next text; coming back, a long text shows from its beginning. The entry
  in the list and the address follow the text on view (the address
  quietly, without a new page). Clicking an entry scrolls to its text.
  Each text: the date (12.11.2026) above the title, then the first image,
  then the text — 18 columns, one column after the band (columns 15–32
  with the Medium band). See NewsText.svelte.

  MOBILE — the list under the header (on /events/ nothing is opened or
  selected: the texts would hide the list); with an item open, the texts
  take its place and snap in the same way.
-->
<script lang="ts">
  import {onMount, untrack} from 'svelte';
  import {page} from '$app/state';
  import {afterNavigate, replaceState} from '$app/navigation';
  import Panel from '#lib/grid/Panel.svelte';
  import {TEXT_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {still} from '#lib/motion/still.ts';
  import {posts} from '#lib/data/fixtures.ts';
  import {monthYear} from '#lib/data/format.ts';
  import {pageTitle} from '#lib/head/head.ts';
  import NewsText from './NewsText.svelte';

  let {children} = $props();

  // Whether the list was already on view: then the texts opening only
  // replace what was on the right (`.fade.next`), they don't arrive with
  // a new page. Read once, when the texts appear.
  let live = $state(false);
  onMount(() => void (live = true));

  // The news item on view: set by navigation (a click in the list, an
  // address; on /events/ the newest) and by scrolling the texts
  const first = posts[0].slug;
  let onView = $state(page.params.slug ?? first);

  let texts = $state<HTMLElement>(); // the scrolling column of texts
  let placed: HTMLElement | undefined; // the column already scrolled into place once
  let steering = false; // true while the column scrolls to a clicked item

  afterNavigate(() => {
    onView = page.params.slug ?? first;
    show(onView);
  });

  // Brings an item's text into view, from its beginning: at once when the
  // column has just appeared, smoothly when it was already there
  function show(slug: string) {
    const item = texts?.querySelector<HTMLElement>(`[data-slug="${slug}"]`);
    if (!texts || !item) return;
    const top = item.offsetTop;
    item.scrollTop = 0; // a long text read halfway before
    const smooth = texts === placed && !still();
    placed = texts;
    if (!smooth) return void (texts.scrollTop = top);
    steering = true;
    texts.scrollTo({top, behavior: 'smooth'});
  }

  // A long text that has left the screen goes back to its beginning, so
  // coming back to it always shows its title, as with the others
  $effect(() => {
    if (!texts) return;
    const gone = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (!entry.isIntersecting) entry.target.scrollTop = 0;
      },
      // 1px in: a text just touching the edge, next to the one on view, is gone
      {root: texts, rootMargin: '-1px 0px'}
    );
    for (const item of texts.children) gone.observe(item);
    return () => gone.disconnect();
  });

  // Scrolling by hand: the text nearest to the top is the one on view;
  // once the scrolling has stopped, the address follows
  let frame = 0;
  let settle: ReturnType<typeof setTimeout>;
  function onscroll() {
    clearTimeout(settle);
    settle = setTimeout(arrived, 150);
    if (steering || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const items = [...(texts?.children ?? [])] as HTMLElement[];
      const top = texts?.scrollTop ?? 0;
      const nearest = items.reduce((a, b) =>
        Math.abs(b.offsetTop - top) < Math.abs(a.offsetTop - top) ? b : a
      );
      onView = nearest?.dataset.slug ?? onView;
    });
  }
  function arrived() {
    steering = false;
    const path = `/events/${onView}/`;
    if (!onView || location.pathname === path) return;
    replaceState(path, page.state);
    document.title = pageTitle(posts.find((x) => x.slug === onView)?.title); // as the address
  }
</script>

<Panel area="band" inset class="on-band from-top">
  <ul class="news" class:has-item={page.params.slug} class:is-list={!page.params.slug}>
    {#each posts as post, i (post.slug)}
      <li
        class="entry stretched hover fade"
        class:active={post.slug === onView}
        style:--i={i}
        out:leave|global
      >
        <p class="label">
          <span>{post.kind}</span>
          <time datetime={post.date}>{monthYear(post.date)}</time>
        </p>
        <!-- The title is the link; it is stretched over the whole entry.
             The date sits outside the link so it can keep its own colour
             (see LINKS in styles.css) -->
        <a href="/events/{post.slug}/">{post.title}</a>
      </li>
    {/each}
  </ul>
</Panel>

<Panel area="rest" class="on-ground from-top">
  <div
    class="texts fade"
    class:is-list={!page.params.slug}
    class:next={untrack(() => live)}
    style:--text-cols={TEXT_COLUMNS}
    bind:this={texts}
    {onscroll}
    out:leave|global
  >
    {#each posts as post (post.slug)}
      <NewsText {post} />
    {/each}
  </div>
</Panel>

{@render children()}

<style>
  .news {
    width: 100%;
    display: grid;
    gap: calc(3 * var(--u));
  }
  /* Category from column 3, date from column 6 */
  .label {
    display: grid;
    grid-template-columns: calc(3 * var(--col)) auto;
  }
  time {
    color: var(--ink-quiet);
    transition: opacity var(--hover);
  }
  @media (hover: hover) {
    .entry:not(:hover, :focus-within) time {
      opacity: 0;
    }
  }
  /* Mobile: the grid columns are too narrow; a fixed width that clears
     the longest category ("Open call"), as the other mobile tables do */
  @media (max-width: 767px) {
    .label {
      grid-template-columns: calc(12 * var(--u)) auto;
    }
    .has-item {
      display: none; /* the news texts take the column */
    }
    /* On /events/ the list only: no text open, no entry selected */
    .texts.is-list {
      display: none;
    }
    .is-list .entry.active {
      --lit: 0;
    }
  }
  a {
    display: block;
    font: var(--type-text);
  }
  /* The texts: each as tall as the column, snapping to its top */
  .texts {
    position: relative; /* the items' offsetTop is measured from here */
    width: 100%;
    height: 100%;
    scroll-snap-type: y mandatory;
  }

</style>
