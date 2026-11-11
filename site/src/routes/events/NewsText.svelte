<!--
  One news text, in the column of texts (+layout.svelte): a page as tall
  as the screen, snapping to its top, so the next text begins just out of
  sight. The text starts at the height of the list (--edge from the top)
  and is 18 columns wide (--text-cols), one column after the band; the
  page takes the whole width, so scrolling works anywhere on it.
  - LONG TEXTS scroll inside their page, like a normal page, and end with
    12 units of space after the last line (as the space above). Once at
    the end, the next scroll gesture moves the column to the next text.
    (A single snap item taller than the screen would do the same in
    Chrome, but Safari jumps over its middle.)
  - the date (12.11.2026) in small capitals, quiet, above the title, as the
    issue number above an abstract; title and text in the display type;
    one line (4 units) between blocks;
  - IMAGE — the first image, under the title, centred on the text, with two
    lines below it. It fits a square box half as wide as the text: a
    horizontal image takes the box's width, a vertical one its height, so
    both weigh about the same. For now an empty frame in its proportions.
-->
<script lang="ts">
  import type {Post} from '#lib/data/fixtures.ts';
  import {fullDate} from '#lib/data/format.ts';
  import Acronyms from '#lib/type/Acronyms.svelte';

  let {post}: {post: Post} = $props();
  const image = $derived(post.images?.[0]);
</script>

<article data-slug={post.slug}>
  <header class="labelled">
    <time class="label" datetime={post.date}>{fullDate(post.date)}</time>
    <h2 class="display"><Acronyms text={post.title} /></h2>
  </header>
  {#if image}
    <div class="image" role="img" aria-label="Image" style:--ratio={image.width / image.height}></div>
  {/if}
  {#each post.body ?? [] as paragraph, i (i)}
    <p class="display"><Acronyms text={paragraph} /></p>
  {/each}
</article>

<style>
  article {
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    scroll-snap-align: start;
    scroll-snap-stop: always; /* one item per scroll gesture */
    padding: var(--edge) 0 calc(12 * var(--u)) var(--col);
    display: grid;
    grid-template-columns: calc(var(--text-cols) * var(--col));
    align-content: start;
    gap: calc(4 * var(--u));
  }
  time {
    color: var(--ink-quiet);
  }
  h2 {
    margin: 0;
    font-weight: inherit;
  }
  /* Inside a square box half the text's width: the width is the box's for
     a horizontal image, less for a vertical one (--ratio = width / height) */
  .image {
    justify-self: center;
    width: calc(50% * min(1, var(--ratio)));
    aspect-ratio: var(--ratio);
    margin-bottom: calc(4 * var(--u)); /* two lines in all before the text */
    background: var(--band);
  }

  @media (max-width: 767px) {
    article {
      padding-left: 0;
      grid-template-columns: 100%;
    }
  }
</style>
