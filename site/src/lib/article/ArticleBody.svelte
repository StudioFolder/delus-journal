<!--
  The text of a contribution (an "article"): its blocks, one line of
  space apart, whatever the type.
  - A paragraph: in the large type (as the news texts and the About text,
    beside the band), with acronyms in small capitals.
  - A quote (Sanity: the Quote style): in Styrene B at the same size and
    line (--type-title, as the title), indented three columns, as in the
    Figma layout; line breaks typed in it (verse) are kept.
  Where it sits on the page is up to the page.
-->
<script lang="ts">
  import Acronyms from '#lib/type/Acronyms.svelte';
  import type {Block} from '#lib/data/fixtures.ts';

  let {blocks}: {blocks: Block[]} = $props();
</script>

<div class="body display">
  {#each blocks as block, i (i)}
    {#if typeof block === 'string'}
      <p><Acronyms text={block} /></p>
    {:else}
      <blockquote>{block.quote}</blockquote>
    {/if}
  {/each}
</div>

<style>
  .body {
    display: grid;
    gap: 1lh; /* one line, whatever the type */
  }
  blockquote {
    margin: 0;
    padding-left: calc(3 * var(--col));
    font: var(--type-title);
    letter-spacing: 0.02em;
    white-space: pre-line;
  }
  /* Mobile: the grid columns are too narrow, a fixed indent instead */
  @media (max-width: 767px) {
    blockquote {
      padding-left: calc(3 * var(--u));
    }
  }
</style>
