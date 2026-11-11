<!--
  Home. The band for this URL is set in #lib/grid/layouts.ts: Large, and
  Medium while the pointer is on the image.

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
  styles.css (--word-time, --word-step, --intro-pause, --rise). Skipped when the visitor has asked for reduced motion.
-->
<script lang="ts">
  import {onDestroy} from 'svelte';
  import {afterNavigate} from '$app/navigation';
  import Panel from '#lib/grid/Panel.svelte';
  import {focus} from '#lib/grid/focus.ts';
  import {current} from '#lib/grid/layout.svelte.ts';
  import {COVER_COLUMNS, layoutFor} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {hasPlayed, markPlayed} from '#lib/motion/once.ts';
  import {time} from '#lib/motion/time.ts';
  import {home} from '#lib/data/fixtures.ts';
  import Acronyms from '#lib/type/Acronyms.svelte';

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
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      imageShown = true;
      return void (phase = 'done');
    }

    await document.fonts.ready; // the statement's height changes when the fonts arrive
    if (left) return;

    // Measure the statement in its final place, then start it in the middle
    const text = statement.getBoundingClientRect();
    const panel = column.parentElement!.getBoundingClientRect(); // the space between header/menu and the bottom
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

  // ---------- Highlights ----------
  const highlights = home.highlights;
  let at = $state(0); // the highlight on view
  let swapping = $state(false); // one highlight is replacing another
  let hidden = $state(false); // text and image faded out, between two highlights

  function go(step: 1 | -1) {
    const next = at + step;
    if (phase !== 'done' || swapping || next < 0 || next >= highlights.length) return;
    if (innerWidth < 768) return; // no highlights on mobile yet
    swapping = true;
    hidden = true;
    const out = time('--fade-out-time');
    after(out, () => {
      at = next;
      hidden = false;
    });
    after(out + time('--fade-time'), () => (swapping = false));
  }

  // One scroll gesture = one step, however long the trackpad keeps sending
  // movement: a new step needs a pause first
  let travelled = 0;
  let used = false;
  let pause: ReturnType<typeof setTimeout>;
  function onwheel(e: WheelEvent) {
    clearTimeout(pause);
    pause = setTimeout(() => {
      travelled = 0;
      used = false;
    }, 150);
    if (used) return;
    travelled += e.deltaY;
    if (Math.abs(travelled) < 40) return;
    used = true;
    go(travelled > 0 ? 1 : -1);
  }
  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') go(1);
    if (e.key === 'ArrowUp' || e.key === 'PageUp') go(-1);
  }
  let touchY = 0;
  const ontouchstart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
  function ontouchend(e: TouchEvent) {
    const moved = touchY - e.changedTouches[0].clientY;
    if (Math.abs(moved) > 40) go(moved > 0 ? 1 : -1);
  }
  onDestroy(() => clearTimeout(pause));

  // When the pointer is on the image the band shrinks and the image moves
  // left by this many columns; it must not slip from under the pointer
  const layout = layoutFor('/');
  const shift = layout.focus ? (layout.band[1] - layout.focus.band[1]) / 2 : 0;

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
    class:is-focused={current.focused}
    style:--shift={shift}
    use:focus
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
    <p class="display"><Acronyms text={highlights[at].text} /></p>
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
          <p class="label">{highlight.label}</p>
          <p class="display"><Acronyms text={highlight.text} /></p>
          <div class="image cover"></div>
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

  /* While the band is shrunk the image has moved left: its pointer area
     still reaches to where its right edge was, so the pointer stays on it */
  :global(.on-ground) > .image {
    position: relative;
  }
  :global(.on-ground) > .image.is-focused::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 100%;
    width: calc(var(--shift) * var(--col));
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
      padding-bottom: calc(3 * var(--u));
    }
    .highlights {
      display: grid;
      gap: calc(8 * var(--u));
    }
    section .image {
      margin-top: var(--u);
    }
  }
</style>
