<!--
  A contribution (an "article"), under its issue:
  /issues/<issue>/<contribution>/ — reached for now from a name in the
  contributors list. The band for this URL (Small, Back → the issue) is
  set in #lib/grid/layouts.ts.

  PEOPLE — on the band, at the top (as the content of other bands): one
  name per line, in the running text type, as in the Figma layout.
  Under them, once the title in the text has scrolled off the screen,
  the TITLE again, in Styrene at the people's size (--type-band-title):
  it fades in and out at once (nothing moves).

  HEAD — its title in Styrene B (ArticleHeader), level with the first
  name; then, if it has one, the abstract (ArticleAbstract,
  for now in the same type as the text); then, if it has one, the text
  (ArticleBody: paragraphs, quotes, chapter titles; two essays of
  Issue 01 so far).

  FIGURE, LARGE — a click on a figure's miniature: the text and the
  notes fade out, then the miniature grows into the large figure in
  their place (ArticleLightbox, which also says when the text must be
  out of the way: `textHidden`). From there all the figures of the
  article can be browsed (Previous, Next, the arrow keys). Close, a
  click elsewhere or Esc, and the figure on view shrinks back onto its
  miniature, then the text returns — at the passage that names it.

  DOWNLOAD, CITE — two words at the bottom of the band, above the footer
  (ArticleActions): the link to the article's PDF and a button that
  copies how to cite it. Mobile: after the text and its notes.

  NOTES — on the band, at the bottom, above those two words (4 units):
  a note is there only while its number in the text is on the screen
  (ArticleNotes; the text says which numbers are on view). Mobile: all
  the notes after the text instead.
  Two lines of space between these blocks. All together:

  TEXT — in the space to the right of the band, as the news texts and
  the About text: one column after the band, 18 columns wide, starting
  at the height of the band's content (--edge) — the text itself 16
  columns, two fewer than head and abstract; a long text scrolls the
  whole height of the screen, with 12 units of space after its last line.

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
  above the title (the band is the header there).
-->
<script lang="ts">
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

  let {data} = $props();
  let onView = $state<number[]>([]); // the note numbers on the screen
  let titleOnView = $state(true); // the title in the text is on the screen
  let lightbox: ArticleLightbox;
  // The figures of the article, in the order of their letters (the gallery)
  const figures = $derived(
    (data.contribution.body ?? [])
      .flatMap((b) => (typeof b === 'object' && 'figure' in b ? [b.figure] : []))
      .toSorted((a, b) => a.label.localeCompare(b.label))
  );
  let textHidden = $state(false); // a figure is shown large, in place of the text
  let swapped = $state(false); // a figure has been opened: from then on the text comes back at once
</script>

<Panel area="band" inset class="on-band from-top">
  <div class="head fade" out:leave|global>
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
        <div class="band-notes fade" class:now={swapped} class:is-hidden={textHidden}>
          <ArticleNotes notes={data.contribution.notes} only={onView} />
        </div>
      {/if}
      <ArticleActions pdf={data.contribution.pdf} citation={data.citation} />
    </div>
  </Panel>
{/if}

<Panel area="rest" class="on-ground from-top">
  <article
    class="fade"
    class:now={swapped}
    class:is-hidden={textHidden}
    style:--text-cols={TEXT_COLUMNS}
    out:leave|global
  >
    <!-- Mobile only: on desktop the people are on the band -->
    <p class="label people-mobile">{data.authors.join(', ')}</p>
    {#if !data.issue.publication.forthcoming}
      <ArticleHeader title={data.contribution.title} onview={(visible) => (titleOnView = visible)} />
      {#if data.contribution.abstract}
        <ArticleAbstract text={data.contribution.abstract} />
      {/if}
      {#if data.contribution.body}
        <ArticleBody
          blocks={data.contribution.body}
          notes={data.contribution.notes}
          onview={(numbers) => (onView = numbers)}
          onfigure={(figure, miniature) => ((swapped = true), lightbox.show(figure, miniature))}
        />
      {/if}
      <!-- Mobile only: on desktop they are on the band -->
      <div class="actions-mobile">
        <ArticleActions pdf={data.contribution.pdf} citation={data.citation} />
      </div>
    {/if}
  </article>
</Panel>

<ArticleLightbox bind:this={lightbox} {figures} bind:hidden={textHidden} />

<!-- The word that stands for the pointer on the figures (Open, Close, Previous, Next) -->
<PointerWord />

<style>
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
      margin-bottom: calc(-6 * var(--u)); /* 2 units to the title, as a label */
      color: var(--ink-quiet);
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
