<!--
  A note opened in the text, on phones (ArticleBody puts it right under
  the line where its number is, inside the paragraph or quote): the
  notes' type, quiet, its number first and its text 3 units in, as on
  the band (ArticleNotes). Its words come in one after another, as a
  figure's caption on desktop (ArticleFigure): twice as fast as the home
  statement. A link comes as one piece. Words alone can't tell an
  article from a letter, so only those with two capitals in a row go in
  small capitals. A tap on it closes it (`onclose`).
  It is made of spans only: it lies inside a paragraph.
-->
<script lang="ts">
  import Acronyms from '#lib/type/Acronyms.svelte';
  import {opens} from '#lib/type/links.ts';
  import type {Inline} from '#lib/data/fixtures.ts';

  let {n, note, onclose}: {n: number; note: Inline[]; onclose: () => void} = $props();

  const acronym = /\p{Lu}{2,}/u;
  // each word with its italics or link, and its place in the cascade (-1: a space)
  type Word = {text: string; href?: string; em: boolean; i: number};
  const words = $derived.by(() => {
    let i = 0;
    return note.flatMap<Word>((part) => {
      if (typeof part !== 'string' && 'link' in part) return [{text: part.link, href: part.href, em: false, i: i++}];
      if (typeof part !== 'string' && !('em' in part)) return [];
      const em = typeof part !== 'string';
      return (em ? part.em : part)
        .split(/(\s+)/)
        .filter(Boolean)
        .map((text) => (text.trim() ? {text, em, i: i++} : {text: ' ', em, i: -1}));
    });
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<span class="note" onclick={(e) => !(e.target as Element).closest('a') && onclose()}
  ><span class="n">{n}</span>{#each words as word, w (w)}{#if word.i < 0}{' '}{:else if word.href}<span class="word underlined" style:--i={word.i}
        ><a href={word.href} {...opens(word.href)}>{word.text}</a></span
      >{:else}<span class="word" class:em={word.em} style:--i={word.i}
        >{#if acronym.test(word.text)}<Acronyms text={word.text} />{:else}{word.text}{/if}</span
      >{/if}{/each}</span
>

<style>
  /* One unit under its line, two above the text that goes on */
  .note {
    display: block;
    padding: var(--u) 0 calc(2 * var(--u));
    font: var(--type-note);
    font-style: normal;
    letter-spacing: normal;
    white-space: normal;
    color: var(--ink-quiet);
    cursor: pointer;
  }
  .n {
    display: inline-block;
    width: calc(3 * var(--u)); /* the note's text starts here, as after a tab */
    font: var(--type-ui);
    color: var(--ink);
  }
  .em {
    font-style: italic;
  }
  .word {
    animation: word-in calc(var(--word-time) / 2) ease-in-out calc(var(--i) * var(--word-step) / 2) both;
  }
  @keyframes word-in {
    from {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .word {
      animation: none;
    }
  }
</style>
