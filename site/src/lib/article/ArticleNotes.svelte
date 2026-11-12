<!--
  The notes of an article, as a list: each one opened by its number in
  the small Styrene (--type-ui), full ink; its text in Louize
  (--type-note), quiet, with italics and acronyms in small capitals as
  in the text (Inlines); one unit between notes.
  As in the printed issues, the text of a note starts at a fixed distance
  from the left (3 units), whatever the width of its number — a wider
  space than between words; its other lines start at the left.
  - All of them (mobile: after the text), or
  - `only`: the ones with these numbers (desktop: on the band, the notes
    whose numbers are on the screen). A change goes in three steps,
    one after the other, so that nothing ever crosses anything else:
      1. the notes that leave fade out, where they are;
      2. the notes that stay slide to their new place;
      3. the new notes fade in, in the room that has been made.
    A step with nothing to do is skipped. The durations are the ones of
    every appearing and disappearing element (FADE in styles.css). What
    is asked for while a change is going on is done after it.
  - `room` (with `only`): the height there is for them, in pixels. Only
    as many notes as fit in it are shown, whole, in their order: the
    ones that don't fit wait until the ones before them have gone. A
    note too long to fit even alone is shown up to the last line there
    is room for, ending in "…". (The height of each note is read from a
    copy of the whole list, set at the same width and never seen.)
-->
<script lang="ts">
  import {onMount, tick, untrack} from 'svelte';
  import {time} from '#lib/motion/time.ts';
  import Inlines from './Inlines.svelte';
  import type {Inline} from '#lib/data/fixtures.ts';

  let {notes, only, room}: {notes: Inline[][]; only?: number[]; room?: number} = $props();

  // How high each note is, and the space between two (see `room`)
  let copy = $state<HTMLElement>();
  let heights = $state<number[]>([]);
  let gap = 0;
  let line = 0; // the height of a line of a note
  onMount(() => {
    if (!copy) return;
    const list = copy;
    const size = () => {
      gap = parseFloat(getComputedStyle(list).rowGap) || 0;
      line = parseFloat(getComputedStyle(list).lineHeight) || 0;
      heights = [...list.children].map((note) => (note as HTMLElement).offsetHeight);
    };
    size();
    const watch = new ResizeObserver(size);
    watch.observe(list);
    document.fonts?.ready.then(size);
    return () => watch.disconnect();
  });

  const numbers = $derived.by(() => {
    const all = only ?? notes.map((_, i) => i + 1);
    if (!only || room === undefined || !heights.length) return all;
    const fit: number[] = [];
    let used = 0;
    for (const n of all) {
      used += heights[n - 1] + (fit.length ? gap : 0);
      if (used > room && fit.length) break;
      fit.push(n);
    }
    return fit;
  });
  // FROM ONE SET OF NOTES TO THE NEXT (see the three steps above).
  // `shown`: the notes in the list; `faint`: the ones of them that are
  // not visible (leaving, or not yet arrived).
  let list = $state<HTMLElement>();
  let shown = $state<number[]>([]);
  // The first note alone doesn't fit: how many of its lines do
  const lines = $derived(
    only && room !== undefined && line && shown.length === 1 && heights[shown[0] - 1] > room
      ? Math.max(1, Math.floor(room / line))
      : undefined
  );
  let faint = $state<number[]>([]);
  let busy = false;
  let alive = true;
  const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));
  const frame = () => new Promise((done) => requestAnimationFrame(() => done(null)));
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tops = () =>
    new Map(
      [...(list?.children ?? [])].map((note) => [
        Number((note as HTMLElement).dataset.n),
        note.getBoundingClientRect().top
      ])
    );

  async function follow() {
    if (busy) return;
    busy = true;
    while (alive && numbers.join() !== shown.join()) {
      const next = numbers;
      const leaving = shown.filter((n) => !next.includes(n));
      const arriving = next.filter((n) => !shown.includes(n));
      // 1. out
      if (leaving.length) {
        faint = leaving;
        await wait(time('--fade-out-time'));
      }
      // 2. the ones that stay go to their new place
      const before = tops();
      shown = next;
      faint = arriving;
      await tick();
      const after = tops();
      const moved = [...(list?.children ?? [])].flatMap((note) => {
        const n = Number((note as HTMLElement).dataset.n);
        const by = (before.get(n) ?? NaN) - (after.get(n) ?? NaN);
        return by ? [{note: note as HTMLElement, by}] : []; // (NaN: a new note)
      });
      if (moved.length && !still()) {
        for (const {note, by} of moved) {
          note.style.transition = 'none';
          note.style.transform = `translateY(${by}px)`;
        }
        await frame();
        for (const {note} of moved) {
          note.style.transition = 'transform var(--fade-time) ease';
          note.style.transform = '';
        }
        await wait(time('--fade-time'));
        for (const {note} of moved) note.style.transition = '';
      } else await frame();
      // 3. in
      if (arriving.length) {
        faint = [];
        await wait(time('--fade-time'));
      }
    }
    busy = false;
  }
  $effect(() => {
    numbers;
    if (only) untrack(follow);
  });
  onMount(() => () => (alive = false));
</script>

<div class="within">
  <ol class="notes" bind:this={list}>
    {#each only ? shown : numbers as n (n)}
      <li class:cut={lines} class:faint={faint.includes(n)} style:--lines={lines} data-n={n}>
        <span class="n">{n}</span><Inlines parts={notes[n - 1]} />
      </li>
    {/each}
  </ol>
  {#if only}
    <ol class="notes copy" aria-hidden="true" inert bind:this={copy}>
      {#each notes as note, i (i)}
        <li><span class="n">{i + 1}</span><Inlines parts={note} /></li>
      {/each}
    </ol>
  {/if}
</div>

<style>
  .within {
    position: relative;
  }
  /* The copy that is only measured: as wide as the list, never seen */
  .copy {
    position: absolute;
    inset: auto 0 0;
    visibility: hidden;
    pointer-events: none;
  }
  /* A note cut after the lines there is room for (--lines), with "…" */
  .cut {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--lines);
    line-clamp: var(--lines);
    overflow: hidden;
  }
  /* A note comes and goes as every element (FADE in styles.css) */
  li {
    transition: opacity var(--fade-time) ease;
  }
  .faint {
    opacity: 0;
    transition-duration: var(--fade-out-time);
  }
  .notes {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--u);
    font: var(--type-note);
    letter-spacing: normal;
    color: var(--ink-quiet);
  }
  .n {
    display: inline-block;
    width: calc(3 * var(--u)); /* the note's text starts here, as after a tab */
    font: var(--type-ui);
    color: var(--ink);
  }
</style>
