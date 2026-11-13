<!--
  Search: a field on the band, and under it what it finds, while typing.
  The band for this URL is set in #lib/grid/layouts.ts.

  FIELD — the words alone, in the type of the newsletter's field (on
  phones over a thin line, quiet, full ink while typing), the whole
  width of the list. It stays at the top
  while the results scroll under it (not on phones, where the column is
  the page). With a pointer, it is ready to type in on arriving — it
  appears at once, without waiting for the band, so its caret is already
  blinking; Enter
  (the phone keyboard's "search") puts the keyboard away.

  RESULTS — from the second letter typed: everything that has all the
  words, the best first (#lib/search/find.ts): articles, editors' notes,
  issues, news. They appear in a cascade, as every page's content — the
  ones that were already there stay, the new ones come one after another
  (arriving with words in the address, once the band has stopped). Each as
  an entry of an issue's contents — the title in Styrene, the people in
  Louize — under a line in small capitals saying where it is ("Issue
  01", or the news category); when the words are in the text rather than
  in the title or the names, a passage of the text follows. The words
  found are in full ink, wherever they are: title, names, passage. Entries are quiet and turn to full ink under the
  pointer; the whole entry is the link.

  The address follows the words (/search/?q=water), so the browser's
  Back from a result returns to the same list. An article opens where
  the words are in its text, marked (#lib/search/Found.svelte).
-->
<script lang="ts">
  import {onMount} from 'svelte';
  import {replaceState} from '$app/navigation';
  import {page} from '$app/state';
  import Panel from '#lib/grid/Panel.svelte';
  import Acronyms from '#lib/type/Acronyms.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {find, wordsOf, type Piece, type Result} from '#lib/search/find.ts';

  let {data} = $props();

  let query = $state('');
  let field = $state<HTMLInputElement>();
  // Nothing is looked for before the second letter
  const asked = $derived(wordsOf(query).join('').length >= 2);
  const results = $derived(asked ? find(data.entries, query) : []);

  // The cascade: each result that was not in the list before takes the
  // next place among the new ones (`--i`); the others are already there
  let before = new Set<string>();
  const places = $derived.by(() => {
    const places = new Map<string, number>();
    for (const {href} of results) if (!before.has(href)) places.set(href, places.size);
    before = new Set(results.map((x) => x.href));
    return places;
  });
  // An article opens with the words in its address: there they are
  // marked in its text, the first one on view (Found.svelte)
  const hrefOf = (result: Result) =>
    result.kind === 'article' ? `${result.href}?q=${encodeURIComponent(query.trim())}` : result.href;
  // Arriving with words in the address, the results wait for the band
  let arriving = $state(true);

  onMount(() => {
    query = new URLSearchParams(location.search).get('q') ?? '';
    if (matchMedia('(hover: hover)').matches) field?.focus({preventScroll: true});
  });

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
      <input
        type="text"
        inputmode="search"
        name="q"
        placeholder="Search"
        aria-label="Search"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        enterkeyhint="search"
        bind:this={field}
        bind:value={query}
        {oninput}
      />
    </form>
    <div class="found" class:arriving aria-live="polite" out:leave|global>
      {#if results.length}
        <ol class="results">
          {#each results as result (result.href)}
            <li class="entry stretched hover fade" style:--i={places.get(result.href) ?? 0}>
              <span class="label">{result.where}</span>
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
      {:else if asked}
        <p class="none fade">No results</p>
      {/if}
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
  /* The field: its words alone (on phones over a thin line, below).
     The results start 5 units under them */
  .field {
    padding-bottom: calc(4 * var(--u));
  }
  input {
    display: block;
    width: 100%;
    padding: 0 0 var(--u);
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
  /* The cascade starts at once: nothing moves while typing. (The second
     value is the pointer's effect, never delayed) */
  .entry.fade,
  .none.fade {
    transition-delay: calc(var(--i, 0) * var(--cascade-step)), 0s;
  }
  .arriving .entry.fade,
  .arriving .none.fade {
    transition-delay: calc(var(--move-time) + var(--i, 0) * var(--cascade-step)), 0s;
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
  .none {
    font: var(--type-ui);
    color: var(--ink-quiet);
  }

  @media (max-width: 767px) {
    .field,
    .found {
      max-width: none;
    }
    /* The thin line under the field: quiet, full ink while typing */
    input {
      border-bottom: 1px solid
        color-mix(in srgb, var(--ink) calc(var(--lit) * 100%), var(--ink-quiet));
      transition: --lit var(--hover);
    }
    input:focus {
      --lit: 1;
    }
    /* Some space after the last result, as after a text */
    .found {
      padding-bottom: calc(12 * var(--u));
    }
  }
</style>
