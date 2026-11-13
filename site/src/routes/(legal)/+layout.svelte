<!--
  Imprint and Privacy — reached from the footer (in the root layout the
  tagline gives way to their links under the pointer). Laid out as News
  (events/+layout.svelte): the two titles on the band, and both texts in
  the space to the right, one below the other, each as tall as the
  screen and snapping to it; scrolling from one to the other moves the
  selection in the list and, once stopped, the address. Clicking a title
  scrolls to its text. Shared by /imprint/ and /privacy/ (a route group:
  the URLs carry no section name), so nothing reloads between them.
  The band for these URLs is set in #lib/grid/layouts.ts.

  MOBILE — as a news item open: the texts take the column, the list is
  not shown.
-->
<script lang="ts">
  import {page} from '$app/state';
  import {afterNavigate, replaceState} from '$app/navigation';
  import Panel from '#lib/grid/Panel.svelte';
  import {TEXT_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {legal} from '#lib/data/fixtures.ts';
  import LegalText from './LegalText.svelte';

  let {children} = $props();

  // The text on view: set by navigation and by scrolling the texts
  const here = () => page.url.pathname.split('/').filter(Boolean)[0];
  let onView = $state(here());

  let texts = $state<HTMLElement>(); // the scrolling column of texts
  let placed: HTMLElement | undefined; // the column already scrolled into place once
  let steering = false; // true while the column scrolls to a clicked item

  afterNavigate(() => {
    onView = here();
    show(onView);
  });

  // Brings a text into view, from its beginning: at once when the column
  // has just appeared, smoothly when it was already there
  function show(slug: string) {
    const item = texts?.querySelector<HTMLElement>(`[data-slug="${slug}"]`);
    if (!texts || !item) return;
    const top = item.offsetTop;
    item.scrollTop = 0;
    const smooth =
      texts === placed && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    placed = texts;
    if (!smooth) return void (texts.scrollTop = top);
    steering = true;
    texts.scrollTo({top, behavior: 'smooth'});
  }

  // A long text that has left the screen goes back to its beginning
  $effect(() => {
    if (!texts) return;
    const gone = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (!entry.isIntersecting) entry.target.scrollTop = 0;
      },
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
    const path = `/${onView}/`;
    if (onView && location.pathname !== path) replaceState(path, page.state);
  }
</script>

<Panel area="band" inset class="on-band from-top">
  <ul class="list">
    {#each legal as text, i (text.slug)}
      <li
        class="entry stretched hover fade"
        class:active={text.slug === onView}
        style:--i={i}
        out:leave|global
      >
        <a href="/{text.slug}/">{text.title}</a>
      </li>
    {/each}
  </ul>
</Panel>

<Panel area="rest" class="on-ground from-top">
  <div class="texts fade" style:--text-cols={TEXT_COLUMNS} bind:this={texts} {onscroll} out:leave|global>
    {#each legal as text (text.slug)}
      <LegalText {text} />
    {/each}
  </div>
</Panel>

{@render children()}

<style>
  .list {
    width: 100%;
    display: grid;
    gap: calc(3 * var(--u));
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
  @media (max-width: 767px) {
    .list {
      display: none; /* the texts take the column */
    }
  }
</style>
