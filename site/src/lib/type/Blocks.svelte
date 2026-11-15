<!--
  A text in blocks, as Sanity's rich text (fixtures.ts: `NewsBlock`), in
  the large type: a news text (events/NewsText.svelte) and the About text
  — one look for both (Marco, 15 Nov). All in Louize but the headings:
  - a paragraph (italics, links underlined, acronyms in small capitals);
  - a quote: indented as in an essay (3 columns; 3 units on Phone);
  - a heading: in small capitals, quiet, 2 units over what follows (as the
    sections of Imprint and Privacy);
  - a list: one item per line, each after an en dash, quiet, its text 3
    units in (wrapped lines too) — as a note's text after its number.
  The blocks are placed by what holds them (a grid, one line — 4 units —
  between blocks).
-->
<script lang="ts">
  import type {NewsBlock} from '#lib/data/fixtures.ts';
  import Inlines from '#lib/article/Inlines.svelte';

  let {blocks}: {blocks: NewsBlock[]} = $props();
</script>

{#each blocks as block, i (i)}
  {#if typeof block === 'object' && 'quote' in block}
    <blockquote class="display"><Inlines parts={block.quote} /></blockquote>
  {:else if typeof block === 'object' && 'heading' in block}
    <h3 class="label">{block.heading}</h3>
  {:else if typeof block === 'object' && 'list' in block}
    <ul class="display">
      {#each block.list as item, j (j)}
        <li><Inlines parts={item} /></li>
      {/each}
    </ul>
  {:else}
    <p class="display"><Inlines parts={block} /></p>
  {/if}
{/each}

<style>
  /* A heading: 2 units over what follows (as a label over its text) */
  h3 {
    margin: 0 0 calc(-2 * var(--u));
    font-weight: inherit;
    color: var(--ink-quiet);
  }
  /* A quote: indented as in an essay (ArticleBody), in the text's type */
  blockquote {
    margin: 0;
    padding-left: calc(3 * var(--col));
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    position: relative;
    padding-left: calc(3 * var(--u));
  }
  li::before {
    content: '–';
    position: absolute;
    left: 0;
    color: var(--ink-quiet);
  }

  @media (max-width: 767px) {
    blockquote {
      padding-left: calc(3 * var(--u));
    }
  }
</style>
