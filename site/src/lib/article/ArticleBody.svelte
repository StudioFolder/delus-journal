<!--
  The text of a contribution (an "article"): its blocks, one line of
  space apart, whatever the type (pieces: Inlines.svelte).
  - A paragraph: in the reading type (--type-reading, 24/32 Louize), with
    italics and acronyms in small capitals; a line break typed in it (a
    new line without space, as in the printed issue) is kept.
  - A quote (Sanity: the Quote style): in Styrene B, optically the same
    size, on the same line (--type-quote), indented three columns, as in
    the Figma layout; line breaks typed in it (verse) are kept.
  - A chapter title (Sanity: the Heading style): the quote's type in
    small capitals (Styrene B has them), centred, 8 columns wide (half
    the text), so a long one takes two lines; two lines of space above
    it, one below.
  Where it sits on the page is up to the page.
-->
<script lang="ts">
  import Inlines from './Inlines.svelte';
  import type {Block} from '#lib/data/fixtures.ts';

  let {blocks}: {blocks: Block[]} = $props();
</script>

<div class="body">
  {#each blocks as block, i (i)}
    {#if typeof block === 'string' || Array.isArray(block)}
      <p><Inlines parts={block} /></p>
    {:else if 'quote' in block}
      <blockquote><Inlines parts={block.quote} sc={false} /></blockquote>
    {:else}
      <h2>{block.heading}</h2>
    {/if}
  {/each}
</div>

<style>
  .body {
    display: grid;
    gap: 1lh; /* one line, whatever the type */
    font: var(--type-reading);
    letter-spacing: 0.02em; /* as .display */
  }
  p {
    white-space: pre-line;
  }
  blockquote {
    margin: 0;
    padding-left: calc(3 * var(--col));
    font: var(--type-quote);
    letter-spacing: 0.02em;
    white-space: pre-line;
  }
  /* A chapter title (Sanity: the Heading style): the quote's type in
     small capitals (Styrene B's own), centred on the text and half as
     wide (8 columns), so a long title takes two lines; two lines of
     space above it, one line below, before the chapter starts */
  h2 {
    width: calc(8 * var(--col));
    justify-self: center;
    margin: calc(4 * var(--u)) 0 0;
    font: var(--type-quote);
    font-variant-caps: all-small-caps;
    letter-spacing: 0.02em;
    text-align: center;
  }
  /* Mobile: the grid columns are too narrow, a fixed indent instead */
  @media (max-width: 767px) {
    blockquote {
      padding-left: calc(3 * var(--u));
    }
    h2 {
      width: auto; /* the text's width: 8 columns are too few here */
    }
  }
</style>
