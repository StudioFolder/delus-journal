<!--
  Home. The band for this URL is set in #lib/grid/layouts.ts: Large (it
  no longer changes while the pointer is on the image — Marco, 13 Nov).

  - The statement sits at the top of the band, under the menu, one column
    in from each side. Its width follows the band as it resizes; the type
    size stays the same and the lines re-break.
  - The highlight on view sits at the bottom of the band, above the
    footer: a label in small capitals (e.g. the issue number), then a
    text (its abstract). Same width and type as the statement.
  - Its image sits on the background, in the middle of the space to the
    right of the band (13 columns wide), in the proportions of the book
    cover. For now an empty box. It follows the band: when the band
    shrinks, the image moves to the middle of the larger space.

  HIGHLIGHTS — the home page shows a series of them, one at a time
  (fixtures.ts for now; later chosen by the editors). Scrolling moves to
  the next or the previous one: text and image fade out, then the new
  ones fade in; the statement stays. One scroll gesture = one step; also
  the up/down arrow keys, Page Up/Down, and a swipe on touch screens.

  MOBILE — one column that scrolls in the ordinary way, under the header:
  the statement, then every highlight in turn (label, text, image). No
  steps and no fades between highlights; the intro plays the same way,
  with the first highlight coming up from below.

  INTRO — the first time the home page is shown in a visit:
    1. the statement appears word by word, in the middle of the band;
    2. a short pause;
    3. the page moves up as if it were scrolling: the statement rises to
       its place at the top of the band while the first highlight comes
       up from below, the same distance, fading in on the way;
    4. the image fades in once they have arrived.
  Later visits to the page show the final state directly. Timings are in
  styles.css (--word-time, --word-step, --intro-pause, --rise). Skipped
  when the visitor has asked for reduced motion.
-->
<script lang="ts">
  import {onDestroy} from 'svelte';
  import {afterNavigate} from '$app/navigation';
  import Panel from '#lib/grid/Panel.svelte';
  import {COVER_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {hasPlayed, markPlayed} from '#lib/motion/once.ts';
  import {time} from '#lib/motion/time.ts';
  import {still} from '#lib/motion/still.ts';
  import {STEP, steps} from '#lib/motion/wheel.ts';
  import {home} from '#lib/data/fixtures.ts';
  import Acronyms from '#lib/type/Acronyms.svelte';
  import Inlines from '#lib/article/Inlines.svelte';

  // waiting: hidden, about to start · words: appearing in the middle ·
  // rising: moving to the top · done: the final state
  let phase = $state<'waiting' | 'words' | 'rising' | 'done'>(
    hasPlayed('home-intro') ? 'done' : 'waiting'
  );
  let statement: HTMLElement;
  let column: HTMLElement;
  const words = home.statement.split(' ');
  let drop = $state(0); // how far below their final places statement and highlight start (px)
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
    if (still()) {
      imageShown = true;
      return void (phase = 'done');
    }

    await document.fonts.ready; // the statement's height changes when the fonts arrive
    if (left) return;

    // Measure the statement in its final place, then start it in the middle
    const text = statement.getBoundingClientRect();
    // The space between the menu (or, on phones, the header) and the bottom;
    // on phones the panel also runs under the header
    const panel = column.parentElement!.getBoundingClientRect();
    const top = innerWidth < 768 ? document.querySelector('.band-bg')!.getBoundingClientRect().bottom : panel.top;
    drop = (top + panel.bottom) / 2 - (text.top + text.height / 2);
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

  // ---------- Highlights ----------
  const highlights = home.highlights;
  let at = $state(0); // the highlight on view
  let swapping = $state(false); // one highlight is replacing another
  let hidden = $state(false); // text and image faded out, between two highlights

  // Round and round: after the last comes the first, before the first the last
  function go(step: 1 | -1) {
    const next = (at + step + highlights.length) % highlights.length;
    if (phase !== 'done' || swapping || highlights.length < 2) return;
    if (innerWidth < 768) return; // mobile shows them all, one after another: no steps
    swapping = true;
    hidden = true;
    const out = time('--fade-out-time');
    after(out, () => {
      at = next;
      hidden = false;
    });
    after(out + time('--fade-time'), () => (swapping = false));
  }

  // One scroll gesture = one step (motion/wheel.ts)
  const stepper = steps(go);
  const onwheel = stepper.wheel;
  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') go(1);
    if (e.key === 'ArrowUp' || e.key === 'PageUp') go(-1);
  }
  let touchY = 0;
  const ontouchstart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
  function ontouchend(e: TouchEvent) {
    const moved = touchY - e.changedTouches[0].clientY;
    if (Math.abs(moved) > STEP) go(moved > 0 ? 1 : -1);
  }
  onDestroy(stepper.stop);

  const playing = $derived(phase === 'words' || phase === 'rising');
  const below = $derived(phase === 'waiting' || phase === 'words'); // before the rise
</script>

<svelte:window {onwheel} {onkeydown} {ontouchstart} {ontouchend} />

<svelte:head>
  <!-- Without JavaScript there is no intro: show everything -->
  <noscript>
    <style>
      .column,
      .highlights,
      .highlight,
      .image {
        opacity: 1 !important;
      }
    </style>
  </noscript>
</svelte:head>

<Panel area="right" cols={COVER_COLUMNS} class="on-ground">
  <div
    class="image cover fade"
    class:now={swapping}
    class:is-hidden={!imageShown || hidden}
    out:leave|global
  ></div>
</Panel>

<Panel area="band" inset class="on-band from-bottom">
  <div
    class="highlight labelled"
    class:fade={phase === 'done'}
    class:now={swapping}
    class:is-hidden={hidden}
    class:is-below={below}
    class:is-rising={phase === 'rising'}
    style:transform={below ? `translateY(${drop}px)` : undefined}
    out:leave|global
  >
    <p class="label">{highlights[at].label}</p>
    <p class="display"><Inlines parts={highlights[at].text} /></p>
  </div>
</Panel>

<!-- The column: on desktop it holds the statement only; on mobile also all
     the highlights, and it scrolls. The intro moves the whole column -->
<Panel area="band" inset class="on-band from-top">
  <div
    bind:this={column}
    class="column"
    class:fade={phase === 'done'}
    class:is-waiting={phase === 'waiting'}
    class:is-rising={phase === 'rising'}
    style:transform={below ? `translateY(${drop}px)` : undefined}
    out:leave|global
  >
    <p bind:this={statement} class="display">
      {#if playing}
        {#each words as word, n}
          <span class="word" style="--n: {n}; --wait: {wait}ms"><Acronyms text={word} /></span>{' '}
        {/each}
      {:else}<Acronyms text={home.statement} />{/if}
    </p>

    <!-- Mobile only -->
    <div class="highlights" class:is-below={below}>
      {#each highlights as highlight}
        <section class="labelled">
          <div class="image cover"></div>
          <p class="label">{highlight.label}</p>
          <p class="display"><Inlines parts={highlight.text} /></p>
        </section>
      {/each}
    </div>
  </div>
</Panel>

<style>
  .column {
    width: 100%;
  }
  .highlights {
    display: none; /* desktop shows one highlight at a time, at the bottom of the band */
  }

  /* Intro */
  .column.is-waiting {
    opacity: 0;
  }
  .highlight.is-below,
  .highlights.is-below {
    opacity: 0;
    pointer-events: none;
  }
  .column.is-rising,
  .highlight.is-rising {
    transition:
      transform var(--rise),
      opacity var(--rise);
  }
  .highlights {
    transition: opacity var(--rise);
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


  /* Mobile: everything in the one scrolling column */
  @media (max-width: 767px) {
    :global(.on-ground) > .image,
    .highlight {
      display: none;
    }
    .column {
      display: grid;
      gap: calc(8 * var(--u));
    }
    .highlights {
      display: grid;
      gap: calc(8 * var(--u));
    }
    /* each highlight's image above its label and text */
    section .image {
      margin-bottom: var(--u);
    }
  }
</style>
