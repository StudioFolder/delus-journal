<!--
  THE PILL — a trial (Marco, 14 Nov: "a little pill on the bottom,
  floating, that contains the functions available for each article").
  Phone only. To take it away: this file and, in the article page, its
  import, <ArticlePill … /> and `bind:this={actions}`.

  A box in the band's colour (a slight drop shadow), its corners
  rounded by one unit, floating at the bottom of the screen, in the
  middle, 2 units from the bottom edge. In it, the article's functions
  as words, in the small Styrene (--type-ui), quiet → full ink (.hover),
  4 units apart as the items of the menu:
  - Download: the pill grows (below) and says what the file is ("PDF
    file, 4.6 MB": `pdfSize`, in bytes), quiet, then Download — the
    article's PDF (`pdf`; without one it is there but does nothing, as
    on the band) — and Close;
  - Cite: copies the citation; the word reads "Copied" for a moment
    (Cite.svelte);
  - Search: the search within the article (only if it has a text). The
    pill grows and holds a field, ready to type in ("Search this
    article", in the search page's type: smaller, and the iPhone would
    zoom in on it), the count (3/12, from the second letter), Next and
    Close. What is typed is marked in the text (Found.svelte, through the
    page, as on desktop); the keyboard's own key and Next go to the next
    one, round and round; Close forgets the words and the marks fade out.

  GROWING — wider than the text, its sides halfway through the page's
  margins. As everything that changes on the site, one step after the
  other: the words fade out, the pill grows (or shrinks back) with the
  band's movement (--move), then the new words fade in.

  While searching, the pill stays above the phone's keyboard: the
  keyboard shrinks the part of the page on view (the visual viewport),
  and the pill rises by what is hidden under it (`lift`).
  It comes only once the reader has left the top of the article (`top`:
  the page says so while the article's title is on the screen), and
  goes while the menu is open, while a figure is shown large
  (`hidden`), and once the same functions after the text (`until`: the
  page's Download and Cite) reach the pill's height: it fades out, and
  back in when they leave it (or the title comes back).
-->
<script lang="ts">
  import {tick, untrack} from 'svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {time} from '#lib/motion/time.ts';
  import {opens} from '#lib/type/links.ts';
  import {ready, take} from '#lib/search/keyboard.ts';
  import Cite from './Cite.svelte';
  import {megabytes} from '#lib/data/format.ts';

  type Props = {
    pdf?: string;
    pdfSize?: number;
    citation: string;
    find?: boolean; // the article has a text to search in
    open?: boolean; // searching
    query?: string;
    count: number; // how many are found
    at: number; // the one being looked at (0: none)
    onstep: (by: number) => void;
    hidden?: boolean;
    top?: boolean; // the reader is still at the top of the article
    until?: HTMLElement; // where the page has the same functions
  };
  let {
    pdf,
    pdfSize,
    citation,
    find = false,
    open = $bindable(false),
    query = $bindable(''),
    count,
    at,
    onstep,
    hidden = false,
    top = false,
    until
  }: Props = $props();

  // `until` is on the screen up to the pill's top (2 + 5 units from the
  // bottom), or above it
  let reached = $state(false);
  $effect(() => {
    if (!until) return;
    const unit = parseFloat(getComputedStyle(until).getPropertyValue('--u')) || 8;
    const watch = new IntersectionObserver(
      ([entry]) => (reached = entry.isIntersecting || entry.boundingClientRect.top < 0),
      {rootMargin: `0px 0px ${-7 * unit}px 0px`}
    );
    watch.observe(until);
    return () => watch.disconnect();
  });

  let field = $state<HTMLInputElement>();
  let file = $state(false); // Download open: what the file is

  // What is asked for, and what is written in the pill: the change
  // follows in steps (GROWING above)
  const mode = $derived(open ? 'search' : file ? 'file' : 'rest');
  let shown = $state<'rest' | 'search' | 'file'>('rest');
  let faded = $state(false);
  $effect(() => {
    const target = mode;
    if (target === untrack(() => shown)) return void (faded = false);
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    faded = true;
    let grown: ReturnType<typeof setTimeout>;
    const out = setTimeout(
      () => {
        shown = target;
        if (target === 'search') tick().then(() => take(field));
        grown = setTimeout(() => (faded = false), still ? 0 : time('--move-time'));
      },
      still ? 0 : time('--fade-out-time')
    );
    return () => (clearTimeout(out), clearTimeout(grown));
  });

  // The words at rest, measured: the pill's width when it shrinks back
  // (it follows them: "Cite" → "Copied")
  let words = $state<HTMLElement>();
  let rest = $state<number>();
  $effect(() => {
    if (!words) return;
    const watch = new ResizeObserver(() => (rest = words!.offsetWidth));
    watch.observe(words);
    return () => watch.disconnect();
  });

  // Above the keyboard while searching: how much of the bottom of the
  // screen is hidden (the layout's height less the part on view)
  let lift = $state(0);
  $effect(() => {
    const view = window.visualViewport;
    if (!open || !view) return void (lift = 0);
    const follow = () => (lift = Math.max(0, innerHeight - view.height - view.offsetTop));
    follow();
    view.addEventListener('resize', follow);
    view.addEventListener('scroll', follow);
    return () => {
      view.removeEventListener('resize', follow);
      view.removeEventListener('scroll', follow);
    };
  });

  // In the tap itself, so that the iPhone brings its keyboard up
  // (keyboard.ts); the caret goes to the field once it is there
  function start() {
    ready();
    open = true;
  }
  function stop() {
    query = '';
    open = false;
    field?.blur();
  }
  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      onstep(event.shiftKey ? -1 : 1);
    }
    if (event.key === 'Escape') stop();
  }
</script>

<div
  class="pill fade now"
  class:is-hidden={hidden || ((top || reached) && mode === 'rest')}
  style:--keyboard="{lift}px"
  out:leave|global
>
  <div
    class="box"
    class:measured={rest !== undefined}
    class:grown={shown !== 'rest'}
    style:--rest={rest === undefined ? null : `${rest}px`}
  >
    <div class="words fade now" class:is-hidden={faded} class:grows={shown !== 'rest'}>
      {#if shown === 'search'}
        <form class="row" role="search" onsubmit={(event) => event.preventDefault()}>
          <input
            type="text"
            inputmode="search"
            enterkeyhint="search"
            placeholder="Search this article"
            aria-label="Search this article"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            bind:this={field}
            bind:value={query}
            {onkeydown}
          />
          {#if query.trim().length >= 2}
            <output class="count">{count ? `${at}/${count}` : '0'}</output>
            {#if count > 1}
              <span class="hover"><button type="button" onclick={() => onstep(1)}>Next</button></span>
            {/if}
          {/if}
          <span class="hover"><button type="button" onclick={stop}>Close</button></span>
        </form>
      {:else if shown === 'file'}
        <div class="row">
          <p class="file">{pdfSize ? `PDF file, ${megabytes(pdfSize)}` : 'PDF file'}</p>
          <span class="hover">
            {#if pdf}<a href={pdf} {...opens(pdf)}>Download</a>{:else}<span class="none">Download</span>{/if}
          </span>
          <span class="hover"><button type="button" onclick={() => (file = false)}>Close</button></span>
        </div>
      {:else}
        <div class="row rest" bind:this={words}>
          <span class="hover"><button type="button" onclick={() => (file = true)}>Download</button></span>
          <Cite {citation} />
          {#if find}
            <span class="hover"><button type="button" onclick={start}>Search</button></span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .pill {
    display: none;
  }
  @media (max-width: 767px) {
    /* The place, and coming and going (.fade) */
    .pill {
      display: block;
      position: fixed;
      z-index: 2;
      bottom: calc(2 * var(--u) + var(--keyboard, 0px));
      left: 50%;
      transform: translateX(-50%);
    }
    /* The box: as wide as the words at rest (--rest, measured; until then
       as they come), grown wider than the text — its sides halfway
       through the page's margins (--pad); from one to the other with the
       band's movement */
    .box {
      height: calc(5 * var(--u));
      padding-inline: calc(3 * var(--u));
      /* Styrene's letters sit a little low in their line (measured: about
         1px): the row is raised by that much, so they are in the middle */
      padding-bottom: 0.125em;
      display: flex;
      align-items: center;
      overflow: hidden;
      border-radius: var(--u);
      background: var(--band);
      /* a slight drop shadow, of the band's shade (--shade) laid three
         times — once is too faint to see: soft, a unit down, and closer
         under the edge */
      box-shadow:
        0 var(--u) calc(3 * var(--u)) var(--shade),
        0 var(--u) calc(3 * var(--u)) var(--shade),
        0 calc(var(--u) / 4) var(--u) var(--shade);
      font: var(--type-ui);
      white-space: nowrap;
      transition: width var(--move);
    }
    .box.measured {
      width: calc(var(--rest) + 6 * var(--u));
    }
    .box.grown {
      width: calc(100vw - var(--pad));
    }
    @media (prefers-reduced-motion: reduce) {
      .box {
        transition: none;
      }
    }
    .words {
      flex: none;
    }
    .words.grows {
      flex: 1;
      min-width: 0;
    }
    .row {
      display: flex;
      align-items: center;
      gap: calc(3 * var(--u));
    }
    .row.rest {
      gap: calc(4 * var(--u));
      width: max-content;
    }
    /* Each word catches the touch over the pill's height and a little
       around it */
    .pill :global(button),
    .pill a,
    .none {
      position: relative;
    }
    .pill :global(button)::after,
    .pill a::after,
    .none::after {
      content: '';
      position: absolute;
      inset: calc(-1.5 * var(--u)) calc(-2 * var(--u));
    }
    .none {
      cursor: default;
    }
    /* Away while the menu is open (the page under it) */
    :global(.stage.menu-open) .pill {
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--fade-out-time) ease 0s;
    }

    input {
      flex: 1;
      min-width: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: none;
      font: var(--type-text);
      color: var(--ink);
      outline: none;
      appearance: none;
    }
    input::placeholder {
      color: var(--ink-quiet);
    }
    .count {
      flex: none;
      color: var(--ink-quiet);
    }
    .file {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--ink-quiet);
    }
  }
</style>
