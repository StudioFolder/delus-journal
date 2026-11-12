<!--
  Issues: all the issues, newest first, in three columns — title, issue
  number, date. The band for this URL is set in #lib/grid/layouts.ts.

  - A table on the band under the menu: titles from column 3, numbers
    from column 8, dates from column 10. Rows are quiet and turn to full
    ink under the pointer; the whole row is the link to the issue's page.
  - The covers sit on the background, side by side in one row, one
    column apart, in the same order as the list. The cover on view is in
    the middle of the space to the right of the band; the others wait to
    its left and right (partly under the band, partly off the screen).

  - The abstract of the issue on view sits at the bottom of the band,
    above the footer, as the highlight does on the home page: the issue
    number in small capitals, then the text.

  TO AN ISSUE — clicking a row opens the issue: the list and the other
  covers fade out, the abstract rises to the top of the band and the
  cover stays in place (motion/carry.ts); the issue's page does the rest.

  CAROUSEL — pointing at a row of the list, or at a cover, slides the row
  of covers sideways until that issue's cover is in place, and the
  abstract fades out and in to that issue's. It stays there until
  another one is pointed at. The row of the issue on view is in full ink.

  GRID — a button on the footer's line, at the left of the space right
  of the band (ViewSwitch, the mirror of the tone switch), turns the carousel into a
  grid of all the covers, and back: two per row, rows half the screen
  high, a cover in the middle of each cell — its top at the height of
  the band's content, its bottom where the abstract ends. Only the
  dividers are drawn: one vertical line in the middle, one horizontal
  line between rows. More rows than the screen holds scroll edge to
  edge. Pointing at a cover in the grid works as in the carousel. The
  button shows the view it leads to; the two views fade from one to the
  other. In the grid the covers don't travel to the issue's page (their
  size differs): the issue's cover fades in.

  MOBILE — the covers come after the list, in a row that is swiped
  sideways. No grid.
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import ViewSwitch from '#lib/grid/ViewSwitch.svelte';
  import {COVER_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {carry} from '#lib/motion/carry.ts';
  import {time} from '#lib/motion/time.ts';
  import Inlines from '#lib/article/Inlines.svelte';
  import {newestFirst} from '#lib/data/fixtures.ts';
  import {issueLabel, issueNumber} from '#lib/data/format.ts';

  const step = COVER_COLUMNS + 1; // from one cover to the next: its width + one column

  let at = $state(0); // the issue on view

  // The abstract follows a moment later: it fades out, changes, fades in
  let shown = $state(0); // the issue whose abstract is written
  let hidden = $state(false);
  let moved = $state(false); // true once the carousel has been used
  $effect(() => {
    const target = at;
    if (target === shown) return void (hidden = false);
    moved = true;
    hidden = true;
    const timer = setTimeout(() => {
      shown = target;
      hidden = false;
    }, time('--fade-out-time'));
    return () => clearTimeout(timer);
  });

  // Carousel or grid
  let grid = $state(false);
  let switched = $state(false); // true once the view has been changed
  // Full rows: the empty cells still carry the dividers
  const cells = Math.ceil(newestFirst.length / 2) * 2;
</script>

<Panel area="right" cols={COVER_COLUMNS} class="on-ground">
  <div
    class="covers fade"
    class:is-hidden={grid}
    class:next={switched}
    style:--at={at}
    style:--step={step}
    out:leave|global
  >
    {#each newestFirst as issue, i (issue.slug)}
      <div
        class="cover"
        role="img"
        aria-label="Cover of {issue.title}"
        onpointerenter={() => (at = i)}
        use:carry={grid ? `hidden-cover:${issue.slug}` : `cover:${issue.slug}`}
      ></div>
    {/each}
  </div>
</Panel>

<Panel area="rest" class="on-ground from-top">
  <div class="grid fade next" class:is-hidden={!grid} out:leave|global>
    {#each {length: cells}, i}
      {@const issue = newestFirst[i]}
      <div class="cell">
        {#if issue}
          <div
            class="cover"
            role="img"
            aria-label="Cover of {issue.title}"
            onpointerenter={() => (at = i)}
          ></div>
        {/if}
      </div>
    {/each}
  </div>
</Panel>

<ViewSwitch bind:grid onswitch={() => (switched = true)} />

<Panel area="band" inset class="on-band from-bottom">
  <div
    class="abstract labelled fade"
    class:now={moved}
    class:is-hidden={hidden}
    use:carry={`abstract:${newestFirst[shown].slug}`}
    out:leave|global
  >
    <p class="label">{issueLabel(newestFirst[shown].number)}</p>
    <p class="display"><Inlines parts={newestFirst[shown].abstract} /></p>
  </div>
</Panel>

<Panel area="band" inset class="on-band from-top">
  <div class="table">
    <p class="row head fade" out:leave|global>
      <span>Title</span><span>Issue</span><span>Date</span>
    </p>
    <ul>
      {#each newestFirst as issue, i (issue.slug)}
        <li
          class="row hover fade"
          class:active={i === at}
          style:--i={i}
          onpointerenter={() => (at = i)}
          onfocusin={() => (at = i)}
          out:leave|global
        >
          <a href="/issues/{issue.slug}/">{issue.title}</a>
          <span>{issueNumber(issue.number)}</span>
          <span>{issue.date}</span>
        </li>
      {/each}
    </ul>

    <!-- Mobile only -->
    <div class="covers-mobile fade" out:leave|global>
      {#each newestFirst as issue (issue.slug)}
        <div class="cover"></div>
      {/each}
    </div>
  </div>
</Panel>

<style>
  /* Titles from column 3 (the band's inner edge), numbers from column 8,
     dates from column 10 */
  .table {
    --columns: calc(5 * var(--col)) calc(2 * var(--col)) auto;
  }

  /* The row of covers: each as wide as the place, one column apart;
     the whole row slides by whole steps */
  .covers {
    width: 100%;
    display: flex;
    gap: var(--col);
    transform: translateX(calc(var(--at) * var(--step) * var(--col) * -1));
  }
  .covers.fade {
    transition:
      transform var(--move),
      opacity var(--fade-time) ease var(--move-time);
  }
  .covers .cover {
    flex: none;
  }
  /* Switching views nothing moves: the carousel fades out at once and
     comes back once the grid has gone */
  .covers.fade.next {
    transition:
      transform var(--move),
      opacity var(--fade-time) ease var(--fade-out-time);
  }
  .covers.fade.is-hidden {
    transition:
      transform var(--move),
      opacity var(--fade-out-time) ease 0s;
  }

  /* The grid: two cells per row, each row half the screen high. The
     dividers are the cells' borders: a line right of every left-hand
     cell, a line above every cell after the first row */
  .grid {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 50vh;
  }
  .cell {
    container-type: size;
    display: grid;
    place-items: center;
    padding-block: calc(12 * var(--u)); /* as from-top / from-bottom content */
  }
  .cell:nth-child(odd) {
    border-right: 1px solid var(--band);
  }
  .cell:nth-child(n + 3) {
    border-top: 1px solid var(--band);
  }
  /* The cover fills the cell's height, unless the cell is too narrow:
     then it keeps one column clear on each side */
  .cell .cover {
    width: min(100cqh * (var(--cover-ratio)), 100cqw - 2 * var(--col));
  }

  .covers-mobile {
    display: none;
  }

  /* Mobile: titles on the left, then number and date in fixed widths;
     the covers below, swiped sideways */
  @media (max-width: 767px) {
    .table {
      --columns: 1fr calc(5 * var(--u)) calc(13 * var(--u));
    }
    .covers,
    .abstract,
    .grid {
      display: none; /* the abstracts are not on mobile yet; no grid */
    }
    .covers-mobile {
      display: flex;
      gap: calc(2 * var(--u));
      margin-top: calc(5 * var(--u));
      padding-bottom: calc(3 * var(--u));
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }
    .covers-mobile .cover {
      flex: none;
      width: 80%;
      scroll-snap-align: start;
    }
  }
</style>
