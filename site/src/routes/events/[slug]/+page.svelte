<!--
  A news item: its date, title and text beside the band, 18 columns
  starting one column after it (Panel area="beside"), at the height of the
  list. The list stays on the band (../+layout.svelte).
  The date (12.11.2026) in small capitals, quiet, above the title, as the
  issue number above an abstract; title and text in the display type, one
  line (4 units) between paragraphs. Only items with a text show anything
  (one, for now).

  Opening from the list, the text appears as soon as the previous one has
  faded out (`.fade.next`); arriving from another page, it waits for the
  band like everything else.

  MOBILE — the text replaces the list under the header.
-->
<script lang="ts">
  import {getContext} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import {TEXT_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {fullDate} from '#lib/data/format.ts';
  import Acronyms from '#lib/type/Acronyms.svelte';

  let {data} = $props();
  const post = $derived(data.post);
  const listOnView = getContext<() => boolean>('news:live');
</script>

<Panel area="beside" cols={TEXT_COLUMNS} class="on-ground from-top">
  <!-- Keyed: going from one news item to another replaces the text -->
  {#key post.slug}
    {#if post.body}
      <article class="fade" class:next={listOnView()} out:leave|global>
        <header class="labelled">
          <time class="label" datetime={post.date}>{fullDate(post.date)}</time>
          <h1 class="display"><Acronyms text={post.title} /></h1>
        </header>
        {#each post.body as paragraph, i (i)}
          <p class="display"><Acronyms text={paragraph} /></p>
        {/each}
      </article>
    {/if}
  {/key}
</Panel>

<style>
  article {
    width: 100%;
    display: grid;
    gap: calc(4 * var(--u));
  }
  time {
    color: var(--ink-quiet);
  }
  h1 {
    margin: 0;
    font-weight: inherit;
  }
</style>
