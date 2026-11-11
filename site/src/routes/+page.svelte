<!--
  Home. The band for this URL is set in #lib/grid/layouts.ts: Large, and
  Medium while the pointer is on the image.

  - The statement sits at the top of the band, under the menu, one column
    in from each side. Its width follows the band as it resizes; the type
    size stays the same and the lines re-break.
  - The issue on view sits at the bottom of the band, above the footer:
    its number in small capitals, then its abstract. Same width and type
    as the statement.
  - The image sits on the background: columns 22–34, centred vertically,
    in the proportions of the book cover. For now an empty box.

  INTRO — the first time the home page is shown in a visit:
    1. the statement appears word by word, in the middle of the band;
    2. a short pause;
    3. the page moves up as if it were scrolling: the statement rises to
       its place at the top of the band while the issue's abstract comes
       up from below, the same distance, fading in on the way;
    4. the image fades in once they have arrived.
  Later visits to the page show the final state directly. Timings are in
  styles.css (--word-time, --word-step, --intro-pause, --rise). Skipped when the visitor has asked for reduced motion.
-->
<script lang="ts">
  import {onDestroy} from 'svelte';
  import {afterNavigate} from '$app/navigation';
  import Panel from '#lib/grid/Panel.svelte';
  import {focus} from '#lib/grid/focus.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {hasPlayed, markPlayed} from '#lib/motion/once.ts';
  import {time} from '#lib/motion/time.ts';
  import {home} from '#lib/data/fixtures.ts';

  // waiting: hidden, about to start · words: appearing in the middle ·
  // rising: moving to the top · done: the final state
  let phase = $state<'waiting' | 'words' | 'rising' | 'done'>(
    hasPlayed('home-intro') ? 'done' : 'waiting'
  );
  let statement: HTMLElement;
  const words = home.statement.split(' ');
  let drop = $state(0); // how far below their final places statement and issue start (px)
  let imageShown = $state(hasPlayed('home-intro'));
  let wait = $state(0); // before the first word: time for the band to arrive (ms)

  const timers: ReturnType<typeof setTimeout>[] = [];
  const after = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));
  let left = false;
  onDestroy(() => {
    left = true;
    timers.forEach(clearTimeout);
  });

  afterNavigate(async (navigation) => {
    if (phase !== 'waiting') return;
    markPlayed('home-intro');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      imageShown = true;
      return void (phase = 'done');
    }

    await document.fonts.ready; // the statement's height changes when the fonts arrive
    if (left) return;

    // Measure the statement in its final place, then start it in the middle
    const text = statement.getBoundingClientRect();
    const panel = statement.parentElement!.getBoundingClientRect();
    drop = panel.top + panel.height / 2 - (text.top + text.height / 2);
    // Arriving from another page, the band moves first
    wait = navigation.type === 'enter' ? 0 : time('--move-time');
    phase = 'words';

    const shown = wait + (words.length - 1) * time('--word-step') + time('--word-time');
    const rise = shown + time('--intro-pause');
    const arrived = rise + time('--rise-time');
    after(rise, () => (phase = 'rising'));
    after(arrived, () => (phase = 'done'));
    // The image waits for the movement to end, like everything that appears;
    // its own fade already waits --move-time, so it is released that much earlier
    after(arrived - time('--move-time'), () => (imageShown = true));
  });

  const playing = $derived(phase === 'words' || phase === 'rising');
  const below = $derived(phase === 'waiting' || phase === 'words'); // before the rise
</script>

<svelte:head>
  <!-- Without JavaScript there is no intro: show everything -->
  <noscript>
    <style>
      .statement,
      .issue,
      .image {
        opacity: 1 !important;
      }
    </style>
  </noscript>
</svelte:head>

<Panel span={[22, 34]} class="on-ground">
  <div class="image fade" class:is-hidden={!imageShown} use:focus out:leave|global></div>
</Panel>

<Panel area="band" inset class="on-band from-bottom">
  <div
    class="issue"
    class:fade={phase === 'done'}
    class:is-below={below}
    class:is-rising={phase === 'rising'}
    style:transform={below ? `translateY(${drop}px)` : undefined}
    out:leave|global
  >
    <p class="label">{home.issue.label}</p>
    <p class="large">{home.issue.abstract}</p>
  </div>
</Panel>

<Panel area="band" inset class="on-band from-top">
  <p
    bind:this={statement}
    class="statement"
    class:fade={phase === 'done'}
    class:is-waiting={phase === 'waiting'}
    class:is-rising={phase === 'rising'}
    style:transform={below ? `translateY(${drop}px)` : undefined}
    out:leave|global
  >
    {#if playing}
      {#each words as word, n}
        <span class="word" style="--n: {n}; --wait: {wait}ms">{word}</span>{' '}
      {/each}
    {:else}{home.statement}{/if}
  </p>
</Panel>

<style>
  .statement,
  .large {
    font: var(--type-display);
    letter-spacing: 0.02em;
  }
  .issue {
    display: grid;
    gap: calc(2 * var(--u));
  }

  /* Intro */
  .statement.is-waiting {
    opacity: 0;
  }
  .issue.is-below {
    opacity: 0;
    pointer-events: none;
  }
  .statement.is-rising,
  .issue.is-rising {
    transition:
      transform var(--rise),
      opacity var(--rise);
  }
  .word {
    animation: word-in var(--word-time) ease-in-out both;
    animation-delay: calc(var(--wait) + var(--n) * var(--word-step));
  }
  @keyframes word-in {
    from {
      opacity: 0;
    }
  }

  /* Placeholder: the image will fill this box */
  .image {
    width: 100%;
    aspect-ratio: 518 / 626; /* the book cover */
    background: var(--band);
  }

  /* Mobile: no image or issue yet — the mobile home page is still to be laid out */
  @media (max-width: 767px) {
    .image,
    .issue {
      display: none;
    }
  }
</style>
