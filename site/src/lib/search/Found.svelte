<!--
  SEARCH — the words found, on the page they were found in.

  A result of the search leads to its page with the words in the address
  (…/not-a-drop-is-lost/?q=tomato). Put <Found /> on the page: it looks
  for them in the page's text (`blocks`, inside `scroller`: by default
  an article's title and main text — the abstract, the paragraphs,
  quotes and chapter titles), as the search does (the words that begin
  with them, whatever the capitals and accents: find.ts), brings the
  first one on view, a third of the way down (if it isn't on view
  already), and marks them all as a highlighter would: a soft box behind
  each word, half a unit wider on both sides, from just above the
  ascenders to just below the descenders. A click on the text's space —
  not the band, nor the tone switch — and the boxes fade out.

  The box is the band's colour; in the dark tone, where that is too
  close to the background, a lighter grey (three tenths of ink). On the
  band itself (`band`: an issue's abstract) the light tone takes the
  background's colour instead.

  An article's NOTES and CAPTIONS (`notes`, `figures`) are not on the
  page as running text: a note with the words has its number in the
  text marked, and — when the words are nowhere in the text itself —
  the page opens on the first such number, or on the first figure whose
  caption has them.

  The boxes are drawn behind the text, in a layer of their own that
  this component puts in the scroller and takes away with itself:
  nothing in the text is touched, so the notes, the small capitals and
  the figures are not disturbed. They are measured on the words, and
  again whenever the text changes size.
-->
<script lang="ts">
  import {onMount} from 'svelte';
  import {time} from '#lib/motion/time.ts';
  import {plain} from '#lib/data/format.ts';
  import type {Figure, Inline} from '#lib/data/fixtures.ts';
  import {placesOf, wordsOf} from './find.ts';

  type Props = {
    scroller?: string; // the element that holds the text (and scrolls it, unless the window does)
    blocks?: string; // what is looked through, inside it
    band?: boolean; // the text is on the band
    notes?: Inline[][]; // an article's notes (notes[0] = note 1)
    figures?: Figure[]; // and its figures, as they come in the text
  };
  let {
    scroller = 'article',
    blocks = 'h1, .abstract, .body [data-block], .body h2',
    band = false,
    notes = [],
    figures = []
  }: Props = $props();

  // How far the box goes beyond the letters, above and below, in ems
  const AIR = 0.1;

  type Box = {left: number; top: number; width: number; height: number};
  let boxes = $state<Box[]>([]);
  let layer: HTMLElement;
  let gone = $state(false); // clicked: fading out

  onMount(() => {
    const words = wordsOf(new URLSearchParams(location.search).get('q') ?? '');
    const holder = document.querySelector<HTMLElement>(scroller);
    if (!words.length || !holder) return;
    const has = (text: string) => placesOf(text, words).length > 0;

    const ranges: Range[] = [];
    const looked = [...holder.querySelectorAll(blocks)];
    for (const block of looked) {
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

    // Where the page opens: the first word in the text; failing that,
    // the first number of a note, or figure, that has the words
    let first: Range | Element | undefined = ranges[0];
    notes.forEach((note, i) => {
      if (!has(plain(note))) return;
      for (const number of holder.querySelectorAll(`sup[data-note="${i + 1}"]`)) {
        const range = new Range();
        range.selectNodeContents(number);
        ranges.push(range);
      }
    });
    if (!first) {
      const others: (Range | Element)[] = [...ranges];
      figures.forEach((figure, i) => {
        const el = has(plain(figure.caption)) && holder.querySelector(`[data-figure="${i}"]`);
        if (el && el.getClientRects().length) others.push(el);
      });
      const top = (x: Range | Element) => x.getBoundingClientRect().top;
      first = others.sort((a, b) => top(a) - top(b))[0];
    }
    if (!first) return;

    // The layer goes in the holder, to scroll and fade with its text;
    // the boxes are placed from the holder's corner
    const position = holder.style.position;
    holder.style.position = 'relative';
    holder.append(layer);

    // A box: its word's width; in height, from the top of the ascenders
    // to the bottom of the descenders of its type, and a little air (the
    // browser's own box for a piece of text is taller, and sits higher)
    const pen = document.createElement('canvas').getContext('2d')!;
    const draw = () => {
      const origin = holder.getBoundingClientRect();
      const dx = -origin.left - holder.clientLeft + holder.scrollLeft;
      const dy = -origin.top - holder.clientTop + holder.scrollTop;
      const types = new Map<string, {above: number; below: number; line: number}>();
      boxes = ranges.flatMap((range) => {
        const node = range.startContainer;
        const style = getComputedStyle(node instanceof Element ? node : node.parentElement!);
        let type = types.get(style.font);
        if (!type) {
          pen.font = style.font;
          const m = pen.measureText('dp');
          const air = AIR * parseFloat(style.fontSize);
          type = {
            above: m.actualBoundingBoxAscent + air,
            below: m.actualBoundingBoxDescent + air,
            // where the baseline lies in the browser's box, from its top
            line: m.fontBoundingBoxAscent / (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)
          };
          types.set(style.font, type);
        }
        const {above, below, line} = type;
        return [...range.getClientRects()].map((r) => ({
          left: r.left + dx,
          top: r.top + r.height * line - above + dy,
          width: r.width,
          height: above + below
        }));
      });
    };

    // The first one on view: a third of the way down the holder — or
    // down the screen, where the window scrolls (on phones: FLOW in
    // routes/+layout.svelte). Done again once the page is drawn and once
    // the fonts are there (the lines can still move: in Safari the first
    // measure is taken before the page's styles; a news text is brought
    // to its start after it appears) — unless the reader has already moved
    let moved = false;
    const move = () => (moved = true);
    const moves = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const;
    for (const type of moves) addEventListener(type, move, {once: true, passive: true});
    const show = () => {
      draw();
      if (moved) return;
      const own = holder.scrollHeight > holder.clientHeight + 1;
      const from = own ? holder.getBoundingClientRect().top : 0;
      const height = own ? holder.clientHeight : innerHeight;
      const {top, bottom} = first.getBoundingClientRect();
      if (top - from >= 0 && bottom - from < height * 0.8) return;
      const by = top - from - height / 3;
      holder.scrollTop += by;
      if (!own) scrollBy(0, by);
    };
    show();
    let frame = requestAnimationFrame(() => (show(), (frame = requestAnimationFrame(show))));
    const later = setTimeout(show, time('--fade-time'));
    document.fonts.ready.then(show);

    // The text changes size (the window, a note opening in it on Phone):
    // the boxes follow their words
    const resized = new ResizeObserver(draw);
    for (const block of looked) resized.observe(block);

    // A click on the text's space: the boxes fade out, then they are gone
    let after: ReturnType<typeof setTimeout>;
    const clear = () => {
      gone = true;
      resized.disconnect();
      after = setTimeout(() => (boxes = []), time('--fade-out-time'));
    };
    holder.addEventListener('click', clear, {once: true});

    return () => {
      moved = true;
      cancelAnimationFrame(frame);
      clearTimeout(later);
      clearTimeout(after);
      resized.disconnect();
      for (const type of moves) removeEventListener(type, move);
      holder.removeEventListener('click', clear);
      layer.remove();
      holder.style.position = position;
    };
  });
</script>

<div class="found" class:gone class:band bind:this={layer} aria-hidden="true">
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
  /* The layer: at the holder's corner, behind its text; it takes no
     room and catches nothing */
  .found {
    position: absolute;
    left: 0;
    top: 0;
    width: 0 !important; /* whatever the holder gives its children */
    height: 0 !important;
    padding: 0 !important;
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
  .band span {
    background: var(--bg);
  }
  :global([data-tone='dark']) span {
    background: color-mix(in srgb, var(--ink) 30%, var(--bg));
  }
</style>
