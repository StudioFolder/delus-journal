<!--
  A figure of an article — for now an empty box in its proportions (as
  every image on the site) and its caption: the letter the text refers
  to (FIG. A) in the small Styrene, full ink, then the caption in the
  notes' type (--type-note), quiet, its text starting 3 units in — as a
  note. A figure the text doesn't refer to has no letter: its caption
  starts at the left. The letter is always there; where a pointer can hover, the text
  of the caption shows only while the pointer is on the figure (or the
  keyboard is): it appears word by word, as the statement on the home
  page but twice as fast (--word-time, --word-step, halved), and goes
  all at once, softly, as every hover effect. Its place under the box is
  kept, so nothing moves. Under the pointer the box also stands out a
  little more from the background (see the styles).
  On touch screens it is always there.
  The box is a button: a click on it asks the page to show the figure
  large (`onopen`; ArticleLightbox); on it the pointer becomes the word
  Open (use:word, #lib/pointer).
  - In the text's column (mobile; and before the page has placed it): it
    follows the paragraph that refers to it, half the text wide; on
    phones the image two thirds of the column wide, centred, its caption
    as wide as the column, two units under it.
  - Between the two (768–1199px) it is not shown, for now.
  - `top` given (desktop, by ArticleBody): a miniature in the margin to
    the right of the text — one column after it, 4 columns wide — that
    far down from the start of the text.
  - `photo` (a photo essay; ArticleBody puts each one in a cell of its
    grid): as large as fits in its cell, without its caption. On phones
    as wide as the text — or less, so that the whole image fits the
    height of the screen (12 units kept free above and below) —, its
    caption, if it has one, always there.
  - `covered`: the miniature of a linked article lies on it for a moment
    (ArticleBody): it fades out, softly, and comes back after.
-->
<script lang="ts">
  import Acronyms from '#lib/type/Acronyms.svelte';
  import {word} from '#lib/pointer/word.svelte.ts';
  import type {Figure} from '#lib/data/fixtures.ts';

  let {
    figure,
    id,
    top,
    covered = false,
    photo = false,
    onopen
  }: {figure: Figure; id: number; top?: number; photo?: boolean; covered?: boolean; onopen?: (miniature: HTMLElement) => void} = $props();

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
  class:covered
  class:photo
  style:--ratio={figure.ratio}
  style:top={top === undefined ? null : `${top}px`}
  data-figure={id}
>
  <button
    type="button"
    class="image"
    aria-label={figure.label ? `Figure ${figure.label}: see it larger` : 'See the image larger'}
    style:aspect-ratio={figure.ratio}
    use:word={'Open'}
    onclick={(e) => {
      // a click leaves no focus behind (it would keep the caption shown); the keyboard keeps its place
      if (e.detail) e.currentTarget.blur();
      onopen?.(e.currentTarget);
    }}
  ></button>
  {#if figure.label || words.length}
  <figcaption>
    {#if figure.label}<span class="n">{figure.label}</span>{/if}{#each words as word, i (i)}{#if word.n < 0}{' '}{:else}<span
          class="word"
          class:em={word.em}
          style:--n={word.n}
          >{#if acronym.test(word.text)}<Acronyms text={word.text} />{:else}{word.text}{/if}</span
        >{/if}{/each}
  </figcaption>
  {/if}
</figure>

<style>
  .figure {
    margin: 0;
    width: 50%;
    display: grid;
    gap: var(--u);
  }
  /* A photo essay's image (see `photo` above): on phones large, in the
     column; from Narrow up in its cell of the grid, which is measured
     (container units) */
  .photo {
    width: min(100%, (100vh - 24 * var(--u)) * var(--ratio));
  }
  @media (min-width: 768px) {
    .photo {
      width: min(100cqw, 100cqh * var(--ratio));
    }
    .photo figcaption {
      display: none;
    }
  }
  .image {
    display: block;
    width: 100%;
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * var(--lit-tint)), var(--band));
  }
  /* Phone: the figure as wide as the column (its caption too, two units
     under the image); the image centred in it, at its own width (two
     thirds of the text, or a photo essay's) */
  @media (max-width: 767px) {
    .figure,
    .figure.photo {
      width: 100%;
      gap: calc(2 * var(--u));
    }
    .image {
      width: calc(100% * 2 / 3);
      margin-inline: auto;
    }
    .photo .image {
      width: min(100%, (100vh - 24 * var(--u)) * var(--ratio));
    }
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
    .photo .word {
      opacity: 1;
      transition: none;
    }
    .figure:not(.photo):hover .word,
    .figure:not(.photo) .image:focus-visible + figcaption .word {
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
  /* Narrow (768–1199px): the text takes the margin's place; no figures
     for now (see the article's page) */
  @media (min-width: 768px) and (max-width: 1199px) {
    .figure:not(.photo) {
      display: none;
    }
  }
  @media (min-width: 768px) {
    .placed {
      position: absolute;
      left: calc(100% + var(--col));
      width: calc(4 * var(--col));
      transition: opacity var(--hover);
    }
    .placed.covered {
      opacity: 0;
    }
  }
</style>
