<!--
  What a reader can do with an article — two words, pure text, in the
  small Styrene (--type-ui), quiet → full ink under the pointer (.hover),
  one per line, one unit apart:
  - Download: the link to the article's PDF (`pdf`). Without one it is
    there but does nothing (for now: no article has its PDF yet).
  - Cite: copies the citation to the clipboard; the word then reads
    "Copied" for a moment (Cite.svelte).
  DETAILS (`details`: while the pointer is over the band; always where
  nothing can hover): under Download, the file and its size ("PDF file,
  3.1 MB"); under Cite, the citation (ending with its DOI), the journal
  in italics (Styrene has no italic file yet: slanted by the browser). In
  the words' type (--type-ui), quiet, one unit under their word.
  Opening, once the notes above have faded out, the room is made (the
  words rise), then the details fade in; closing, the reverse — never two
  at once. The page brings the notes back after (.band-notes.waits).
-->
<script lang="ts">
  import {opens} from '#lib/type/links.ts';
  import Inlines from './Inlines.svelte';
  import Cite from './Cite.svelte';
  import type {Inline} from '#lib/data/fixtures.ts';
  import {megabytes, plain} from '#lib/data/format.ts';

  let {
    pdf,
    pdfSize,
    citation,
    details = false
  }: {pdf?: string; pdfSize?: number; citation: Inline[]; details?: boolean} = $props();
</script>

<div class="actions" class:details>
  <div class="action">
    <span class="hover">
      {#if pdf}<a href={pdf} {...opens(pdf)}>Download</a>{:else}<span class="none">Download</span>{/if}
    </span>
    <div class="more">
      <div>
        <div class="text">
          <p>{pdfSize ? `PDF file, ${megabytes(pdfSize)}` : 'PDF file'}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="action">
    <Cite citation={plain(citation)} />
    <div class="more">
      <div>
        <div class="text">
          <p><Inlines parts={citation} sc={false} /></p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .actions {
    display: grid;
    justify-items: start;
    gap: var(--u);
    font: var(--type-ui);
  }
  .action {
    display: grid;
    justify-items: start;
  }
  .none {
    cursor: default;
  }

  /* The details: a row that opens (its height), then their text fades in */
  .more {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows var(--fade-time) ease var(--fade-out-time);
  }
  /* Closed, nothing of them takes room: the words keep their spacing
     (the padding is inside, on .text) */
  .more > div {
    overflow: hidden;
    min-height: 0;
    opacity: 0;
    transition: opacity var(--fade-out-time) ease 0s;
  }
  .text {
    display: grid;
    gap: var(--u);
    padding-top: var(--u); /* under its word */
    padding-bottom: var(--u); /* with the gap: 2 units before the next word */
    font: var(--type-ui);
    color: var(--ink-quiet);
    overflow-wrap: anywhere; /* a long address breaks rather than leaving the band */
  }
  /* Opening waits for the notes above to fade out (the band's notes go
     as the pointer reaches the band), so nothing moves while they fade */
  .details .more {
    grid-template-rows: 1fr;
    transition-delay: var(--fade-out-time);
  }
  .details .more > div {
    opacity: 1;
    transition: opacity var(--fade-time) ease calc(var(--fade-out-time) + var(--fade-time));
  }
  .action:last-child .text {
    padding-bottom: 0;
  }
</style>
