<!--
  A block's inline pieces (see Inline in #lib/data/fixtures.ts): plain
  text and italics, with acronyms in small capitals — not in Styrene B
  (quotes: sc={false}). Note references are not shown yet (footnotes:
  next step).
-->
<script lang="ts">
  import Acronyms from '#lib/type/Acronyms.svelte';
  import type {Inline} from '#lib/data/fixtures.ts';

  let {parts, sc = true}: {parts: string | Inline[]; sc?: boolean} = $props();
  const list = $derived(typeof parts === 'string' ? [parts] : parts);
</script>

{#snippet text(t: string)}{#if sc}<Acronyms text={t} />{:else}{t}{/if}{/snippet}
{#each list as part, i (i)}{#if typeof part === 'string'}{@render text(part)}{:else if 'em' in part}<em>{@render text(part.em)}</em>{/if}{/each}
