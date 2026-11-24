<!--
  The abstract of a contribution (an "article"), its own block between
  the head and the text (Sanity: the contribution's `abstract`). For now
  set in the large type (.display) — kept apart so it can be styled
  differently later.
-->
<script lang="ts">
  import Inlines from './Inlines.svelte';
  import type {Inline} from '#lib/data/fixtures.ts';

  // plain, or pieces when it has italics
  let {text}: {text: string | Inline[]} = $props();
</script>

<p class="abstract display"><Inlines parts={text} /></p>
