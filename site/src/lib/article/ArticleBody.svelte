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
  - A figure (ArticleFigure; Sanity: an image between two paragraphs):
    it stands after the paragraph that refers to it. On desktop it is a
    miniature in the margin to the right of the text, its top level with
    the line where the text names it — (FIG. A) — or, if the text before
    it doesn't, with the start of that paragraph; a figure that would
    touch the one before it moves down, one line after it.
  - The notes (ArticleNotes): on mobile, one list after the text. On
    desktop they are not here but on the band, each one only while its
    number is on the screen: this component tells the page which numbers
    are on view (`onview`).
  Where it sits on the page is up to the page.
-->
<script lang="ts">
  import {onMount, tick} from 'svelte';
  import Inlines from './Inlines.svelte';
  import ArticleFigure from './ArticleFigure.svelte';
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

  // FIGURES IN THE MARGIN — how far down each one goes (ArticleFigure
  // does the rest): level with the line that names it, and never on the
  // figure before it. `tops[i]`: for the block i, when it is a figure.
  let tops = $state<(number | undefined)[]>([]);

  // Where the text of a block names a figure — "(FIG. A)", "(FIG. H, C)":
  // how far down that line is, from the start of the block
  function lineOf(block: Element, label: string) {
    const text = block.textContent ?? '';
    const named = [...text.matchAll(/\(FIGS?\.[^)]*\)/g)].find((m) =>
      new RegExp(`\\b${label}\\b`).test(m[0].slice(4))
    );
    if (!named) return 0;
    let at = named.index;
    const nodes = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let node = nodes.nextNode();
    while (node && at >= node.textContent!.length) {
      at -= node.textContent!.length;
      node = nodes.nextNode();
    }
    if (!node) return 0;
    const range = document.createRange();
    range.setStart(node, at);
    range.setEnd(node, at + 1);
    const r = range.getBoundingClientRect();
    const line = parseFloat(getComputedStyle(block).lineHeight);
    return Math.floor((r.top + r.height / 2 - block.getBoundingClientRect().top) / line) * line;
  }

  async function place() {
    const figures = [...body.querySelectorAll<HTMLElement>('.figure')];
    if (!figures.length) return;
    const indexes = blocks.flatMap((b, i) => (typeof b === 'object' && 'figure' in b ? [i] : []));
    // First out of the text's column, so that the text takes its final place
    if (tops.length === 0) {
      const none: (number | undefined)[] = [];
      for (const i of indexes) none[i] = 0;
      tops = none;
      await tick();
    }
    if (getComputedStyle(figures[0]).position !== 'absolute') return; // in the column (mobile)
    const start = body.getBoundingClientRect().top;
    const gap = parseFloat(getComputedStyle(body).rowGap) || 0; // one line
    const unit = parseFloat(getComputedStyle(figures[0]).rowGap) || 0;
    const next: (number | undefined)[] = [];
    let free = 0; // where the figure before ends
    for (const [n, el] of figures.entries()) {
      let block = el.previousElementSibling;
      while (block?.classList.contains('figure')) block = block.previousElementSibling;
      let top = free;
      if (block) {
        const label = (blocks[indexes[n]] as {figure: {label: string}}).figure.label;
        // one unit under the top of the line: about where its letters start
        top = Math.max(free, block.getBoundingClientRect().top - start + lineOf(block, label) + unit);
      }
      next[indexes[n]] = top;
      free = top + el.offsetHeight + gap;
    }
    tops = next;
  }

  onMount(() => {
    place();
    const watch = new ResizeObserver(place);
    watch.observe(body);
    document.fonts?.ready.then(place);
    return () => watch.disconnect();
  });
</script>

<div class="body" bind:this={body}>
  {#each blocks as block, i (i)}
    {#if typeof block === 'string' || Array.isArray(block)}
      <p><Inlines parts={block} /></p>
    {:else if 'quote' in block}
      <blockquote><Inlines parts={block.quote} sc={false} /></blockquote>
    {:else if 'figure' in block}
      <ArticleFigure figure={block.figure} top={tops[i]} />
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
    position: relative; /* the figures in the margin are placed from here */
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
