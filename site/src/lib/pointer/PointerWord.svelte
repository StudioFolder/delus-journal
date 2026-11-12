<!--
  Draws the word that stands for the pointer (see word.svelte.ts): in
  the small Styrene, full ink, centred on the pointer, coming and going
  softly (--hover). Put it once on a page that uses `use:word`.
-->
<script lang="ts">
  import {pointer} from './word.svelte.ts';

  // The last word stays while it fades out
  let last = $state('');
  $effect(() => {
    if (pointer.word) last = pointer.word;
  });
</script>

<span class="pointer" class:is-on={pointer.word} style:left="{pointer.x}px" style:top="{pointer.y}px" aria-hidden="true"
  >{last}</span
>

<style>
  .pointer {
    position: fixed;
    z-index: 2;
    transform: translate(-50%, -50%);
    font: var(--type-ui);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--hover);
  }
  .pointer.is-on {
    opacity: 1;
  }
</style>
