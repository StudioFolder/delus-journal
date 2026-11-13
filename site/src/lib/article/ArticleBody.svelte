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
    the text; 14 on Narrow screens, 12 on Medium), so a long one takes two
    lines; two lines of space above
    it, one below.
  - A figure (ArticleFigure; Sanity: an image between two paragraphs):
    it stands after the paragraph that refers to it. On desktop it is a
    miniature in the margin to the right of the text, its top level with
    the line where the text names it — (FIG. A) — or, if the text before
    it doesn't (a figure without a letter never is), with the start of
    that paragraph; a figure that would
    touch the one before it moves down, one line after it.
    In a photo essay (`photos`) the figures are not in the margin nor
    among the paragraphs: they come all together after the text, in
    their order, as a grid — as the images of an issue: four per row
    (three on Medium and Narrow screens, where the columns are smaller),
    two columns apart, 8 units between rows, each image as large as fits
    in its square cell, in the middle of it; as wide as the space to
    the right of the band, one column clear at the right as at the
    left. Two lines under the text. No captions there (the gallery has
    them). On phones: one under the other, large (ArticleFigure,
    `photo`).
  - A link to an article of the journal (an author's name in the
    editors' note): while the pointer is on it (or the keyboard), the
    image of that article — the one of the issue's contents — shows as a
    miniature in the same margin, as a figure: one column after the
    text, 4 columns wide, its top level with the link's line. It comes
    and goes softly, as every hover effect; it is not a link itself.
    Where it would lie on a figure of the text, it wins: that figure
    fades out for as long as the miniature is there.
    Only where the figures are in the margin (Medium and Wide screens)
    and a pointer can hover.
  - The notes. On phones a note's number in the text is a link (thinly
    underlined, as .underlined): a tap opens the note right under the
    line where the number is (the paragraph or quote goes on under it),
    unfolding, its words coming in one after another as a figure's
    caption on desktop (ArticleNote); a tap on the number again,
    or on the note, closes it; another number opens its own note instead.
    On the larger screens they are not here but on the band
    (ArticleNotes), each one only while its number is on the screen: this
    component tells the page which numbers are on view (`onview`) — once
    they have stayed the same for a moment (--settle-time): while the
    text is scrolled fast, numbers come and go and the notes wait, then
    change once.
  Where it sits on the page is up to the page.
-->
<script lang="ts">
  import {mount, onMount, tick, unmount} from 'svelte';
  import Inlines from './Inlines.svelte';
  import ArticleFigure from './ArticleFigure.svelte';
  import {time} from '#lib/motion/time.ts';
  import ArticleNote from './ArticleNote.svelte';
  import type {Block, Figure, Inline} from '#lib/data/fixtures.ts';
  import {imageAt} from '#lib/data/images.ts';

  type Props = {
    blocks: Block[];
    notes?: Inline[][];
    photos?: boolean; // a photo essay: the figures large, in the column
    onview?: (numbers: number[]) => void; // the note numbers on the screen, in order
    onfigure?: (figure: Figure, miniature: HTMLElement) => void; // a figure was clicked: to see it larger
  };
  let {blocks, notes = [], photos = false, onview, onfigure}: Props = $props();

  // Which note numbers are on the screen: told to the page at every change
  let body: HTMLElement;
  onMount(() => {
    const seen = new Set<number>();
    let settle: ReturnType<typeof setTimeout>;
    const watch = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const n = Number((e.target as HTMLElement).dataset.note);
        if (e.isIntersecting) seen.add(n);
        else seen.delete(n);
      }
      // told once the numbers have stopped changing (fast scrolling)
      clearTimeout(settle);
      settle = setTimeout(() => onview?.([...seen].sort((a, b) => a - b)), time('--settle-time'));
    });
    for (const ref of body.querySelectorAll('.ref')) watch.observe(ref);
    return () => (watch.disconnect(), clearTimeout(settle));
  });

  // FIGURES IN THE MARGIN — how far down each one goes (ArticleFigure
  // does the rest): level with the line that names it, and never on the
  // figure before it. `tops[i]`: for the block i, when it is a figure.
  let tops = $state<(number | undefined)[]>([]);
  // The blocks that are figures: a figure's place among them is its name
  // on the page (data-figure), by which the gallery finds its miniature
  const figureBlocks = $derived(
    blocks.flatMap((b, i) => (typeof b === 'object' && 'figure' in b ? [i] : []))
  );

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
    // on phones the figures stay in the column: nothing to place (and the
    // notes unfolding there resize the text at every frame)
    if (matchMedia('(max-width: 767px)').matches) return;
    const figures = [...body.querySelectorAll<HTMLElement>('.figure')];
    if (!figures.length || photos) return; // (a photo essay: they stay in the column)
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
        const label = (blocks[indexes[n]] as {figure: Figure}).figure.label;
        // one unit under the top of the line: about where its letters start
        top = Math.max(
          free,
          block.getBoundingClientRect().top - start + (label ? lineOf(block, label) : 0) + unit
        );
      }
      next[indexes[n]] = top;
      free = top + el.offsetHeight + gap;
    }
    tops = next;
  }

  // A LINK TO AN ARTICLE — the miniature of its image, in the margin,
  // while the link is pointed at (see above). `preview` stays while it
  // fades out.
  let preview = $state<{ratio: number; top: number}>();
  let previewed = $state(false);
  let miniature = $state<HTMLElement>();
  let covered = $state<number[]>([]); // the blocks whose figure it lies on
  async function point(e: Event) {
    const link = (e.target as Element).closest?.('a.underlined');
    const image = link && imageAt(link.getAttribute('href') ?? '');
    if (!link || !image) return;
    // The line where the link starts, one unit under its top (as a figure)
    const block = link.closest('p, blockquote') ?? body;
    const r = link.getClientRects()[0];
    const line = parseFloat(getComputedStyle(block).lineHeight);
    const unit = parseFloat(getComputedStyle(body).getPropertyValue('--u')) || 8;
    const from = block.getBoundingClientRect().top;
    const top =
      from - body.getBoundingClientRect().top + Math.floor((r.top + r.height / 2 - from) / line) * line + unit;
    preview = {ratio: image.ratio, top};
    previewed = true;
    // The figures it lies on give way (only where it is shown)
    await tick();
    if (!previewed || !miniature) return;
    const mine = miniature.getBoundingClientRect();
    const indexes = blocks.flatMap((b, i) => (typeof b === 'object' && 'figure' in b ? [i] : []));
    covered = [...body.querySelectorAll('.figure')].flatMap((el, n) => {
      const r = el.getBoundingClientRect();
      return mine.height && r.top < mine.bottom && r.bottom > mine.top ? [indexes[n]] : [];
    });
  }
  const leave = (e: Event) => {
    if (!(e.target as Element).closest?.('a.underlined')) return;
    previewed = false;
    covered = [];
  };

  // PHONES — a note opens right under the line where its number is: the
  // paragraph (or quote) is split there, the note (ArticleNote, a block
  // of spans) is put in the text, and the text goes on under it. Its
  // height unfolds from nothing; closing, it folds back and fades. One
  // note is open at a time. Not with Svelte's own blocks: the place is
  // known only once the text is laid out.
  let opened: {n: number; box: HTMLElement; note: ReturnType<typeof mount>} | undefined;
  let lit = $state<number>(); // the number of the open note: lit in the text
  const easing = 'cubic-bezier(0.215, 0.61, 0.355, 1)'; // cubicOut

  function tap(event: MouseEvent) {
    if (!matchMedia('(max-width: 767px)').matches) return;
    const ref = (event.target as Element).closest<HTMLElement>('.ref');
    if (!ref) return;
    const n = Number(ref.dataset.note);
    const same = opened?.n === n;
    close();
    if (!same) open(ref, n);
  }

  // Where the line of `ref` ends: the first letter after it that lies
  // lower down (it starts the next line); nothing on the block's last line
  function nextLine(ref: HTMLElement, block: Element) {
    const bottom = ref.getBoundingClientRect().bottom;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      if (ref.contains(node) || !(ref.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
      for (let i = 0; i < node.data.length; i++) {
        if (/\s/.test(node.data[i])) continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        if (range.getBoundingClientRect().top > bottom) return {node, i};
      }
    }
  }

  function open(ref: HTMLElement, n: number) {
    const block = ref.closest('[data-block]')!;
    const box = document.createElement('span');
    box.style.cssText = 'display: block; overflow: hidden';
    // the whole width of the text, also in an indented block (a quote)
    box.style.marginLeft = `${-parseFloat(getComputedStyle(block).paddingLeft)}px`;
    const at = nextLine(ref, block);
    if (at) {
      const rest = at.node.splitText(at.i);
      // never inside a link: after it
      const link = rest.parentElement?.closest('a');
      if (link && block.contains(link)) link.after(box);
      else rest.before(box);
    } else block.append(box);
    const note = mount(ArticleNote, {target: box, props: {n, note: notes[n - 1], onclose: close}});
    box.animate([{height: '0px'}, {height: `${box.offsetHeight}px`}], {duration: time('--fade-time'), easing});
    opened = {n, box, note};
    lit = n;
  }

  function close() {
    if (!opened) return;
    const {box, note} = opened;
    opened = undefined;
    lit = undefined;
    const fold = box.animate(
      [
        {height: `${box.offsetHeight}px`, opacity: 1},
        {height: '0px', opacity: 0}
      ],
      {duration: time('--fade-time'), easing, fill: 'forwards'}
    );
    fold.onfinish = () => {
      unmount(note);
      box.remove();
    };
  }

  $effect(() => {
    for (const ref of body.querySelectorAll<HTMLElement>('.ref'))
      ref.classList.toggle('is-open', Number(ref.dataset.note) === lit);
  });

  // The lines change with the width: an open note closes (not when only
  // the height changes, as the phone's bars come and go)
  onMount(() => {
    let width = innerWidth;
    const resized = () => {
      if (innerWidth !== width) close();
      width = innerWidth;
    };
    addEventListener('resize', resized);
    return () => {
      removeEventListener('resize', resized);
      if (opened) unmount(opened.note);
    };
  });

  onMount(() => {
    place();
    const watch = new ResizeObserver(place);
    watch.observe(body);
    document.fonts?.ready.then(place);
    return () => watch.disconnect();
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_mouse_events_have_key_events, a11y_click_events_have_key_events -->
<div class="body" bind:this={body} onmouseover={point} onmouseout={leave} onfocusin={point} onfocusout={leave} onclick={tap}>
  {#each blocks as block, i (i)}
    {#if typeof block === 'string' || Array.isArray(block)}
      <p data-block={i}><Inlines parts={block} /></p>
    {:else if 'quote' in block}
      <blockquote data-block={i}><Inlines parts={block.quote} sc={false} /></blockquote>
    {:else if 'figure' in block}
      {#if !photos}<ArticleFigure figure={block.figure} id={figureBlocks.indexOf(i)} top={tops[i]} covered={covered.includes(i)} onopen={(el) => onfigure?.(block.figure, el)} />{/if}
    {:else}
      <h2>{block.heading}</h2>
    {/if}
  {/each}
  {#if photos}
    <div class="photos">
      {#each figureBlocks as i, n (i)}
        {@const figure = (blocks[i] as {figure: Figure}).figure}
        <div class="cell"><ArticleFigure {figure} photo id={n} onopen={(el) => onfigure?.(figure, el)} /></div>
      {/each}
    </div>
  {/if}
  {#if preview}
    <div
      class="preview"
      class:is-on={previewed}
      bind:this={miniature}
      aria-hidden="true"
      style:top="{preview.top}px"
      style:aspect-ratio={preview.ratio}
    ></div>
  {/if}
</div>

<style>
  .body {
    position: relative; /* the figures in the margin are placed from here */
    display: grid;
    grid-template-columns: minmax(0, 1fr); /* the text's width, also when a photo essay's grid is wider */
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
  /* A photo essay's images, after the text (see above): on phones a
     column, from Narrow up the grid */
  .photos {
    margin-top: calc(4 * var(--u)); /* with the line between blocks: two lines */
    display: grid;
    gap: calc(8 * var(--u));
  }
  @media (min-width: 768px) {
    .photos {
      width: calc(26 * var(--col)); /* the space right of the band, less a column on each side */
      grid-template-columns: repeat(4, 1fr);
      column-gap: calc(2 * var(--col));
    }
    .cell {
      container-type: size;
      aspect-ratio: 1;
      display: grid;
      place-items: center;
    }
  }
  /* Medium and Narrow: three per row */
  @media (min-width: 768px) and (max-width: 1439px) {
    .photos {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  /* The miniature of a linked article: in the figures' margin, there
     only while its link is pointed at */
  .preview {
    display: none;
  }
  @media (hover: hover) and (min-width: 1200px) {
    .preview {
      display: block;
      position: absolute;
      left: calc(100% + var(--col));
      width: calc(4 * var(--col));
      background: var(--band);
      opacity: 0;
      transition: opacity var(--hover);
      pointer-events: none;
    }
    .preview.is-on {
      opacity: 1;
    }
  }
  /* Narrow and Medium screens (SCREENS in styles.css): the columns are
     smaller and the text takes more of them, so a chapter title too —
     about half the text, as on Wide: 14 of the text's 25 columns on
     Narrow, 12 of its 22 on Medium */
  @media (min-width: 768px) and (max-width: 1199px) {
    h2 {
      width: calc(14 * var(--col));
    }
  }
  @media (min-width: 1200px) and (max-width: 1439px) {
    h2 {
      width: calc(12 * var(--col));
    }
  }
  /* Mobile: the grid columns are too narrow, a fixed indent instead */
  @media (max-width: 767px) {
    blockquote {
      padding-left: calc(3 * var(--u));
    }
    h2 {
      width: auto; /* the text's width: 8 columns are too few here */
    }
    /* A note's number: a link, thinly underlined (as .underlined), quiet
       → full ink while its note is open; it catches the tap around it */
    .body :global(.ref) {
      position: relative;
      cursor: pointer;
      text-decoration-line: underline;
      text-decoration-thickness: 1px;
      text-decoration-color: color-mix(in srgb, var(--ink) calc(var(--lit) * 100%), var(--ink-quiet));
      text-underline-offset: -0.1em; /* a little under the raised figure, not at the line's foot */
      transition: --lit var(--hover);
    }
    .body :global(.ref.is-open) {
      --lit: 1;
    }
    .body :global(.ref)::after {
      content: '';
      position: absolute;
      inset: calc(-2 * var(--u)) calc(-1 * var(--u));
    }
  }
</style>
