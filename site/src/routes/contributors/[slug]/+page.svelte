<!--
  A contribution (an "article") — reached for now from a name in the
  contributors list. Built step by step; so far its head and its text.
  The band for this URL (Small) is set in #lib/grid/layouts.ts.

  PEOPLE — on the band, at the top (as the content of other bands): one
  name per line, in the running text type, as in the Figma layout.

  HEAD — its title in Styrene B (ArticleHeader), level with the first
  name; then, if it has one, the abstract (ArticleAbstract,
  for now in the same type as the text); then, if it has one, the text
  (ArticleBody: paragraphs, quotes, chapter titles; two essays of
  Issue 01 so far).

  NOTES — on the band, at the bottom (as the abstracts of other bands):
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

  MOBILE — one column under the header; the people in small capitals
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

  let {data} = $props();
  let onView = $state<number[]>([]); // the note numbers on the screen
</script>

<Panel area="band" inset class="on-band from-top">
  <ul class="people fade" out:leave|global>
    {#each data.authors as name (name)}
      <li>{name}</li>
    {/each}
  </ul>
</Panel>

{#if data.contribution.notes && !data.issue.publication.forthcoming}
  <Panel area="band" inset class="on-band from-bottom">
    <div class="notes fade" out:leave|global>
      <ArticleNotes notes={data.contribution.notes} only={onView} />
    </div>
  </Panel>
{/if}

<Panel area="rest" class="on-ground from-top">
  <article class="fade" style:--text-cols={TEXT_COLUMNS} out:leave|global>
    <!-- Mobile only: on desktop the people are on the band -->
    <p class="label people-mobile">{data.authors.join(', ')}</p>
    {#if !data.issue.publication.forthcoming}
      <ArticleHeader title={data.contribution.title} />
      {#if data.contribution.abstract}
        <ArticleAbstract text={data.contribution.abstract} />
      {/if}
      {#if data.contribution.body}
        <ArticleBody
          blocks={data.contribution.body}
          notes={data.contribution.notes}
          onview={(numbers) => (onView = numbers)}
        />
      {/if}
    {/if}
  </article>
</Panel>

<style>
  .people {
    padding: 0;
    list-style: none;
    font: var(--type-text);
  }
  .people-mobile {
    display: none;
  }
  .notes {
    width: 100%;
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

  @media (max-width: 767px) {
    .people,
    .notes {
      display: none;
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
