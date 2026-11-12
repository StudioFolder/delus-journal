<!--
  What a reader can do with an article — two words, pure text, in the
  small Styrene (--type-ui), quiet → full ink under the pointer (.hover),
  one per line, one unit apart:
  - Download: the link to the article's PDF (`pdf`). Without one it is
    there but does nothing (for now: no article has its PDF yet).
  - Cite: copies the citation (`citation`) to the clipboard; the word
    then reads "Copied" for a moment (Cite.svelte).
-->
<script lang="ts">
  import {opens} from '#lib/type/links.ts';
  import Cite from './Cite.svelte';

  let {pdf, citation}: {pdf?: string; citation: string} = $props();
</script>

<p class="actions">
  <span class="hover">
    {#if pdf}<a href={pdf} {...opens(pdf)}>Download</a>{:else}<span class="none">Download</span>{/if}
  </span>
  <Cite {citation} />
</p>

<style>
  .actions {
    display: grid;
    justify-items: start;
    gap: var(--u);
    font: var(--type-ui);
  }
  .none {
    cursor: default;
  }
</style>
