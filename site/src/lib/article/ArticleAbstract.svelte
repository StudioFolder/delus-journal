<!--
  The abstract of a contribution (an "article"), its own block between
  the head and the text (Sanity: the contribution's `abstract`). For now
  set as the text (ArticleBody) — kept apart so it can be styled
  differently later.
-->
<script lang="ts">
  import Acronyms from '#lib/type/Acronyms.svelte';

  let {text}: {text: string} = $props();
</script>

<p class="abstract display"><Acronyms {text} /></p>
