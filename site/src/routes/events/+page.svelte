<!--
  News: the list of all news, newest first, on the band under the menu.
  The band for this URL is set in #lib/grid/layouts.ts.

  Each entry is two lines: category and date in small capitals, then the
  title. Entries are quiet and turn to full ink under the pointer (the
  date stays quiet). The whole entry is the link.
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {posts} from '#lib/data/fixtures.ts';

  // '2026-08' → 'August 2026'
  const monthYear = (date: string) =>
    new Date(`${date}-01`).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
</script>

<Panel area="band" inset class="on-band from-top">
  <ul class="news">
    {#each posts as post, i (post.slug)}
      <li class="entry hover fade" style:--i={i} out:leave|global>
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

<style>
  .news {
    width: 100%;
    display: grid;
    gap: calc(3 * var(--u));
  }
  .entry {
    position: relative;
  }
  .label {
    display: flex;
    gap: calc(2 * var(--u));
  }
  time {
    color: var(--ink-quiet);
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
