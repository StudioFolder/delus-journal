<!--
  Sets a text with its acronyms in small capitals (maiuscoletto):
  every run of two or more capital letters — DELUS, LUS, ETH.
  Use it for running text in Louize: <Acronyms text={…} />
  The letters stay capitals in the page itself (for copying, search and
  screen readers); only their drawing changes (.sc in styles.css).
-->
<script lang="ts">
  let {text}: {text: string} = $props();
  // Split so that the odd parts are the acronyms
  const parts = $derived(text.split(/(\p{Lu}{2,})/u));
</script>

{#each parts as part, i}{#if i % 2}<span class="sc">{part}</span>{:else}{part}{/if}{/each}
