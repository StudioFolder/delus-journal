<!--
  Cite: a word that copies a citation to the clipboard; it then reads
  "Copied" for a moment (--copied-time), in full ink. Quiet → full ink
  under the pointer (.hover), in the type of where it stands. On an
  article (ArticleActions) and on an issue's page.
  `class` and `i`: for the element around the word, e.g. `fade` and its
  place in a cascade.
-->
<script lang="ts">
  import {onDestroy} from 'svelte';
  import {time} from '#lib/motion/time.ts';

  let {citation, class: klass = '', i}: {citation: string; class?: string; i?: number} = $props();

  let copied = $state(false);
  let back: ReturnType<typeof setTimeout>;
  async function cite() {
    try {
      await navigator.clipboard.writeText(citation);
    } catch {
      return; // the browser refused: nothing was copied, so nothing is claimed
    }
    copied = true;
    clearTimeout(back);
    back = setTimeout(() => (copied = false), time('--copied-time'));
  }
  onDestroy(() => clearTimeout(back));
</script>

<span class="hover {klass}" class:active={copied} style:--i={i}>
  <button type="button" onclick={cite} aria-live="polite">{copied ? 'Copied' : 'Cite'}</button>
</span>

<style>
  button {
    cursor: pointer;
  }
</style>
