<!--
  Sets a text with its acronyms in small capitals (maiuscoletto):
  every run of two or more capital letters — DELUS, LUS, ETH — and every
  single capital letter standing alone, as in (FIG. A, B) — but not when
  a word follows it ("A landscape", "I am"), nor before a full stop or a
  hyphen (initials: "O. Martins"; "T-shirt"). "and"/"or" don't count as
  a following word: in "A and B" both letters are small capitals.
  Use it for running text in Louize: <Acronyms text={…} />
  The letters stay capitals in the page itself (for copying, search and
  screen readers); only their drawing changes (.sc in styles.css).
-->
<script lang="ts">
  let {text}: {text: string} = $props();
  // Split so that the odd parts are the acronyms
  const acronyms =
    /(\p{Lu}{2,}|(?<![\p{L}\p{N}'’.-])\p{Lu}(?![\p{L}\p{N}.'’-])(?!\s+(?!(?:and|or)\b)\p{L}))/u;
  const parts = $derived(text.split(acronyms));
</script>

{#each parts as part, i}{#if i % 2}<span class="sc">{part}</span>{:else}{part}{/if}{/each}
