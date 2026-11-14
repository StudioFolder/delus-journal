<!--
  A contribution (an "article"), under its issue:
  /issues/<issue>/<contribution>/ — reached from the issue's contents
  and images, and from a name in the contributors list. An issue's
  editorial is shown with this same page (editorial/+page.svelte). The
  band for this URL (Small, Back → the issue) is
  set in #lib/grid/layouts.ts.

  PEOPLE — on the band, at the top (as the content of other bands): one
  name per line, in the running text type, as in the Figma layout.
  Under them, once the title in the text has scrolled off the screen,
  the TITLE again, in Styrene at the people's size (--type-band-title):
  it fades in and out at once (nothing moves).

  HEAD — its title in Styrene B (ArticleHeader), level with the first
  name; then, if it has one, the abstract (ArticleAbstract,
  for now in the large type); then, if it has one, the text
  (ArticleBody: paragraphs, quotes, chapter titles; two essays and the
  editorial of Issue 01 so far).

  FIGURE, LARGE — a click on a figure's miniature: the text and the
  notes fade out, then the miniature grows into the large figure in
  their place (ArticleLightbox, which also says when the text must be
  out of the way: `textHidden`). From there all the figures of the
  article can be browsed (Previous, Next, the arrow keys). Close, a
  click elsewhere or Esc, and the figure on view shrinks back onto its
  miniature, then the text returns — at the passage that names it.

  SEARCH — at the right end of the band's top line, a lens: the search
  within this article (desktop only). The band opens to Medium, with a
  field on that line; what is typed is marked in the text (Find.svelte
  and Found.svelte in #lib/search). Not for a forthcoming issue.

  DOWNLOAD, CITE — two words at the bottom of the band, above the footer
  (ArticleActions): the link to the article's PDF and a button that
  copies how to cite it. Mobile: after the text.

  NOTES — on the band, at the bottom, above those two words (4 units):
  a note is there only while its number in the text is on the screen
  (ArticleNotes; the text says which numbers are on view — once they
  have settled, so fast scrolling doesn't scatter them), never higher
  than 4 units under the people and the title (`room`: the notes that
  don't fit wait) and only
  while the pointer is over the space of the text: over the band, or
  out of the window, they fade out. Where there is no pointer to hover
  with (touch screens) they stay. Mobile: none on the band; a tap on a
  note's number in the text opens it under its paragraph (ArticleBody).
  Two lines of space between these blocks. All together:

  TEXT — in the space to the right of the band, as the news texts and
  the About text: one column after the band, 18 columns wide, starting
  at the height of the band's content (--edge) — the text itself 16
  columns, two fewer than head and abstract; a long text scrolls the
  whole height of the screen, with 12 units of space after its last line.

  PHOTO ESSAY (the contribution's `kind`) — a piece that is images
  first: the same page, but its figures are not miniatures in the
  margin: they come all together after the text, as a grid — the one
  of an issue's images — from which a click opens the gallery
  (ArticleBody, `photos`). On every screen, Narrow included; on phones,
  where there is no grid, large, one under the other.

  FORTHCOMING ISSUE — its texts are not final: only the people (on the
  band; on mobile at the top of the column), nothing in the column.

  The screens named below are the site's (SCREENS in styles.css).

  MEDIUM (1200–1439px) — the figures stay in the margin, but nothing is
  left free to their right: the text is 6 columns wider (22; head and
  abstract 24), so the figures stand in the last columns before the
  edge.

  NARROW (768–1199px) — the columns are too narrow for the text and a
  margin of figures: head and abstract take all the columns to the right
  (one kept free at the edge), the text two fewer, as on desktop. No
  figures for now (how to show them there is still to decide).

  PHONE — one column under the header; the people in small capitals
  above the title (the band is the header there). The text scrolls the
  window, not its panel (`flows`: FLOW in routes/+layout.svelte), so
  the browser's bars shrink and the text runs to the bottom of the screen.
-->
<script lang="ts">
  import {onMount} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import {TEXT_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import ArticleHeader from '#lib/article/ArticleHeader.svelte';
  import ArticleAbstract from '#lib/article/ArticleAbstract.svelte';
  import ArticleBody from '#lib/article/ArticleBody.svelte';
  import ArticleNotes from '#lib/article/ArticleNotes.svelte';
  import ArticleActions from '#lib/article/ArticleActions.svelte';
  import ArticleLightbox from '#lib/article/ArticleLightbox.svelte';
  import PointerWord from '#lib/pointer/PointerWord.svelte';
  import Found from '#lib/search/Found.svelte';
  import Find from '#lib/search/Find.svelte';
  import ArticlePill from '#lib/article/ArticlePill.svelte'; // a trial (Phone)
  import {plain} from '#lib/data/format.ts';

  let {data} = $props();
  let onView = $state<number[]>([]); // the note numbers on the screen
  let titleOnView = $state(true); // the title in the text is on the screen
  let lightbox: ArticleLightbox;
  // The figures of the article as they come in the text, and in the
  // order of the gallery: by letter; the ones without a letter (the text
  // doesn't refer to them) after, as they come
  const inText = $derived(
    (data.contribution.body ?? []).flatMap((b) => (typeof b === 'object' && 'figure' in b ? [b.figure] : []))
  );
  const figures = $derived(
    inText.toSorted((a, b) =>
      a.label && b.label ? a.label.localeCompare(b.label) : a.label ? -1 : b.label ? 1 : 0
    )
  );
  let textHidden = $state(false); // a figure is shown large, in place of the text
  let swapped = $state(false); // a figure has been opened: from then on the text comes back at once

  // The search within the article (SEARCH above): Find is the field on
  // the band, Found marks the words in the text
  let found: Found;
  let finding = $state(false);
  let sought = $state('');
  let matches = $state(0); // how many are found
  let match = $state(0); // the one being looked at
  let away = $state(false); // the text is out of sight while it changes width
  let actions = $state<HTMLElement>(); // Download and Cite after the text (Phone): the pill goes there
  $effect(() => {
    if (away) swapped = true; // it comes back at once
  });

  // The notes show only while the pointer is over the space of the text
  // (see NOTES above)
  let text: HTMLElement; // the article: its panel is that space
  let hovers = $state(false); // there is a pointer that can hover
  let overText = $state(false);
  // Over the band: the details of Download and Cite show (where nothing
  // can hover, always)
  let overBand = $state(false);
  let afterBand = $state(false);
  onMount(() => {
    hovers = matchMedia('(hover: hover)').matches;
    overText = !hovers;
  });

  // The height there is for the notes: from 4 units under the people and
  // the title on the band down to where the notes end (see NOTES above)
  let head: HTMLElement;
  let bandNotes = $state<HTMLElement>();
  let room = $state<number>();
  onMount(() => {
    const measure = () => {
      if (!bandNotes) return;
      const unit = parseFloat(getComputedStyle(head).getPropertyValue('--u')) || 8;
      room = Math.max(
        0,
        bandNotes.getBoundingClientRect().bottom - head.getBoundingClientRect().bottom - 4 * unit
      );
    };
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(head);
    watch.observe(document.documentElement);
    return () => watch.disconnect();
  });
  function point(event: PointerEvent) {
    if (!hovers || event.pointerType !== 'mouse') return;
    overText = event.clientX >= text.parentElement!.getBoundingClientRect().left;
    // Coming back from the band, the notes wait for Download and Cite to
    // close and settle (see ArticleActions)
    if (overText && overBand) afterBand = true;
    if (!overText) afterBand = false;
    overBand = !overText;
  }
</script>

<svelte:window onpointermove={point} />
<svelte:document onmouseleave={() => hovers && (overText = overBand = false)} />

<Panel area="band" inset class="on-band from-top">
  <div class="head fade" bind:this={head} out:leave|global>
    <ul class="people">
      {#each data.authors as name (name)}
        <li>{name}</li>
      {/each}
    </ul>
    {#if !data.issue.publication.forthcoming}
      <p class="running-title fade now" class:is-hidden={titleOnView}>{data.contribution.title}</p>
    {/if}
  </div>
</Panel>

{#if !data.issue.publication.forthcoming}
  <Panel area="band" inset class="on-band from-bottom">
    <div class="foot fade" out:leave|global>
      {#if data.contribution.notes}
        <div
          class="band-notes fade"
          class:now={swapped || hovers}
          class:is-hidden={textHidden || !overText}
          class:waits={afterBand}
          bind:this={bandNotes}
        >
          <ArticleNotes notes={data.contribution.notes} only={onView} {room} />
        </div>
      {/if}
      <ArticleActions
        pdf={data.contribution.pdf}
        pdfSize={data.contribution.pdfSize}
        citation={data.citation}
        details={overBand || !hovers}
      />
    </div>
  </Panel>
{/if}

<Panel area="rest" class="on-ground from-top flows">
  <article
    bind:this={text}
    class="fade"
    class:now={swapped}
    class:is-hidden={textHidden || away}
    style:--text-cols={TEXT_COLUMNS}
    out:leave|global
  >
    <!-- Mobile only: on desktop the people are on the band -->
    <p class="people-mobile">{data.authors.join(', ')}</p>
    {#if !data.issue.publication.forthcoming}
      <ArticleHeader title={data.contribution.title} onview={(visible) => (titleOnView = visible)} />
      {#if data.contribution.abstract}
        <ArticleAbstract text={data.contribution.abstract} />
      {/if}
      {#if data.contribution.body}
        <ArticleBody
          blocks={data.contribution.body}
          notes={data.contribution.notes}
          photos={data.contribution.kind === 'photoEssay'}
          onview={(numbers) => (onView = numbers)}
          onfigure={(figure, miniature) => ((swapped = true), lightbox.show(figure, miniature))}
        />
      {/if}
      <!-- Mobile only: on desktop they are on the band -->
      <div class="actions-mobile" bind:this={actions}>
        <ArticleActions
          pdf={data.contribution.pdf}
          pdfSize={data.contribution.pdfSize}
          citation={data.citation}
          details
        />
      </div>
    {/if}
  </article>
</Panel>

<ArticleLightbox bind:this={lightbox} {figures} {inText} bind:hidden={textHidden} />

<!-- The words found, marked in the text: arriving from the search, or
     typed in the search within the article -->
<Found
  bind:this={found}
  notes={data.contribution.notes}
  figures={inText}
  query={finding ? sought : undefined}
  bind:count={matches}
  bind:at={match}
/>
{#if data.contribution.body}
  <Find
    bind:open={finding}
    bind:query={sought}
    bind:away
    count={matches}
    at={match}
    onstep={(by) => found.step(by)}
  />
{/if}

<!-- A trial, Phone only: Download, Cite and Find in a floating pill
     (ArticlePill.svelte; it shares the search's state with Find) -->
{#if !data.issue.publication.forthcoming}
  <ArticlePill
    pdf={data.contribution.pdf}
    pdfSize={data.contribution.pdfSize}
    citation={plain(data.citation)}
    find={!!data.contribution.body}
    bind:open={finding}
    bind:query={sought}
    count={matches}
    at={match}
    onstep={(by) => found.step(by)}
    hidden={textHidden}
    top={titleOnView}
    until={actions}
  />
{/if}

<!-- The word that stands for the pointer on the figures (Open, Close, Previous, Next) -->
<PointerWord />

<style>
  /* Back from the band: the notes appear once Download and Cite have
     closed (their text fading out, then their room) */
  .band-notes.waits:not(.is-hidden) {
    transition-delay: calc(var(--fade-out-time) + var(--fade-time));
  }
  .people {
    padding: 0;
    list-style: none;
    font: var(--type-text);
  }
  .people-mobile {
    display: none;
  }
  /* The title on the band, two units under the people */
  .running-title {
    margin-top: calc(2 * var(--u));
    font: var(--type-band-title);
  }
  /* Notes, then Download and Cite, 4 units apart */
  .foot {
    width: 100%;
    display: grid;
    gap: calc(4 * var(--u));
  }
  .actions-mobile {
    display: none;
  }

  /* Head, abstract and text one under the other, two lines of the
     large type between them */
  article {
    width: 100%;
    padding: var(--edge) 0 calc(12 * var(--u)) var(--col);
    display: grid;
    align-content: start;
    gap: calc(8 * var(--u));
  }
  article > :global(*) {
    width: calc(var(--text-cols) * var(--col));
  }
  /* The text (paragraphs and quotes) two columns narrower than the head
     and the abstract: a better measure for its smaller type */
  article > :global(.body) {
    width: calc((var(--text-cols) - 2) * var(--col));
  }

  /* Medium: the text wider, the figures at the edge (see MEDIUM above):
     of the 28 columns to the right of the text's start, the text takes
     22 — then one free, the figures' four, one at the edge */
  @media (min-width: 1200px) and (max-width: 1439px) {
    article > :global(*) {
      width: calc(100% - 4 * var(--col));
    }
    article > :global(.body) {
      width: calc(100% - 6 * var(--col));
    }
  }

  /* Narrow: the text takes the width of the page (see NARROW above) */
  @media (min-width: 768px) and (max-width: 1199px) {
    article > :global(*) {
      width: calc(100% - var(--col));
    }
    article > :global(.body) {
      width: calc(100% - 3 * var(--col));
    }
  }

  @media (max-width: 767px) {
    .head,
    .foot {
      display: none;
    }
    .actions-mobile {
      display: block;
    }
    .people-mobile {
      display: block;
      margin-bottom: calc(-7 * var(--u)); /* one unit to the title */
      font: var(--type-text); /* as on the band */
    }
    article {
      padding-left: 0;
    }
    article > :global(*),
    article > :global(.body) {
      width: 100%;
    }
  }
</style>
