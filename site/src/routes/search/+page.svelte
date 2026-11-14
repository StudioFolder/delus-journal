<!--
  Search: a field on the band, and under it what it finds, while typing.
  The band for this URL is set in #lib/grid/layouts.ts.

  FIELD — the words alone, in the type of the newsletter's field, the
  whole width of the list; the same on every screen. Empty, it reads
  "Search articles and news" (an article's own search: "Search this article"). Once something is typed, a small cross on its line,
  in the band's last column — under the menu's lens — empties it. It
  stays at the top while the results scroll under it (not on phones,
  where the column is the page). It is ready to type in on arriving —
  it appears at once, without waiting for the band, so its caret is
  already blinking (on a phone that brings the keyboard up, from the tap
  on "Search" in the menu: #lib/search/keyboard.ts); Enter (the phone keyboard's "search") puts
  the keyboard away.

  RESULTS — from the second letter typed: everything that has all the
  words, the best first (#lib/search/find.ts): articles, editors' notes,
  issues, news. Each as an entry of an issue's contents — the title in
  Styrene, the people in Louize — under a line in small capitals saying
  where it is ("Issue 01", or the news category); when the words are in
  the text rather than in the title or the names, a passage of the text
  follows. The words found are in full ink, wherever they are: title,
  names, passage. Entries are quiet and turn to full ink under the
  pointer; the whole entry is the link. Under the pointer an entry also
  shows how many times the words are found in it (title, names and text
  together: "33 matches", "1 match"), in small capitals, quiet, on its first line, in
  the band's last column — under the lens and the cross; on touch screens, which have no pointer to hover with, it is
  always shown (as the dates of the news). Nothing found: "No results".

  HOW THE LIST CHANGES — in three steps, one after the other, as the
  notes of an article: the results that no longer answer fade out where
  they are; the ones that stay slide to their new places; the new ones
  fade in, in a cascade, as every page's content. A step with nothing to
  do is skipped. (Arriving with words in the address, the cascade waits
  for the band to stop.)

  The address follows the words (/search/?q=water), so the browser's
  Back from a result returns to the same list. A result opens where the
  words are in its text, marked (#lib/search/Found.svelte).
-->
<script lang="ts">
  import {onMount, untrack} from 'svelte';
  import {flip} from 'svelte/animate';
  import {replaceState} from '$app/navigation';
  import {page} from '$app/state';
  import Panel from '#lib/grid/Panel.svelte';
  import Acronyms from '#lib/type/Acronyms.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {time} from '#lib/motion/time.ts';
  import {find, wordsOf, type Piece, type Result} from '#lib/search/find.ts';
  import {take} from '#lib/search/keyboard.ts';

  let {data} = $props();

  let query = $state('');
  let field = $state<HTMLInputElement>();
  // Nothing is looked for before the second letter
  const asked = $derived(wordsOf(query).join('').length >= 2);
  const results = $derived(asked ? find(data.entries, query) : []);

  // A result opens with the words in its address: there they are marked
  // in its text, the first one on view (Found.svelte)
  const hrefOf = (result: Result) => `${result.href}?q=${encodeURIComponent(query.trim())}`;

  // The list on the page follows the results in steps (HOW THE LIST
  // CHANGES, above). `i`: a new result's place in the cascade.
  type Row = {result: Result; leaving?: boolean; i: number};
  let rows = $state.raw<Row[]>([]);
  let wait = $state(0); // how long the new ones wait before their cascade
  let slide = $state(0); // how long the ones that stay take to slide
  let arriving = true; // words in the address: the cascade waits for the band
  let step: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    results;
    untrack(follow);
  });

  function follow() {
    const now = new Map(results.map((x) => [x.href, x]));
    // 1. the ones that no longer answer fade out (the others keep up
    // with what is typed)
    rows = rows.map((row) => {
      const result = now.get(row.result.href);
      return result ? {...row, result, leaving: false} : {...row, leaving: true};
    });
    if (rows.some((row) => row.leaving)) step ??= setTimeout(change, time('--fade-out-time'));
    else if (!step) change();
  }

  function change() {
    step = undefined;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const before = rows.map((row) => row.result.href);
    const stays = results.filter((x) => before.includes(x.href));
    // 2. the ones that stay slide, if their place changes
    const moves = stays.some((x) => before.indexOf(x.href) !== results.indexOf(x));
    slide = still ? 0 : time('--fade-time');
    // 3. the new ones fade in, one after another
    wait = arriving ? time('--move-time') : moves ? slide : 0;
    let i = 0;
    rows = results.map((result) => ({result, i: before.includes(result.href) ? 0 : i++}));
  }

  onMount(() => {
    query = new URLSearchParams(location.search).get('q') ?? '';
    // (on phones the caret is handed over from the tap on "Search" in the
    // menu: #lib/search/keyboard.ts. Arriving another way — the browser's
    // Back, a link — an iPhone leaves the field without it until tapped)
    take(field);
    return () => clearTimeout(step);
  });

  // The cross: the field empty again, ready to type in
  function clear() {
    query = '';
    oninput();
    field?.focus({preventScroll: true});
  }

  // The address follows the words, once the typing has paused
  let pause: ReturnType<typeof setTimeout>;
  function oninput() {
    arriving = false;
    clearTimeout(pause);
    pause = setTimeout(() => {
      const q = query.trim();
      replaceState(q ? `?q=${encodeURIComponent(q)}` : location.pathname, page.state);
    }, 300);
  }
  onMount(() => () => clearTimeout(pause));
</script>

<!-- A text in pieces, the words found marked -->
{#snippet pieces(list: Piece[])}{#each list as piece}{#if piece.hit}<mark>{piece.text}</mark
      >{:else}{piece.text}{/if}{/each}{/snippet}

<Panel area="band" inset class="on-band from-top">
  <div class="column">
    <form class="field fade now" role="search" onsubmit={(e) => (e.preventDefault(), field?.blur())} out:leave|global>
      <div class="line">
        <input
          type="text"
          inputmode="search"
          name="q"
          placeholder="Search articles and news"
          aria-label="Search articles and news"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          enterkeyhint="search"
          bind:this={field}
          bind:value={query}
          {oninput}
        />
      </div>
      <button
        type="button"
        class="clear fade now"
        class:is-hidden={!query}
        aria-label="Clear the search"
        onclick={clear}
      ></button>
    </form>
    <div class="found" style:--wait="{wait}ms" aria-live="polite" out:leave|global>
      {#if asked && !results.length && !rows.length}
        <p class="none fade now">No results</p>
      {/if}
      <ol class="results">
        {#each rows as row (row.result.href)}
          {@const result = row.result}
          <li
            class="entry stretched hover fade"
            class:is-hidden={row.leaving}
            style:--i={row.i}
            animate:flip={{duration: slide}}
          >
            <span class="label">{result.where}</span>
            <span class="label n">{result.count} {result.count === 1 ? 'match' : 'matches'}</span>
            <span class="title"><a href={hrefOf(result)}>{@render pieces(result.titled)}</a></span>
            {#if result.by}<span class="by">{@render pieces(result.named)}</span>{/if}
            {#if result.passage}
              <span class="passage">
                {#each result.passage as piece}{#if piece.hit}<mark>{piece.text}</mark
                    >{:else}<Acronyms text={piece.text} />{/if}{/each}
              </span>
            {/if}
          </li>
        {/each}
      </ol>
    </div>
  </div>
</Panel>

<style>
  /* Field and results: 9 columns wide, as an issue's contents — one
     fewer than the band's content; on phones the whole width */
  .column {
    width: 100%;
  }
  .field,
  .found {
    max-width: calc(9 * var(--col));
  }
  /* The field: its words alone. The results start 5 units under them */
  .field {
    position: relative;
    padding-bottom: calc(4 * var(--u));
  }
  .line {
    padding-bottom: var(--u);
  }
  input {
    display: block;
    width: 100%;
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
  /* The cross that empties the field (drawn: 1.5 units, stroke 1.25, as
     the other icons): against the band's right edge, one column in —
     under the menu's lens —, in the middle of the field's line; quiet,
     full ink under the pointer; it catches the pointer one unit around */
  .clear {
    position: absolute;
    right: 0;
    top: calc(0.75 * var(--u));
    width: calc(1.5 * var(--u));
    height: calc(1.5 * var(--u));
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * 100%), var(--ink-quiet));
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='black' stroke-width='1.25'%3E%3Cpath d='M2.5 2.5l7.25 7.25M9.75 2.5 2.5 9.75'/%3E%3C/svg%3E")
      center / contain no-repeat;
    cursor: pointer;
    --focus-offset: calc(var(--u) / 2);
  }
  .clear:hover {
    --lit: 1;
  }
  .clear::after {
    content: '';
    position: absolute;
    inset: calc(-1 * var(--u));
  }
  .none {
    font: var(--type-ui);
    color: var(--ink-quiet);
  }
  /* It stays at the top while the results scroll under it */
  @media (min-width: 768px) {
    .field {
      position: sticky;
      top: 0;
      z-index: 1;
      max-width: none;
      padding-right: var(--col);
      background: var(--band);
    }
  }

  /* The results: entries 4 units apart, as an issue's contents */
  .results {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: calc(4 * var(--u));
  }
  .entry > span {
    display: block;
  }
  /* How many times the words are found in an entry: on its first line, against the
     band's right edge (the entry is a column short of it); quiet, and
     only under the pointer — or the keyboard — where there is one */
  .entry > .n {
    position: absolute;
    top: 0;
    right: calc(-1 * var(--col));
    color: var(--ink-quiet);
    transition: opacity var(--hover);
  }
  @media (hover: hover) {
    .entry:not(:hover, :focus-within) > .n {
      opacity: 0;
    }
  }
  /* The cascade doesn't wait for the band — nothing moves while typing —
     but for the entries that slide (--wait; arriving with words in the
     address, for the band). Going, an entry fades at once. (The second
     value is the pointer's effect, never delayed) */
  .entry.fade {
    transition-delay: calc(var(--wait, 0s) + var(--i, 0) * var(--cascade-step)), 0s;
  }
  .entry.fade.is-hidden {
    transition-delay: 0s;
  }
  .title {
    font: var(--type-band-title);
  }
  .by {
    font: var(--type-text);
  }
  /* A passage of the text, one unit under: as a note. The words found,
     there and in the title and the names, in full ink */
  .passage {
    margin-top: var(--u);
    font: var(--type-note);
  }
  mark {
    background: none;
    color: var(--ink);
  }

  @media (max-width: 767px) {
    .field,
    .found {
      max-width: none;
    }
    /* The entries take the whole width: the number at its end */
    .entry > .n {
      right: 0;
    }
    /* The words stop before the cross */
    .line {
      padding-right: calc(3 * var(--u));
    }
  }
</style>
