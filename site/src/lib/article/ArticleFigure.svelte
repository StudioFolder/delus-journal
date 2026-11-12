<!--
  A figure of an article — for now an empty box in its proportions (as
  every image on the site) and its caption: the letter the text refers
  to (FIG. A) in the small Styrene, full ink, then the caption in the
  notes' type (--type-note), quiet, its text starting 3 units in — as a
  note. The letter is always there; where a pointer can hover, the text
  of the caption shows only while the pointer is on the figure (or the
  keyboard is): it appears word by word, as the statement on the home
  page but twice as fast (--word-time, --word-step, halved), and goes
  all at once, softly, as
  every hover effect. Its place under the box is kept, so nothing moves.
  On touch screens it is always there.
  - In the text's column (mobile; and before the page has placed it): it
    follows the paragraph that refers to it, half the text wide.
  - `top` given (desktop, by ArticleBody): a miniature in the margin to
    the right of the text — one column after it, 4 columns wide — that
    far down from the start of the text.
-->
<script lang="ts">
  import Acronyms from '#lib/type/Acronyms.svelte';
  import type {Figure} from '#lib/data/fixtures.ts';

  let {figure, top}: {figure: Figure; top?: number} = $props();

  // The caption word by word: each word (or the space between two), with
  // its italics and its place in the cascade
  const words = $derived.by(() => {
    let n = 0;
    return figure.caption.flatMap((part) => {
      if (typeof part !== 'string' && !('em' in part)) return [];
      const em = typeof part !== 'string';
      return (em ? part.em : part)
        .split(/(\s+)/)
        .filter(Boolean)
        .map((text) => (text.trim() ? {text, em, n: n++} : {text: ' ', em, n: -1}));
    });
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<figure
  class="figure"
  class:placed={top !== undefined}
  style:top={top === undefined ? null : `${top}px`}
  tabindex="0"
>
  <div class="image" role="img" aria-label="Figure {figure.label}" style:aspect-ratio={figure.ratio}></div>
  <figcaption>
    <span class="n">{figure.label}</span>{#each words as word, i (i)}{#if word.n < 0}{' '}{:else}<span
          class="word"
          class:em={word.em}
          style:--n={word.n}
          >{#if word.text.length > 1}<Acronyms text={word.text} />{:else}{word.text}{/if}</span
        >{/if}{/each}
  </figcaption>
</figure>

<style>
  .figure {
    margin: 0;
    width: 50%;
    display: grid;
    gap: var(--u);
  }
  .image {
    background: var(--band);
  }
  figcaption {
    font: var(--type-note);
    letter-spacing: normal;
    color: var(--ink-quiet);
  }
  .em {
    font-style: italic;
  }
  .n {
    display: inline-block;
    width: calc(3 * var(--u)); /* as a note's number */
    font: var(--type-ui);
    color: var(--ink);
  }
  @media (hover: hover) {
    .word {
      opacity: 0;
      transition: opacity var(--hover);
    }
    .figure:hover .word,
    .figure:focus-visible .word {
      opacity: 1;
      /* twice as fast as the home statement */
      transition: opacity calc(var(--word-time) / 2) ease-in-out calc(var(--n) * var(--word-step) / 2);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .figure .word {
      transition-delay: 0s;
    }
  }
  @media (min-width: 768px) {
    .placed {
      position: absolute;
      left: calc(100% + var(--col));
      width: calc(4 * var(--col));
    }
  }
</style>
