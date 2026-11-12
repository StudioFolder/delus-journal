<!--
  Inline pieces of text (see Inline in #lib/data/fixtures.ts) — a block
  of an article, a note, an issue's abstract: plain text and italics,
  with acronyms in small capitals — not in Styrene B (quotes:
  sc={false}).
  A note reference: its number in Styrene B, in the font's own superior
  figures (drawn small and raised: nothing is scaled or shifted), in the
  quote's size; it adds nothing to the height of its line. The notes
  themselves: ArticleNotes.
-->
<script lang="ts">
  import Acronyms from '#lib/type/Acronyms.svelte';
  import type {Inline} from '#lib/data/fixtures.ts';

  let {parts, sc = true}: {parts: string | Inline[]; sc?: boolean} = $props();
  const list = $derived(typeof parts === 'string' ? [parts] : parts);
</script>

{#snippet text(t: string)}{#if sc}<Acronyms text={t} />{:else}{t}{/if}{/snippet}
{#each list as part, i (i)}{#if typeof part === 'string'}{@render text(part)}{:else if 'em' in part}<em>{@render text(part.em)}</em>{:else}<sup class="ref" data-note={part.note}>{part.note}</sup>{/if}{/each}

<style>
  .ref {
    font: var(--type-quote);
    font-feature-settings: 'sups';
    line-height: 0;
    vertical-align: baseline;
    letter-spacing: 0.02em;
  }
</style>
