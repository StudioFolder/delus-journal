<!--
  What a reader can do with an article — two words, pure text, in the
  small Styrene (--type-ui), quiet → full ink under the pointer (.hover),
  one per line, one unit apart:
  - Download: the link to the article's PDF (`pdf`). Without one it is
    there but does nothing (for now: no article has its PDF yet).
  - Cite: copies the citation (`citation`) to the clipboard; the word
    then reads "Copied" for a moment (--copied-time).
-->
<script lang="ts">
  import {time} from '#lib/motion/time.ts';
  import {opens} from '#lib/type/links.ts';

  let {pdf, citation}: {pdf?: string; citation: string} = $props();

  let copied = $state(false);
  let back: ReturnType<typeof setTimeout>;
  async function cite() {
    try {
      await navigator.clipboard.writeText(citation);
    } catch {
      return; // the browser refused: nothing was copied, so nothing is claimed
    }
    copied = true;
    clearTimeout(back);
    back = setTimeout(() => (copied = false), time('--copied-time'));
  }
</script>

<p class="actions">
  <span class="hover">
    {#if pdf}<a href={pdf} {...opens(pdf)}>Download</a>{:else}<span class="none">Download</span>{/if}
  </span>
  <span class="hover" class:active={copied}>
    <button type="button" onclick={cite} aria-live="polite">{copied ? 'Copied' : 'Cite'}</button>
  </span>
</p>

<style>
  .actions {
    display: grid;
    justify-items: start;
    gap: var(--u);
    font: var(--type-ui);
  }
  button {
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
  }
  /* Reached with the keyboard: a thin quiet line, as the issues switch */
  button:focus-visible {
    outline: 1px solid var(--ink-quiet);
    outline-offset: calc(var(--u) / 2);
  }
  .none {
    cursor: default;
  }
</style>
