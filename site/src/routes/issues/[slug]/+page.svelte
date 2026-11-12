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
    contents, and back; in full ink while they are on view;
    Buy — the link to the publisher's page of the issue (only if the
    issue has one);
    Cite — copies how to cite the issue; the word then reads "Copied"
    for a moment (Cite.svelte, as on an article). Not for a forthcoming
    issue.
  - Below the abstract the table of contents: title, people; each
    entry is the link to its article. The first entry is the editorial
    ("A Note from the Editors", by the issue's editors). Or, after Colophon, the
    publication details (Credits, compact: all in the small Styrene).
    One fades out, the other fades in.
  - The cover on the background, in the middle of the space to the
    right of the band.

  GALLERY — the space to the right of the band scrolls sideways: after
  the cover comes one image for each entry of the contents (its "cover
  image", to be chosen in the CMS; for now an empty box), each in the
  cover's place, one at a time: at rest the page is as it was. Images
  come in any format, upright or lying: each is as large as fits in the
  cover's box.
  The scroll is free and stops with an image in the middle (scroll
  snap); a wheel that only turns up and down moves it by one image per
  gesture. Pointing at an entry of the contents (or reaching it with the
  keyboard) slides the gallery to its image, as pointing at a row does on the issues list. The title of
  the image on view is in full ink in the contents (which scroll to show
  it, unless the pointer is on them); the image is the link to its
  article, as its title. With the pointer neither on an entry nor on an
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

  MOBILE — one column: abstract, contents (or details), cover. No
  gallery, no grid.
-->
<script lang="ts">
  import {onDestroy, untrack} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import ViewSwitch from '#lib/grid/ViewSwitch.svelte';
  import {COVER_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {arriving, land} from '#lib/motion/carry.ts';
  import {time} from '#lib/motion/time.ts';
  import {steps} from '#lib/motion/wheel.ts';
  import {opens} from '#lib/type/links.ts';
  import Inlines from '#lib/article/Inlines.svelte';
  import Credits from '#lib/type/Credits.svelte';
  import Cite from '#lib/article/Cite.svelte';
  import {issueDetails, issueLabel} from '#lib/data/format.ts';

  let {data} = $props();
  const issue = $derived(data.issue);

  // Contents or colophon, below the abstract. The change follows a
  // moment later: what is there fades out, changes, fades in
  let colophon = $state(false); // what is asked for
  let shown = $state(false); // what is written
  let hidden = $state(false);
  let switched = $state(false); // true once Colophon has been used
  $effect(() => {
    const target = colophon;
    if (target === shown) return void (hidden = false);
    switched = true;
    hidden = true;
    const timer = setTimeout(() => {
      shown = target;
      hidden = false;
    }, time('--fade-out-time'));
    return () => clearTimeout(timer);
  });

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
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
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
        ></div>
      </div>
      {#each data.contents as entry, i (entry.href)}
        <div class="slide">
          <a
            class="cover"
            class:lit={at === i + 1}
            style:--ratio={entry.image.ratio}
            href={entry.href}
            aria-label={entry.title}
            onpointerenter={hold}
            onpointerleave={rest}
            onfocusout={rest}
            out:leave|global
          ></a>
        </div>
      {/each}
    </div>

    <div class="grid" inert={!grid} style:--rows-4={rows.four} style:--rows-3={rows.three}>
      {#each data.contents as entry, i (entry.href)}
        <div class="cell fade next" class:is-hidden={!grid} style:--i={i} out:leave|global>
          <a
            class="cover"
            class:lit={at === i + 1}
            style:--ratio={entry.image.ratio}
            href={entry.href}
            aria-label={entry.title}
            onpointerenter={() => (hold(), (towards = null), (at = i + 1))}
            onpointerleave={rest}
            onfocusin={() => (hold(), (towards = null), (at = i + 1))}
            onfocusout={rest}
          ></a>
        </div>
      {/each}
    </div>
  </div>
</Panel>

<ViewSwitch bind:grid what="images" onswitch={() => (changed = true)} />

<Panel area="band" inset class="on-band from-top">
  <!-- The whole column lands from the list's abstract (its number line and
       text are at the top; the rest appears after) -->
  <div class="column" class:fade={!from.abstract} use:land={from.abstract} out:leave|global>
    <p class="label tags head">
      <span>{issueLabel(issue.number)}</span>
      <span class="fade" style:--i={0}>{issue.date}</span>
    </p>
    <div class="labelled">
      <p class="display"><Inlines parts={issue.abstract} /></p>
      <p class="label tags">
        <span class="hover fade" class:active={colophon} style:--i={1}>
          <button type="button" aria-pressed={colophon} onclick={() => (colophon = !colophon)}>
            Colophon
          </button>
        </span>
        {#if issue.publication.buyUrl}
          <span class="hover fade" style:--i={2}>
            <a href={issue.publication.buyUrl} {...opens(issue.publication.buyUrl)}>Buy</a>
          </span>
        {/if}
        {#if data.citation}
          <Cite citation={data.citation} class="fade" i={issue.publication.buyUrl ? 3 : 2} />
        {/if}
      </p>
    </div>

    <div class="below fade" class:now={switched} class:is-hidden={hidden}>
      {#if shown}
        <Credits rows={issueDetails(issue)} compact />
      {:else}
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
              <span class="title"><a href={entry.href}>{entry.title}</a></span>
              <span class="by">{entry.by}</span>
            </li>
          {/each}
        </ol>
      {/if}
    </div>

    <!-- Mobile only -->
    <div class="cover cover-mobile fade"></div>
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
  @media (min-width: 768px) {
    .column {
      scroll-padding-top: calc(4 * var(--u)); /* what scrolls into view stops under the number line */
    }
    .head {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--band);
    }
  }
  /* Contents (or details) and, on phones, the cover: 8 units under what
     comes before */
  .below,
  .cover-mobile {
    margin-top: calc(8 * var(--u));
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

  /* The grid, over the gallery: four cells per row, two columns apart,
     one column clear at the sides; the rows, 8 units apart, share the
     height between the top and the bottom of the band's content (--rows
     of them on the screen; more scroll). Each image is as large as fits
     in its cell, in the middle of it */
  .grid {
    --gap: calc(8 * var(--u));
    --rows: var(--rows-4);
    position: absolute;
    inset: 0;
    padding: calc(12 * var(--u)) var(--col);
    overflow-y: auto;
    scrollbar-width: none;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: calc((100% - (var(--rows) - 1) * var(--gap)) / var(--rows));
    gap: var(--gap) calc(2 * var(--col));
    align-content: start;
  }
  /* Medium and Narrow: three per row */
  @media (min-width: 768px) and (max-width: 1439px) {
    .grid {
      --rows: var(--rows-3);
      grid-template-columns: repeat(3, 1fr);
    }
  }
  /* The images appear one after another (CASCADE), once the gallery has
     faded out; they disappear together */
  .cell.fade.next {
    transition-delay: calc(var(--fade-out-time) + var(--i) * var(--cascade-step));
  }
  .cell.fade.is-hidden {
    transition-delay: 0s;
  }
  .cell {
    container-type: size;
    display: grid;
    place-items: center;
  }
  .cell .cover {
    display: block;
    width: min(100cqw, 100cqh * var(--ratio));
  }

  /* The lines above and under the abstract (number and date; Colophon,
     Buy, Cite): their words apart as the items of the menu */
  .tags {
    display: flex;
    gap: calc(4 * var(--u));
  }
  .tags button {
    cursor: pointer;
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
  .cover-mobile {
    display: none;
  }

  @media (max-width: 767px) {
    .views {
      display: none;
    }
    .entry {
      max-width: none;
    }
    .cover-mobile {
      display: block;
      margin-bottom: calc(3 * var(--u));
    }
  }
</style>
