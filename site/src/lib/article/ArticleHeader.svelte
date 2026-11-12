<!--
  The head of a contribution (an "article"): its title in Styrene B
  (--type-title), which reads a step larger than the text. (Its people
  are on the band: see the page.)
-->
<script lang="ts">
  let {title}: {title: string} = $props();
</script>

<header>
  <h1>{title}</h1>
</header>

<style>
  h1 {
    margin: 0;
    font: var(--type-title);
    letter-spacing: 0.02em;
  }
</style>
