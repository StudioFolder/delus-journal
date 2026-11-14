<!--
  SEARCH — the words found, on the page they were found in.

  FROM THE ADDRESS — a result of the search leads to its page with the
  words in the address (…/not-a-drop-is-lost/?q=tomato). Put <Found />
  on the page: it looks for them in the page's text (`blocks`, inside
  `scroller`: by default an article's title and main text — the
  abstract, the paragraphs, quotes and chapter titles), as the search
  does (the words that begin with them, whatever the capitals and
  accents: find.ts), brings the first one on view, a third of the way
  down (if it isn't on view already), and marks them all as a
  highlighter would: a soft box behind each word, half a unit wider on
  both sides, from just above the ascenders to just below the
  descenders. A click on the text's space — not the band, nor the tone
  switch — and the boxes fade out.

  WHILE TYPING — the search within an article (Find.svelte) gives the
  words as `query`: they are marked as they are typed (from the second
  letter), and one of them is the one being looked at — the first at or
  below the top of the screen, a little stronger than the others;
  `step(1)` / `step(-1)` go to the next and the one before, round and
  round. `count` and `at` say how many there are and which one that is.
  While `query` is given, the address's words are forgotten and a click
  on the text clears nothing; when it is no longer given, the boxes fade
  out.

  The box is the background with some ink in it (`--found`): a tenth in
  the light tone — the band's grey —, three tenths in the dark one,
  where the band's colour is too close to the background. On the band
  itself (`band`: an issue's abstract) the light tone takes the plain
  background instead. One formula for both tones, so that the box
  blends from one to the other with the rest of the page.

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
  import {onMount, untrack} from 'svelte';
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
    query?: string; // the words, while they are typed (see WHILE TYPING)
    count?: number; // how many are found in the text
    at?: number; // the one being looked at: 1, 2… (0: none)
  };
  let {
    scroller = 'article',
    blocks = 'h1, .abstract, .body [data-block], .body h2',
    band = false,
    notes = [],
    figures = [],
    query,
    count = $bindable(0),
    at = $bindable(0)
  }: Props = $props();

  // How far the box goes beyond the letters, above and below, in ems
  const AIR = 0.1;

  type Box = {left: number; top: number; width: number; height: number; now: boolean};
  let boxes = $state<Box[]>([]);
  let layer: HTMLElement;
  let gone = $state(false); // fading out

  let holder: HTMLElement | null = null;
  let looked: Element[] = [];
  let hits: Range[] = []; // the words in the text, in their order
  let extras: Range[] = []; // the numbers of the notes that have them
  let first: Range | Element | undefined; // where the page opens
  let now = -1; // the hit being looked at (while typing)
  let placed = false;
  let typed = false; // `query` has been given
  let moved = false; // the reader has scrolled: the page is not brought anywhere any more
  let after: ReturnType<typeof setTimeout>;
  let leave = () => {}; // what the layer leaves behind is put back
  let resized: ResizeObserver | undefined;
  let pen: CanvasRenderingContext2D;

  // The words in the page's text: `hits`, `extras`, `first`
  function look(words: string[]) {
    hits = [];
    extras = [];
    first = undefined;
    if (!holder || !words.length) return;
    const has = (text: string) => placesOf(text, words).length > 0;

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
      const piece = (i: number) => {
        const found = pieces.findLast((x) => x.from <= i)!;
        return [found.node, i - found.from] as const;
      };
      for (const [from, to] of placesOf(text, words)) {
        const range = new Range();
        range.setStart(...piece(from));
        // the end belongs to the piece of the word's last letter
        const [node, offset] = piece(to - 1);
        range.setEnd(node, offset + 1);
        hits.push(range);
      }
    }

    notes.forEach((note, i) => {
      if (!has(plain(note))) return;
      for (const number of holder!.querySelectorAll(`sup[data-note="${i + 1}"]`)) {
        const range = new Range();
        range.selectNodeContents(number);
        extras.push(range);
      }
    });

    // Where the page opens: the first word in the text; failing that,
    // the first number of a note, or figure, that has the words
    first = hits[0];
    if (!first) {
      const others: (Range | Element)[] = [...extras];
      figures.forEach((figure, i) => {
        const el = has(plain(figure.caption)) && holder!.querySelector(`[data-figure="${i}"]`);
        if (el && el.getClientRects().length) others.push(el);
      });
      const top = (x: Range | Element) => x.getBoundingClientRect().top;
      first = others.sort((a, b) => top(a) - top(b))[0];
    }
  }

  // The layer goes in the holder, to scroll and fade with its text; the
  // boxes are placed from the holder's corner. The text changes size
  // (the window, the band, a note opening in it on Phone): the boxes
  // follow their words
  function place() {
    if (placed || !holder) return;
    placed = true;
    const position = holder.style.position;
    holder.style.position = 'relative';
    holder.append(layer);
    resized = new ResizeObserver(draw);
    for (const block of looked) resized.observe(block);
    leave = () => {
      resized?.disconnect();
      layer.remove();
      holder!.style.position = position;
    };
  }

  // A box: its word's width; in height, from the top of the ascenders
  // to the bottom of the descenders of its type, and a little air (the
  // browser's own box for a piece of text is taller, and sits higher)
  function draw() {
    if (!holder || !placed) return;
    const origin = holder.getBoundingClientRect();
    const dx = -origin.left - holder.clientLeft + holder.scrollLeft;
    const dy = -origin.top - holder.clientTop + holder.scrollTop;
    const types = new Map<string, {above: number; below: number; line: number}>();
    const boxesOf = (range: Range, now: boolean) => {
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
        height: above + below,
        now
      }));
    };
    boxes = [
      ...hits.flatMap((range, i) => boxesOf(range, i === now)),
      ...extras.flatMap((range) => boxesOf(range, false))
    ];
  }

  // The part of the screen the text is read in: the holder — or the
  // whole screen, where the window scrolls (on phones: FLOW in
  // routes/+layout.svelte)
  function view() {
    const own = holder!.scrollHeight > holder!.clientHeight + 1;
    return {
      own,
      from: own ? holder!.getBoundingClientRect().top : 0,
      height: own ? holder!.clientHeight : innerHeight
    };
  }

  // On view: a third of the way down, unless it is on view already
  function bring(target: Range | Element, smooth = false) {
    const {own, from, height} = view();
    const {top, bottom} = target.getBoundingClientRect();
    if (top - from >= 0 && bottom - from < height * 0.8) return;
    const by = top - from - height / 3;
    const behavior =
      smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant';
    holder!.scrollBy({top: by, behavior});
    if (!own) scrollBy({top: by, behavior});
  }

  // The boxes fade out, then they are gone
  function fade() {
    gone = true;
    clearTimeout(after);
    after = setTimeout(() => {
      hits = [];
      extras = [];
      boxes = [];
      gone = false;
    }, time('--fade-out-time'));
  }

  onMount(() => {
    holder = document.querySelector<HTMLElement>(scroller);
    if (!holder) return;
    looked = [...holder.querySelectorAll(blocks)];
    pen = document.createElement('canvas').getContext('2d')!;
    const stops: (() => void)[] = [() => clearTimeout(after), () => leave()];

    // From the address
    look(typed ? [] : wordsOf(new URLSearchParams(location.search).get('q') ?? ''));
    if (first) {
      place();
      // The first one on view. Done again once the page is drawn and
      // once the fonts are there (the lines can still move: in Safari
      // the first measure is taken before the page's styles; a news
      // text is brought to its start after it appears) — unless the
      // reader has already moved
      const move = () => (moved = true);
      const moves = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const;
      for (const type of moves) addEventListener(type, move, {once: true, passive: true});
      const show = () => {
        if (typed) return;
        draw();
        if (!moved && first) bring(first);
      };
      show();
      let frame = requestAnimationFrame(() => (show(), (frame = requestAnimationFrame(show))));
      const later = setTimeout(show, time('--fade-time'));
      document.fonts.ready.then(show);

      // A click on the text's space: the boxes fade out
      const clear = () => typed || fade();
      holder.addEventListener('click', clear, {once: true});

      stops.push(() => {
        cancelAnimationFrame(frame);
        clearTimeout(later);
        for (const type of moves) removeEventListener(type, move);
        holder!.removeEventListener('click', clear);
      });
    }

    return () => {
      moved = typed = true;
      for (const stop of stops) stop();
    };
  });

  // While typing
  $effect(() => {
    const q = query;
    untrack(() => {
      if (q === undefined) {
        if (!typed) return;
        typed = false;
        moved = true;
        now = -1;
        count = at = 0;
        fade();
        return;
      }
      typed = true;
      clearTimeout(after);
      gone = false;
      const words = wordsOf(q);
      look(words.join('').length >= 2 ? words : []);
      count = hits.length;
      if (hits.length) {
        place();
        // The one being looked at: the first at or below the top of the screen
        const {from} = view();
        const below = hits.findIndex((range) => range.getBoundingClientRect().top >= from);
        now = Math.max(0, below);
        at = now + 1;
        draw();
        bring(hits[now]);
      } else {
        now = -1;
        at = 0;
        draw();
      }
    });
  });

  /** To the next one (1) or the one before (-1), round and round */
  export function step(by: number) {
    if (!hits.length) return;
    now = (now + by + hits.length) % hits.length;
    at = now + 1;
    draw();
    bring(hits[now], true);
  }
</script>

<div class="found" class:gone class:band bind:this={layer} aria-hidden="true">
  {#each boxes as box}
    <span
      class:now={box.now}
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
  /* A box: its word, and half a unit more on both sides. --found: how
     much ink there is in it, 0 to 1 — a number the browser can blend,
     as the tones' colours are (it changes with the tone, in step; and
     softly from one word to the next, while stepping through them) */
  @property --found {
    syntax: '<number>';
    inherits: false;
    initial-value: 0;
  }
  span {
    position: absolute;
    box-sizing: content-box;
    margin-left: calc(var(--u) / -2);
    padding-inline: calc(var(--u) / 2);
    --found: 0.1;
    background: color-mix(in srgb, var(--ink) calc(var(--found) * 100%), var(--bg));
    transition: --found var(--tone);
  }
  .found.band span {
    --found: 0;
  }
  :global([data-tone='dark']) .found span {
    --found: 0.3;
  }
  /* The one being looked at: more ink */
  .found span.now {
    --found: 0.25;
  }
  :global([data-tone='dark']) .found span.now {
    --found: 0.5;
  }
</style>
