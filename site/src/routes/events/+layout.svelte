<!--
  News: the list of all news, newest first, on the band under the menu.
  It lives in this layout, shared by the list (/events/) and each news
  item (/events/[slug]/), so it stays in place while a news text opens
  in the space to the right; the entry on view is in full ink.
  The band for these URLs is set in #lib/grid/layouts.ts.

  Each entry is two lines: category and date in small capitals, then the
  title. Entries are quiet and turn to full ink under the pointer. The
  date (11.2026) appears only then, quiet, from column 6, so all the
  dates line up whatever the category; on touch screens, which have no
  pointer to hover with, it is always shown. The whole entry is the link.
-->
<script lang="ts">
  import {onMount, setContext} from 'svelte';
  import {page} from '$app/state';
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {posts} from '#lib/data/fixtures.ts';
  import {monthYear} from '#lib/data/format.ts';

  let {children} = $props();

  // Whether the list was already on view: then a news text opening is
  // only replacing what was on the right, not arriving with a new page
  let live = false;
  onMount(() => void (live = true));
  setContext('news:live', () => live);
</script>

<Panel area="band" inset class="on-band from-top">
  <ul class="news" class:has-item={page.params.slug}>
    {#each posts as post, i (post.slug)}
      <li
        class="entry hover fade"
        class:active={post.slug === page.params.slug}
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

{@render children()}

<style>
  .news {
    width: 100%;
    display: grid;
    gap: calc(3 * var(--u));
  }
  .entry {
    position: relative;
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
      display: none; /* the news text takes the column */
    }
  }
  a {
    display: block;
    font: var(--type-text);
  }
  a::after {
    content: '';
    position: absolute;
    inset: 0;
  }
</style>
