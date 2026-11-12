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
  - The notes (ArticleNotes): on mobile, one list after the text. On
    desktop they are not here but on the band, each one only while its
    number is on the screen: this component tells the page which numbers
    are on view (`onview`).
  Where it sits on the page is up to the page.
-->
<script lang="ts">
  import {onMount} from 'svelte';
  import Inlines from './Inlines.svelte';
  import ArticleNotes from './ArticleNotes.svelte';
  import type {Block, Inline} from '#lib/data/fixtures.ts';

  type Props = {
    blocks: Block[];
    notes?: Inline[][];
    onview?: (numbers: number[]) => void; // the note numbers on the screen, in order
  };
  let {blocks, notes = [], onview}: Props = $props();

  // Which note numbers are on the screen: told to the page at every change
  let body: HTMLElement;
  onMount(() => {
    const seen = new Set<number>();
    const watch = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const n = Number((e.target as HTMLElement).dataset.note);
        if (e.isIntersecting) seen.add(n);
        else seen.delete(n);
      }
      onview?.([...seen].sort((a, b) => a - b));
    });
    for (const ref of body.querySelectorAll('.ref')) watch.observe(ref);
    return () => watch.disconnect();
  });
</script>

<div class="body" bind:this={body}>
  {#each blocks as block, i (i)}
    {#if typeof block === 'string' || Array.isArray(block)}
      <p><Inlines parts={block} /></p>
    {:else if 'quote' in block}
      <blockquote><Inlines parts={block.quote} sc={false} /></blockquote>
    {:else}
      <h2>{block.heading}</h2>
    {/if}
  {/each}
  {#if notes.length}
    <div class="end"><ArticleNotes {notes} /></div>
  {/if}
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
  /* The notes after the text: on mobile only (desktop: on the band),
     two lines of space above them */
  .end {
    display: none;
  }
  /* Mobile: the grid columns are too narrow, a fixed indent instead */
  @media (max-width: 767px) {
    blockquote {
      padding-left: calc(3 * var(--u));
    }
    h2 {
      width: auto; /* the text's width: 8 columns are too few here */
    }
    .end {
      display: block;
      margin-top: calc(4 * var(--u));
    }
  }
</style>
