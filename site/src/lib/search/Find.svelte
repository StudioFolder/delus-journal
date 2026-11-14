<!--
  SEARCH WITHIN AN ARTICLE — desktop only (for now).

  On an article the band is Small and has no menu: at the right end of
  the menu's line, where the menu's lens is on the other pages, the same
  lens searches this article only. A click on it and:

  - the band opens to Medium (the page's `focus` in #lib/grid/layouts.ts)
    and the text moves over with it. On Wide screens it only moves; on
    Medium and Narrow ones it also gets narrower, so its lines break
    anew: there it fades out first and comes back once the band has
    stopped, at the passage that was being read (`away`: the page hides
    its text while it is true);
  - a field appears on that line, from column 5 (as the footer's
    tagline), in the menu's type, ready to type in: "Search this
    article". What is typed is marked in the text as it is typed
    (Found.svelte, through the page: `query`);
  - after the field, quiet, which of them is being looked at and how
    many there are (3/31); Enter goes to the next one, Shift + Enter to
    the one before;
  - the lens becomes a cross (softly, as every icon that changes state):
    it, or Esc, closes the search — the marks fade out, the band goes
    back to Small.

  The lens and the cross are drawn as the menu's lens (routes/+layout)
  and the search page's cross: the same shapes, written here again.
-->
<script lang="ts">
  import {onDestroy, tick} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import {current} from '#lib/grid/layout.svelte.ts';
  import {time} from '#lib/motion/time.ts';

  type Props = {
    open?: boolean;
    query?: string;
    away?: boolean; // the page's text must be out of sight (it is changing width)
    count: number; // how many are found
    at: number; // the one being looked at (0: none)
    onstep: (by: number) => void;
  };
  let {
    open = $bindable(false),
    query = $bindable(''),
    away = $bindable(false),
    count,
    at,
    onstep
  }: Props = $props();

  let field = $state<HTMLInputElement>();
  let busy = false;
  const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

  // The passage being read: the first block of the text still on the
  // screen, and how to bring it back to where it was
  function passage() {
    const article = document.querySelector<HTMLElement>('article');
    if (!article) return () => {};
    const from = article.getBoundingClientRect().top;
    const block = [...article.querySelectorAll('h1, .abstract, .body [data-block], .body h2')].find(
      (el) => el.getBoundingClientRect().bottom > from
    );
    const top = block?.getBoundingClientRect().top ?? 0;
    return () => {
      if (block) article.scrollTop += block.getBoundingClientRect().top - top;
    };
  }

  async function toggle() {
    if (busy) return;
    busy = true;
    open = !open;
    if (open) tick().then(() => field?.focus({preventScroll: true}));
    else {
      query = '';
      field?.blur();
    }

    // Where the text gets narrower (see above): out, the band, back
    const reflows =
      matchMedia('(max-width: 1439px)').matches &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reflows) {
      const back = passage();
      away = true;
      await wait(time('--fade-out-time'));
      current.focused = open;
      await wait(time('--move-time'));
      back();
      away = false;
    } else {
      const back = passage();
      current.focused = open;
      requestAnimationFrame(back);
    }
    busy = false;
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      onstep(event.shiftKey ? -1 : 1);
    }
  }

  onDestroy(() => {
    current.focused = false;
  });
</script>

<svelte:window onkeydown={(event) => open && event.key === 'Escape' && toggle()} />

<Panel area="band" inset class="on-band">
  <form class="find" role="search" onsubmit={(event) => event.preventDefault()}>
    <input
      class="fade now"
      class:is-hidden={!open}
      type="text"
      inputmode="search"
      placeholder="Search this article"
      aria-label="Search this article"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      tabindex={open ? 0 : -1}
      bind:this={field}
      bind:value={query}
      {onkeydown}
    />
    <output class="count fade now" class:is-hidden={!open || query.trim().length < 2}>
      {count ? `${at}/${count}` : '0'}
    </output>
    <button
      type="button"
      class="lens"
      class:open
      aria-label={open ? 'Close the search' : 'Search this article'}
      aria-expanded={open}
      onclick={toggle}
    >
      <span class="glass"></span>
      <span class="cross"></span>
    </button>
  </form>
</Panel>

<style>
  /* On the menu's line (5 units from the top), from column 5 to the
     band's right edge, one column in: the field, the count, the lens */
  .find {
    position: absolute;
    top: calc(5 * var(--u));
    left: calc(4 * var(--col));
    right: var(--col);
    display: flex;
    align-items: center;
    gap: calc(2 * var(--u));
    font: var(--type-ui);
  }
  input {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: none;
    font: inherit;
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

  /* The lens, as the menu's (1.5 units wide on the line's 2 units: its
     circle on the baseline, as tall as the capitals; the handle below),
     and the cross it becomes; quiet, full ink under the pointer; it
     catches the pointer one unit around itself */
  .lens {
    position: relative;
    flex: none;
    width: calc(1.5 * var(--u));
    height: calc(2 * var(--u));
    margin-left: auto;
    cursor: pointer;
    --focus-offset: calc(var(--u) / 2);
    transition: --lit var(--hover);
  }
  .lens:hover {
    --lit: 1;
  }
  .lens::after {
    content: '';
    position: absolute;
    inset: calc(-1 * var(--u));
  }
  .lens span {
    position: absolute;
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * 100%), var(--ink-quiet));
    transition: opacity var(--icon);
  }
  .glass {
    inset: 0 calc(-0.5 * var(--u)) 0 0; /* the handle's end passes the edge by a hair */
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='black' stroke-width='1.25'%3E%3Ccircle cx='6.125' cy='9' r='4.375'/%3E%3Cpath d='M9.22 12.09 12.3 15.17'/%3E%3C/svg%3E")
      center / contain no-repeat;
  }
  .cross {
    inset: calc(0.25 * var(--u)) 0;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='black' stroke-width='1.25'%3E%3Cpath d='M2.5 2.5l7.25 7.25M9.75 2.5 2.5 9.75'/%3E%3C/svg%3E")
      center / contain no-repeat;
    opacity: 0;
  }
  .lens.open .glass {
    opacity: 0;
  }
  .lens.open .cross {
    opacity: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    .lens span {
      transition: none;
    }
  }

  /* Not on phones */
  @media (max-width: 767px) {
    .find {
      display: none;
    }
  }
</style>
