<!--
  SEARCH — the words found, on the page they were found in.

  A result of the search leads to its article with the words in the
  address (…/not-a-drop-is-lost/?q=tomato). Put <Found /> on the page:
  it looks for them in the article's title and main text — the
  abstract, the paragraphs, quotes and chapter titles; not the notes,
  nor the captions —, as the search does (where a word begins, whatever the
  capitals and accents: find.ts), brings the first one on view, a third
  of the way down the screen (if it isn't on view already), and marks
  them all as a highlighter would: a soft box behind each word, half a
  unit wider on both sides (the band's colour; in the dark tone, where
  that is too close to the background, a lighter grey: three tenths of
  ink). A click on the page — the space of the text; not the band, nor
  the tone switch — and the boxes fade out.

  The boxes are drawn behind the text, in a layer of their own that
  this component puts in the article (which scrolls) and takes away
  with itself: nothing in the text is touched, so the notes, the small
  capitals and the figures are not disturbed. They are measured on the
  words, and again whenever the text changes size.
-->
<script lang="ts">
  import {onMount} from 'svelte';
  import {time} from '#lib/motion/time.ts';
  import {placesOf, wordsOf} from './find.ts';

  // What is looked through, inside the article
  const BLOCKS = 'h1, .abstract, .body [data-block], .body h2';

  type Box = {left: number; top: number; width: number; height: number};
  let boxes = $state<Box[]>([]);
  let layer: HTMLElement;
  let gone = $state(false); // clicked: fading out

  onMount(() => {
    const words = wordsOf(new URLSearchParams(location.search).get('q') ?? '');
    const article = document.querySelector<HTMLElement>('article');
    if (!words.length || !article) return;

    const ranges: Range[] = [];
    const blocks = [...article.querySelectorAll(BLOCKS)];
    for (const block of blocks) {
      // The block's text, piece by piece (the numbers of notes left out)
      const pieces: {node: Text; from: number}[] = [];
      let text = '';
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
        if (node.parentElement?.closest('sup')) continue;
        pieces.push({node, from: text.length});
        text += node.data;
      }
      const at = (i: number) => {
        const piece = pieces.findLast((x) => x.from <= i)!;
        return [piece.node, i - piece.from] as const;
      };
      for (const [from, to] of placesOf(text, words)) {
        const range = new Range();
        range.setStart(...at(from));
        // the end belongs to the piece of the word's last letter
        const [node, offset] = at(to - 1);
        range.setEnd(node, offset + 1);
        ranges.push(range);
      }
    }
    if (!ranges.length) return;

    // The layer goes in the article, to scroll and fade with its text;
    // the boxes are placed from the article's corner
    const position = article.style.position;
    article.style.position = 'relative';
    article.append(layer);
    const draw = () => {
      const origin = article.getBoundingClientRect();
      const dx = -origin.left - article.clientLeft + article.scrollLeft;
      const dy = -origin.top - article.clientTop + article.scrollTop;
      boxes = ranges.flatMap((range) =>
        [...range.getClientRects()].map((r) => ({
          left: r.left + dx,
          top: r.top + dy,
          width: r.width,
          height: r.height
        }))
      );
    };

    // The first one on view: the article scrolls in its own box. Done
    // again once the page is drawn and once the fonts are there (the
    // lines can still move: in Safari the first measure is taken before
    // the page's styles) — unless the reader has already moved
    let moved = false;
    const move = () => (moved = true);
    const moves = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const;
    for (const type of moves) addEventListener(type, move, {once: true, passive: true});
    const show = () => {
      draw();
      if (moved) return;
      const {top, bottom} = ranges[0].getBoundingClientRect();
      const onView = top >= 0 && bottom < innerHeight * 0.8;
      if (onView) return;
      // (on phones the window scrolls, not the article: FLOW in
      // routes/+layout.svelte — the one that doesn't scroll ignores it)
      const by = top - innerHeight / 3;
      article.scrollTop += by;
      scrollBy(0, by);
    };
    show();
    const frame = requestAnimationFrame(show);
    document.fonts.ready.then(show);

    // The text changes size (the window, a note opening in it on Phone):
    // the boxes follow their words
    const resized = new ResizeObserver(draw);
    for (const block of blocks) resized.observe(block);

    // A click on the text's space: the boxes fade out, then they are gone
    let after: ReturnType<typeof setTimeout>;
    const clear = () => {
      gone = true;
      resized.disconnect();
      after = setTimeout(() => (boxes = []), time('--fade-out-time'));
    };
    article.addEventListener('click', clear, {once: true});

    return () => {
      moved = true;
      cancelAnimationFrame(frame);
      clearTimeout(after);
      resized.disconnect();
      for (const type of moves) removeEventListener(type, move);
      article.removeEventListener('click', clear);
      layer.remove();
      article.style.position = position;
    };
  });
</script>

<div class="found" class:gone bind:this={layer} aria-hidden="true">
  {#each boxes as box}
    <span
      style:left="{box.left}px"
      style:top="{box.top}px"
      style:width="{box.width}px"
      style:height="{box.height}px"
    ></span>
  {/each}
</div>

<style>
  /* The layer: at the article's corner, behind its text; it takes no
     room and catches nothing */
  .found {
    position: absolute;
    left: 0;
    top: 0;
    width: 0 !important; /* whatever the article gives its children */
    z-index: -1;
    pointer-events: none;
    transition: opacity var(--fade-out-time) ease;
  }
  .found.gone {
    opacity: 0;
  }
  /* A box: its word, and half a unit more on both sides */
  span {
    position: absolute;
    box-sizing: content-box;
    margin-left: calc(var(--u) / -2);
    padding-inline: calc(var(--u) / 2);
    background: var(--band);
  }
  :global([data-tone='dark']) span {
    background: color-mix(in srgb, var(--ink) 30%, var(--bg));
  }
</style>
