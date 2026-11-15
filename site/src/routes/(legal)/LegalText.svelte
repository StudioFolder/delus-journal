<!--
  Imprint or Privacy, the page's text in the space to the right of the
  band, laid out as a news text (see events/NewsText.svelte — same
  place, width and spacing; no snapping: each is a page of its own):
  the title, then the text in the display type, one line (4 units)
  between blocks. A heading opens a
  section: in small capitals, quiet, over its first paragraph (as the
  date over a news title).
  LAST UPDATED (Privacy): the day the page was last published in the CMS,
  as a last section, written by the site (November 13, 2026).
-->
<script lang="ts">
  import type {LegalPage} from '#lib/data/fixtures.ts';
  import Panel from '#lib/grid/Panel.svelte';
  import {TEXT_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import Inlines from '#lib/article/Inlines.svelte';
  import {longDate} from '#lib/data/format.ts';

  let {text}: {text: LegalPage} = $props();

  // Each heading with the paragraphs that follow it, until the next heading
  type Paragraph = Exclude<LegalPage['body'][number], {heading: string}>;
  const sections = $derived(
    text.body.reduce<{heading?: string; paragraphs: Paragraph[]}[]>((all, block) => {
      if (typeof block === 'object' && 'heading' in block) all.push({heading: block.heading, paragraphs: []});
      else (all.at(-1) ?? all[all.push({paragraphs: []}) - 1]).paragraphs.push(block);
      return all;
    }, [])
  );
</script>

<Panel area="rest" class="on-ground from-top">
  <article class="fade" style:--text-cols={TEXT_COLUMNS} out:leave|global>
    <h2 class="display">{text.title}</h2>
    {#each sections as section, i (i)}
      <section>
        {#if section.heading}<h3 class="label">{section.heading}</h3>{/if}
        {#each section.paragraphs as paragraph, j (j)}
          <p class="display"><Inlines parts={paragraph} /></p>
        {/each}
      </section>
    {/each}
    {#if text.updated}
      <section>
        <h3 class="label">Last updated</h3>
        <p class="display"><time datetime={text.updated}>{longDate(text.updated)}</time></p>
      </section>
    {/if}
  </article>
</Panel>

<style>
  article {
    width: 100%;
    padding: var(--edge) 0 calc(12 * var(--u)) var(--col);
    display: grid;
    grid-template-columns: calc(var(--text-cols) * var(--col));
    align-content: start;
    gap: calc(4 * var(--u));
  }
  section {
    display: grid;
    gap: calc(4 * var(--u));
  }
  h2,
  h3 {
    margin: 0;
    font-weight: inherit;
  }
  /* 2 units over its paragraph, as a label over its text (.labelled) */
  h3 {
    color: var(--ink-quiet);
    margin-bottom: calc(-2 * var(--u));
  }

  @media (max-width: 767px) {
    article {
      padding-left: 0;
      grid-template-columns: 100%;
    }
  }
</style>
