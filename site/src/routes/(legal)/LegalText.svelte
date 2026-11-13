<!--
  Imprint or Privacy, in the column of texts (+layout.svelte): a page as
  tall as the screen, as a news text (see events/NewsText.svelte — same
  place, width, spacing and snapping): the title, then the text in the
  display type, one line (4 units) between blocks. A heading opens a
  section: in small capitals, quiet, over its first paragraph (as the
  date over a news title).
-->
<script lang="ts">
  import type {LegalPage} from '#lib/data/fixtures.ts';
  import Inlines from '#lib/article/Inlines.svelte';

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

<article data-slug={text.slug}>
  <h2 class="display">{text.title}</h2>
  {#each sections as section, i (i)}
    <section>
      {#if section.heading}<h3 class="label">{section.heading}</h3>{/if}
      {#each section.paragraphs as paragraph, j (j)}
        <p class="display"><Inlines parts={paragraph} /></p>
      {/each}
    </section>
  {/each}
</article>

<style>
  article {
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    scroll-snap-align: start;
    scroll-snap-stop: always; /* one item per scroll gesture */
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
