<!--
  The notes of an article, as a list: each one opened by its number in
  full ink, its text quiet, in the small Styrene (--type-ui); one unit
  between notes. Italics as in the text (Inlines), no small capitals.
  - All of them (mobile: after the text), or
  - `only`: the ones with these numbers (desktop: on the band, the notes
    whose numbers are on the screen). A note fades in and out as every
    appearing and disappearing element (FADE in styles.css: same
    durations); the notes that stay slide to their new place.
-->
<script lang="ts">
  import {fade} from 'svelte/transition';
  import {flip} from 'svelte/animate';
  import {time} from '#lib/motion/time.ts';
  import Inlines from './Inlines.svelte';
  import type {Inline} from '#lib/data/fixtures.ts';

  let {notes, only}: {notes: Inline[][]; only?: number[]} = $props();
  const numbers = $derived(only ?? notes.map((_, i) => i + 1));

  const appear = (node: Element) => fade(node, {duration: time('--fade-time')});
  const vanish = (node: Element) => fade(node, {duration: time('--fade-out-time')});
  const slide = (node: Element, rects: {from: DOMRect; to: DOMRect}) =>
    flip(node, rects, {duration: time('--fade-time')});
</script>

<ol class="notes">
  {#each numbers as n (n)}
    <li in:appear out:vanish animate:slide>
      <span class="n">{n}</span>
      <Inlines parts={notes[n - 1]} sc={false} />
    </li>
  {/each}
</ol>

<style>
  .notes {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--u);
    font: var(--type-ui);
    letter-spacing: normal;
    color: var(--ink-quiet);
  }
  .n {
    color: var(--ink);
  }
</style>
