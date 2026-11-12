<!--
  A figure of an article — for now an empty box in its proportions (as
  every image on the site) and its caption: the letter the text refers
  to (FIG. A) in the small Styrene, full ink, then the caption in the
  notes' type (--type-note), quiet, its text starting 3 units in — as a
  note. The letter is always there; where a pointer can hover, the text
  of the caption shows only while the pointer is on the figure (or the
  keyboard is): it appears word by word, as the statement on the home
  page but twice as fast (--word-time, --word-step, halved), and goes
  all at once, softly, as every hover effect. Its place under the box is
  kept, so nothing moves. Under the pointer the box also stands out a
  little more from the background (see the styles).
  On touch screens it is always there.
  The box is a button: a click on it asks the page to show the figure
  large (`onopen`; ArticleLightbox).
  - In the text's column (mobile; and before the page has placed it): it
    follows the paragraph that refers to it, half the text wide.
  - `top` given (desktop, by ArticleBody): a miniature in the margin to
    the right of the text — one column after it, 4 columns wide — that
    far down from the start of the text.
-->
<script lang="ts">
  import Acronyms from '#lib/type/Acronyms.svelte';
  import type {Figure} from '#lib/data/fixtures.ts';

  let {figure, top, onopen}: {figure: Figure; top?: number; onopen?: (miniature: HTMLElement) => void} = $props();

  // A word on its own can't tell an article from a letter ("A Mapp"), so
  // only words with two capitals in a row go in small capitals (RA, UK)
  const acronym = /\p{Lu}{2,}/u;

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

<figure
  class="figure"
  class:placed={top !== undefined}
  style:top={top === undefined ? null : `${top}px`}
  data-figure={figure.label}
>
  <button
    type="button"
    class="image"
    aria-label="Figure {figure.label}: see it larger"
    style:aspect-ratio={figure.ratio}
    onclick={(e) => {
      // a click leaves no focus behind (it would keep the caption shown); the keyboard keeps its place
      if (e.detail) e.currentTarget.blur();
      onopen?.(e.currentTarget);
    }}
  ></button>
  <figcaption>
    <span class="n">{figure.label}</span>{#each words as word, i (i)}{#if word.n < 0}{' '}{:else}<span
          class="word"
          class:em={word.em}
          style:--n={word.n}
          >{#if acronym.test(word.text)}<Acronyms text={word.text} />{:else}{word.text}{/if}</span
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
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * 6%), var(--band));
    cursor: zoom-in;
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
    /* Under the pointer the box stands out a little more from the
       background, softly: a touch of the ink colour (--lit, as .hover) —
       lighter in the dark tone, darker in the light one. (A brightness
       filter made the box vanish into the light background; for the
       real images it will be the right tool again.) */
    .image {
      transition: --lit var(--hover);
    }
    .figure:hover .image,
    .image:focus-visible {
      --lit: 1;
    }
    .word {
      opacity: 0;
      transition: opacity var(--hover);
    }
    .figure:hover .word,
    .image:focus-visible + figcaption .word {
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
