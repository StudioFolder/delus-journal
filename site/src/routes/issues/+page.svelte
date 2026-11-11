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

  CAROUSEL — pointing at a row of the list, or at a cover, slides the row
  of covers sideways until that issue's cover is in place, and the
  abstract fades out and in to that issue's. It stays there until
  another one is pointed at. The row of the issue on view is in full ink.

  MOBILE — the covers come after the list, in a row that is swiped
  sideways.
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {COVER_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {time} from '#lib/motion/time.ts';
  import Acronyms from '#lib/type/Acronyms.svelte';
  import {issues} from '#lib/data/fixtures.ts';
  import {issueNumber} from '#lib/data/format.ts';

  const newestFirst = issues.toSorted((a, b) => b.number - a.number);

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
</script>

<Panel area="right" cols={COVER_COLUMNS} class="on-ground">
  <div class="covers fade" style:--at={at} style:--step={step} out:leave|global>
    {#each newestFirst as issue, i (issue.slug)}
      <div
        class="cover"
        role="img"
        aria-label="Cover of {issue.title}"
        onpointerenter={() => (at = i)}
      ></div>
    {/each}
  </div>
</Panel>

<Panel area="band" inset class="on-band from-bottom">
  <div class="abstract labelled fade" class:now={moved} class:is-hidden={hidden} out:leave|global>
    <p class="label">Issue {issueNumber(newestFirst[shown].number)}</p>
    <p class="display"><Acronyms text={newestFirst[shown].abstract} /></p>
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
    .abstract {
      display: none; /* the abstracts are not on mobile yet */
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
