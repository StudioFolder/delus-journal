<!--
  An issue. Medium band, as the issues list (layouts.ts).

  - The abstract at the top of the band, under the menu: the issue
    number in small capitals, then the text.
  - On the line of the issue number, in small capitals too: the
    issue's date (season and year). This line stays at the top of the
    band while the rest of the column scrolls under it.
  - Under the abstract, a line of words in small capitals, quiet → full
    ink under the pointer (.hover), apart as the items of the menu:
    Colophon — shows the publication details in place of the table of
    contents; in full ink while they are on view;
    Cite — shows how to cite the issue there (issueCitationOf: Chicago,
    with the DOI), to be selected and copied. Not for a forthcoming
    issue;
    Where there is a pointer (Marco, 15 Nov) the two work on hover, not
    on a click: pointing at the word shows what it stands for, and it
    stays while the pointer goes down to it (anywhere in the column
    below the line); pointing back at the abstract, or leaving the
    column, brings the contents back. **The pointer must rest on the
    word a moment (--dwell-time) before it opens** (Marco, 15 Nov): a
    quick pass over it, on the way from the abstract to the contents,
    opens nothing. **Resting on PDF or Buy brings the contents back**
    in the same way (they are not what is shown; a quick pass over them
    — on Narrow they lie between Cite and the citation — changes
    nothing). Without a pointer (touch, the keyboard) a tap or Enter
    shows it, and again hides it;
    PDF — the open-access PDF (Marco, 15 Nov: before Buy, on the same
    line; no longer in the colophon), with the arrow (only if the issue
    has one);
    Buy — last (Marco, 15 Nov), the link to the publisher's page of the
    issue, with the arrow of a link to another site (.link) (only if the
    issue has one).
  - Below the abstract the table of contents: title, people; each
    entry is the link to its article. The first entry is the editorial
    ("A Note from the Editors", by the issue's editors). Or, after Colophon, the
    publication details (Credits, compact: all in the small Styrene).
    One fades out, the other fades in.
  - The cover on the background, in the middle of the space to the
    right of the band.

  GALLERY — the space to the right of the band scrolls sideways: after
  the cover comes one image for each entry of the contents (its "cover
  image", to be chosen in the CMS; for now its first figure with a
  file, else an empty box), each in the
  cover's place, one at a time: at rest the page is as it was. Images
  come in any format, upright or lying: each is as large as fits in the
  cover's box.
  The scroll is free and stops with an image in the middle (scroll
  snap); a wheel that only turns up and down moves it by one image per
  gesture. Pointing at an entry of the contents (or reaching it with the
  keyboard) slides the gallery to its image, as pointing at a row does on the issues list. The title of
  the image on view is in full ink in the contents (which scroll to show
  it, unless the pointer is on them); the image is the link to its
  article, as its title: over it the pointer is the word Read (use:word,
  #lib/pointer; Marco, 24 Nov). With the pointer neither on an entry nor on an
  image, after a short pause (--return-time) the gallery goes back to
  the cover and no title is in full ink — only where a pointer can
  hover: on a touch screen the gallery stays where it is left.

  FROM THE LIST — arriving from the issues list, nothing reloads: the
  abstract rises from the bottom of the band to the top and the cover
  stays where it was (motion/carry.ts); the date, Colophon, Buy, Cite and the contents
  cascade in once the abstract has arrived. Arriving any other way,
  everything fades in.

  GRID — the switch of the issues list (ViewSwitch, on the footer's
  line) turns the gallery into a grid of the entries' images (without the
  issue's cover), and back: four
  per row, the rows sharing the height between the band's content top
  and bottom (11 images: three rows), one column clear at the sides, two
  columns between cells across and 8 units down; each image, whatever
  its format, as large as fits in its cell, in the middle of it; no
  dividing lines. Never more than four rows on the screen: further ones
  scroll.
  To the grid: the image on view fades out, then the images of the grid
  fade in one after another, from the top left to the bottom right.
  Back: they fade out together, then the gallery fades in. Pointing at
  an image of the grid puts its title in full ink, as in the gallery.
  The view that is off can't be pointed at nor reached with the keyboard
  (inert).

  LIT — where a pointer can hover, the image under the pointer, or whose
  title is under it, stands out a little more from the background, as
  the figures' miniatures in an article (a touch of the ink colour).

  MOBILE — one column: abstract, contents (or details); each entry's
  image, small, above its title, lit as its title when touched. The
  issue's cover: its place still to decide. No gallery, no grid.
-->
<script lang="ts">
  import {onDestroy, tick, untrack} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import ViewSwitch from '#lib/grid/ViewSwitch.svelte';
  import {COVER_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {arriving, land} from '#lib/motion/carry.ts';
  import {time} from '#lib/motion/time.ts';
  import {still} from '#lib/motion/still.ts';
  import {steps} from '#lib/motion/wheel.ts';
  import {opens} from '#lib/type/links.ts';
  import Inlines from '#lib/article/Inlines.svelte';
  import Credits from '#lib/type/Credits.svelte';
  import Found from '#lib/search/Found.svelte';
  import Picture from '#lib/image/Picture.svelte';
  import PointerWord from '#lib/pointer/PointerWord.svelte';
  import {word} from '#lib/pointer/word.svelte.ts';
  import {issueDetails, issueLabel} from '#lib/data/format.ts';

  let {data} = $props();
  const issue = $derived(data.issue);

  // How wide the entries' images are on the screen (for Picture: which
  // file to ask for): the cover's box, 13 columns of 36; a cell of the
  // grid, as the figures' grid in an article. (On Phone: 12 units high,
  // so as wide as their format makes them — given where they are drawn.)
  const SIZES = {gallery: '36vw', grid: '(max-width: 1439px) 22vw, 16vw'};

  // Contents, colophon or citation, below the abstract. The change
  // follows a moment later: what is there fades out, changes, fades in
  type View = 'contents' | 'colophon' | 'cite';
  let view = $state<View>('contents'); // what is asked for
  let shown = $state<View>('contents'); // what is written
  let hidden = $state(false);
  let switched = $state(false); // true once Colophon or Cite has been used
  // The words: on hover where there is a pointer; else a tap shows, a
  // second tap hides
  // (after the pointer has rested on the word for --dwell-time)
  let dwell: ReturnType<typeof setTimeout>;
  const point = (to: View) => (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(dwell);
    dwell = setTimeout(() => (view = to), time('--dwell-time'));
  };
  const unpoint = () => clearTimeout(dwell);
  onDestroy(unpoint);
  const hovers = () => matchMedia('(hover: hover)').matches;
  const tap = (to: View) => () => {
    if (!hovers()) view = view === to ? 'contents' : to;
  };
  const toContents = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(dwell);
    view = 'contents';
  };
  $effect(() => {
    const target = view;
    if (target === shown) return void (hidden = false);
    switched = true;
    hidden = true;
    const timer = setTimeout(() => {
      place(untrack(() => shown), target);
      shown = target;
      hidden = false;
    }, time('--fade-out-time'));
    return () => clearTimeout(timer);
  });

  // With the contents scrolled, what replaces them (shorter) must not
  // move the column: the abstract would come back under the pointer and
  // close it again (Marco: "a bug with the hover … when the list is
  // scrolled"). So, while it is out of sight: the space below keeps the
  // contents' height (`keep`) and the column shows the colophon or the
  // citation from its start, right under the words (at most where the
  // words begin to stay); going back, the contents return where they
  // were left.
  let column = $state<HTMLElement>();
  let labelled = $state<HTMLElement>();
  let below = $state<HTMLElement>();
  let keep = $state<number>(); // the contents' height, kept while they are away
  let left = 0; // where the contents were scrolled to
  function place(from: View, to: View) {
    // (only where the column scrolls under a sticky number line: not on Phone)
    if (!column || !labelled || !below || !matchMedia('(min-width: 768px)').matches) return;
    if (from === 'contents') {
      left = column.scrollTop;
      keep = below.offsetHeight;
    }
    if (to === 'contents') {
      keep = undefined;
      tick().then(() => column && (column.scrollTop = left));
      return;
    }
    // where the words begin to stay: under the abstract (and 2 units),
    // less the number line's 4 units
    const unit = parseFloat(getComputedStyle(column).getPropertyValue('--u')) || 8;
    const top = column.getBoundingClientRect().top;
    const stays = labelled.getBoundingClientRect().bottom - top + column.scrollTop + 2 * unit - 4 * unit;
    column.scrollTop = Math.min(left, Math.max(0, stays));
  }

  // Gallery or grid. The grid's rows (four images each) share the height
  // between the band's content top and bottom; from the fifth row on
  // they scroll
  // (three per row on Medium and Narrow screens, as every grid of images:
  // there at most three rows on the screen, so the images keep their size)
  const rows = $derived({
    four: Math.min(Math.ceil(data.contents.length / 4), 4),
    three: Math.min(Math.ceil(data.contents.length / 3), 3)
  });
  let grid = $state(false);
  let changed = $state(false); // true once the view has been changed

  // The gallery: which image is on view (0 = the cover, then the entries
  // of the contents, in their order)
  let views: HTMLElement; // gallery and grid, one over the other
  let gallery: HTMLElement;
  let at = $state(0);
  let towards: number | null = null; // the image asked for by pointing, until the gallery gets there
  function onscroll() {
    if (towards !== null) {
      // on the way, the images passing by don't count
      if (Math.abs(gallery.scrollLeft - towards * gallery.clientWidth) < 1) towards = null;
      return;
    }
    at = Math.round(gallery.scrollLeft / gallery.clientWidth);
    if (at) rest(); // scrolled by hand: the pause starts when the scrolling stops
  }
  // Pointing at an entry of the contents: the gallery slides to its image
  function show(i: number) {
    if (at === i && towards === null) return;
    at = i;
    const left = i * gallery.clientWidth;
    // Already there (e.g. pointed at in the grid): nothing will scroll,
    // so there is nothing to wait for
    if (Math.abs(gallery.scrollLeft - left) < 1) return void (towards = null);
    towards = i;
    gallery.scrollTo({left, behavior: still() ? 'auto' : 'smooth'});
  }

  // Back to the cover, a pause after the pointer has left the entries
  // and the images (and the keyboard is not on them either)
  let back: ReturnType<typeof setTimeout>;
  const hold = () => clearTimeout(back);
  function rest() {
    hold();
    if (!matchMedia('(hover: hover)').matches) return;
    back = setTimeout(() => {
      const on = (node?: Element | null) => node?.matches(':hover, :focus-within');
      if (entries.some(on) || [...views.querySelectorAll('.cover')].some(on)) return;
      show(0);
    }, time('--return-time'));
  }

  // A wheel that turns up and down moves the gallery by one image per
  // gesture (motion/wheel.ts, as the highlights on the home page).
  // Sideways scrolling is the browser's own.
  const stepper = steps((dir) =>
    gallery.scrollTo({
      left: (at + dir) * gallery.clientWidth,
      behavior: still() ? 'auto' : 'smooth'
    })
  );
  function onwheel(e: WheelEvent) {
    towards = null; // scrolling by hand takes over
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) stepper.wheel(e);
  }
  onDestroy(() => (stepper.stop(), hold()));

  // The contents scroll to show the entry of the image on view — not
  // while the pointer is on them (they would slip from under it)
  const entries: HTMLElement[] = $state([]);
  $effect(() => {
    const entry = entries[at - 1];
    if (entry && !entry.parentElement?.matches(':hover'))
      entry.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  });

  // Where the abstract and the cover come from, when arriving from the
  // list: read once, as the page is created. (Going from one issue
  // straight to another makes a new page: see +layout.svelte.)
  const slug = untrack(() => data.issue.slug);
  const from = {abstract: arriving(`abstract:${slug}`), cover: arriving(`cover:${slug}`)};
</script>

<Panel area="rest" class="on-ground">
  <div class="views" style:--cover-cols={COVER_COLUMNS} bind:this={views}>
    <!-- The gallery fades only once the view has been changed: arriving,
         its cover is there from the first instant (it may come from the list) -->
    <div
      class="gallery"
      class:fade={changed}
      class:next={changed}
      class:is-hidden={grid}
      inert={grid}
      bind:this={gallery}
      {onscroll}
      {onwheel}
    >
      <div class="slide">
        <div
          class="cover"
          class:fade={!from.cover}
          role="img"
          aria-label="Cover of {issue.title}"
          use:land={from.cover}
          out:leave|global
        ><Picture image={issue.cover} sizes={SIZES.gallery} eager /></div>
      </div>
      {#each data.contents as entry, i (entry.href)}
        <div class="slide">
          <a
            class="cover"
            class:lit={at === i + 1}
            style:--ratio={entry.image.ratio}
            href={entry.href}
            aria-label={entry.title}
            use:word={'Read'}
            onpointerenter={hold}
            onpointerleave={rest}
            onfocusout={rest}
            out:leave|global
            ><Picture image={entry.image.image} sizes={SIZES.gallery} /></a
          >
        </div>
      {/each}
    </div>

    <div class="grid image-grid on-screen" inert={!grid} style:--rows-4={rows.four} style:--rows-3={rows.three}>
      {#each data.contents as entry, i (entry.href)}
        <div class="cell fade next" class:is-hidden={!grid} style:--i={i} out:leave|global>
          <a
            class="cover"
            class:lit={at === i + 1}
            style:--ratio={entry.image.ratio}
            href={entry.href}
            aria-label={entry.title}
            use:word={grid ? 'Read' : ''}
            onpointerenter={() => (hold(), (towards = null), (at = i + 1))}
            onpointerleave={rest}
            onfocusin={() => (hold(), (towards = null), (at = i + 1))}
            onfocusout={rest}
            ><Picture image={entry.image.image} sizes={SIZES.grid} /></a
          >
        </div>
      {/each}
    </div>
  </div>
</Panel>
<PointerWord />

<!-- (no switch without images to show: a forthcoming issue has its cover alone) -->
{#if data.contents.length}
  <ViewSwitch bind:grid what="images" onswitch={() => (changed = true)} />
{/if}

<!-- Arriving from the search: the words found, marked in the abstract
     (this page's column: the one with the number line) -->
<Found scroller=".column:has(> .head)" blocks=".labelled > .display" band />

<Panel area="band" inset class="on-band from-top">
  <!-- The whole column lands from the list's abstract (its number line and
       text are at the top; the rest appears after) -->
  <!-- (the pointer leaving the column brings the contents back: not an interaction) -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="column"
    bind:this={column}
    class:fade={!from.abstract}
    use:land={from.abstract}
    onpointerleave={toContents}
    out:leave|global
  >
    <p class="label tags head">
      <span>{issueLabel(issue.number)}</span>
      <span class="fade" style:--i={0}
        >{#if issue.publication.forthcoming}<em>forthcoming</em>{:else}{issue.date}{/if}</span
      >
    </p>
    <div class="labelled" bind:this={labelled}>
      <p class="display" onpointerenter={toContents}><Inlines parts={issue.abstract} /></p>
    </div>
    <!-- The words: out of the abstract's block so that they can stay at
         the top, under the number line, while the contents scroll.
         A forthcoming issue has none: no colophon, citation, PDF or Buy
         yet (Marco, 15 Nov) -->
    {#if !issue.publication.forthcoming}
      <p class="label tags words">
        <span class="hover fade" class:active={view === 'colophon'} style:--i={1}>
          <button
            type="button"
            aria-pressed={view === 'colophon'}
            onpointerenter={point('colophon')}
            onpointerleave={unpoint}
            onclick={tap('colophon')}>Colophon</button
          >
        </span>
        {#if data.citation}
          <span class="hover fade" class:active={view === 'cite'} style:--i={2}>
            <button
              type="button"
              aria-pressed={view === 'cite'}
              onpointerenter={point('cite')}
              onpointerleave={unpoint}
              onclick={tap('cite')}>Cite</button
            >
          </span>
        {/if}
        {#if issue.publication.pdfUrl}
          <span class="hover link stretched fade" style:--i={3} onpointerenter={point('contents')} onpointerleave={unpoint}>
            <a href={issue.publication.pdfUrl} {...opens(issue.publication.pdfUrl)}>PDF</a>
          </span>
        {/if}
        {#if issue.publication.buyUrl}
          <span class="hover link stretched fade" style:--i={4} onpointerenter={point('contents')} onpointerleave={unpoint}>
            <a href={issue.publication.buyUrl} {...opens(issue.publication.buyUrl)}>Buy</a>
          </span>
        {/if}
      </p>
    {/if}

    <div
      class="below fade"
      class:now={switched}
      class:is-hidden={hidden}
      style:min-height={keep === undefined ? null : `${keep}px`}
      bind:this={below}
    >
      {#if shown === 'colophon'}
        <Credits rows={issueDetails(issue)} compact />
      {:else if shown === 'cite' && data.citation}
        <p class="citation"><Inlines parts={data.citation} sc={false} /></p>
      {:else if data.contents.length}
        <ol class="contents">
          {#each data.contents as entry, i (entry.href)}
            <li
              class="entry stretched hover"
              class:fade={!switched}
              class:active={at === i + 1}
              style:--i={4 + i}
              bind:this={entries[i]}
              onpointerenter={() => (hold(), show(i + 1))}
              onpointerleave={rest}
              onfocusin={() => (hold(), show(i + 1))}
              onfocusout={rest}
            >
              <span class="image" style:--ratio={entry.image.ratio} aria-hidden="true"
                ><Picture image={entry.image.image} sizes="{Math.ceil(96 * entry.image.ratio)}px" /></span
              >
              <span class="title"><a href={entry.href}>{entry.title}</a></span>
              <span class="by">{entry.by}</span>
            </li>
          {/each}
        </ol>
      {/if}
    </div>

  </div>
</Panel>

<style>
  .column {
    width: 100%;
    display: grid;
  }
  /* The line of the issue number and date stays at the top while the
     column scrolls: the rest passes under it (the band's colour behind
     it, down to the abstract's first line: the 2 units of a label).
     Not on phones, where the column is the page */
  .head {
    padding-bottom: calc(2 * var(--u));
  }
  /* The words: 2 units under the abstract (as a label's distance) */
  .words {
    margin-top: calc(2 * var(--u));
  }
  @media (min-width: 768px) {
    .column {
      /* what scrolls into view stops under the number line and the words */
      scroll-padding-top: calc(8 * var(--u));
    }
    .head {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--band);
    }
    /* The words stay too, under the number line (Marco, 15 Nov), the
       band's colour behind them and 2 units under them */
    .words {
      position: sticky;
      top: calc(4 * var(--u));
      z-index: 1;
      padding-bottom: calc(2 * var(--u));
      background: var(--band);
    }
  }
  /* Narrow: the words one under the other — four lines */
  @media (min-width: 768px) and (max-width: 1199px) {
    .column {
      scroll-padding-top: calc(17 * var(--u));
    }
  }
  /* Contents (or details): 8 units under what comes before (with the
     words' 2 units of padding where they are sticky) */
  .below {
    margin-top: calc(8 * var(--u));
  }
  @media (min-width: 768px) {
    .below {
      margin-top: calc(6 * var(--u));
    }
  }
  /* The gallery: as wide and as high as the space right of the band; it
     scrolls sideways, one image per screenful, each in the middle (the
     cover's place) */
  .views {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .gallery {
    width: 100%;
    height: 100%;
    display: flex;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .slide {
    flex: none;
    width: 100%;
    display: grid;
    place-items: center;
    scroll-snap-align: start;
  }
  .slide .cover {
    display: block;
    width: calc(var(--cover-cols) * var(--col));
  }
  /* An entry's image keeps its own format (--ratio, width / height), as
     large as fits in the cover's box */
  a.cover {
    position: relative; /* holds its picture */
    aspect-ratio: var(--ratio);
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * var(--lit-tint)), var(--band));
  }
  .slide a.cover {
    width: calc(min(1, var(--ratio) / (var(--cover-ratio))) * var(--cover-cols) * var(--col));
  }

  /* An entry's image under the pointer, or whose title is: a touch of
     the ink colour, softly (--lit, as .hover) — as the miniatures of an
     article's figures (ArticleFigure) */
  @media (hover: hover) {
    a.cover {
      transition: --lit var(--hover);
    }
    a.cover:hover,
    a.cover.lit {
      --lit: 1;
    }
  }

  /* The grid, over the gallery (GRIDS OF IMAGES in styles.css): rows
     beyond the screen's scroll */
  .grid {
    overflow-y: auto;
    scrollbar-width: none;
  }
  .cell .cover {
    display: block;
  }

  /* The lines above and under the abstract (number and date; Colophon,
     Cite, Buy): their words apart as the items of the menu */
  .tags {
    display: flex;
    gap: calc(4 * var(--u));
  }
  .tags button {
    cursor: pointer;
  }
  /* A word and its arrow never part */
  .tags > span {
    white-space: nowrap;
  }
  /* Narrow (Marco, 15 Nov): the four words don't fit the band's line —
     one under the other, 1 unit apart (as the legal pages' titles) */
  @media (min-width: 768px) and (max-width: 1199px) {
    .tags:not(.head) {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--u);
    }
  }
  /* Where they work on hover, Colophon and Cite are not things to click */
  @media (hover: hover) {
    .tags button {
      cursor: default;
    }
  }
  /* The citation, in place of the contents: the colophon's type, full
     ink, to be selected; a long address breaks */
  .citation {
    font: var(--type-ui);
    overflow-wrap: anywhere;
    user-select: text;
  }

  /* The table of contents: entries 4 units apart, 9 columns wide — one
     fewer than the band's content; on phones the whole width;
     the title in Styrene at the size that matches the people's Louize
     (--type-band-title, as the title on an article's band), written as
     it is (title capitals) and, on the next line (no space between), the people in Louize (--type-text),
     as on their article's page. The whole entry is
     the link */
  .contents {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: calc(4 * var(--u));
  }
  .entry {
    max-width: calc(9 * var(--col));
  }
  .title,
  .by {
    display: block;
  }
  .title {
    font: var(--type-band-title);
  }
  .by {
    font: var(--type-text);
  }
  /* Phone only: each entry's image, small, above its title — 12 units
     high, as wide as its own format makes it (--ratio, width / height),
     2 units above the title; its picture (else an empty box). Lit
     with its title (a touch of the ink colour, softly: --lit, as the
     gallery's images on desktop) */
  .entry .image {
    display: none;
  }

  @media (max-width: 767px) {
    .views {
      display: none;
    }
    .entry {
      max-width: none;
    }
    .entry .image {
      display: block;
      position: relative; /* holds its picture */
      width: calc(12 * var(--u) * var(--ratio));
      height: calc(12 * var(--u));
      margin-bottom: calc(2 * var(--u));
      background: color-mix(in srgb, var(--ink) calc(var(--lit) * var(--lit-tint)), var(--band));
      transition: --lit var(--hover);
    }
    .entry:hover .image,
    .entry.active .image {
      --lit: 1;
    }
  }
</style>
