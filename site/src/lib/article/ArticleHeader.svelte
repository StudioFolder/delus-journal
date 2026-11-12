<!--
  The head of a contribution (an "article"): its title in Styrene B
  (--type-title), which reads a step larger than the text. (Its people
  are on the band: see the page.)
  It tells the page whether the title is on the screen (`onview`), so
  the band can show it once it has scrolled away.
-->
<script lang="ts">
  import {onMount} from 'svelte';

  let {title, onview}: {title: string; onview?: (visible: boolean) => void} = $props();

  let heading: HTMLElement;
  onMount(() => {
    const watch = new IntersectionObserver(([entry]) => onview?.(entry.isIntersecting));
    watch.observe(heading);
    return () => watch.disconnect();
  });
</script>

<header>
  <h1 bind:this={heading}>{title}</h1>
</header>

<style>
  h1 {
    margin: 0;
    font: var(--type-title);
    letter-spacing: 0.02em;
  }
</style>
