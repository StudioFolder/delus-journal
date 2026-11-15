<!--
  Cite: a word that copies a citation to the clipboard; it then reads
  "Copied" for a moment (--copied-time), in full ink. Quiet → full ink
  under the pointer (.hover), in the type of where it stands. On an
  article (ArticleActions) and on an issue's page.
  `class` and `i`: for the element around the word, e.g. `fade` and its
  place in a cascade. `label`: the word, if not "Cite" (the Phone pill
  says "Copy" beside the citation).
  `tick` (the Phone pill): instead of "Copied", the word fades out and a
  check mark is drawn in its place (--icon, as every icon that changes
  state), centred on it; when the moment is over the mark fades out and
  the word comes back. Drawn in SVG, not as a mask: a mask can't be
  drawn stroke by stroke. 1.5 units wide, stroke 1.25, as the other
  icons. Screen readers still hear "Copied".
-->
<script lang="ts">
  import {onDestroy} from 'svelte';
  import {time} from '#lib/motion/time.ts';

  let {
    citation,
    label = 'Cite',
    tick = false,
    class: klass = '',
    i
  }: {citation: string; label?: string; tick?: boolean; class?: string; i?: number} = $props();

  let copied = $state(false);
  let back: ReturnType<typeof setTimeout>;
  // Copies the text: through the Clipboard API where the page is served
  // securely (https, localhost); elsewhere — a phone on the local dev
  // server, over plain http — the API is missing, and the old way is
  // used: a hidden field selected and copied, in the tap itself
  async function write(text: string) {
    if (window.isSecureContext && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true; // no keyboard on a phone
    field.style.cssText = 'position: fixed; top: 0; left: 0; opacity: 0; font-size: 16px';
    document.body.append(field);
    field.select();
    field.setSelectionRange(0, text.length); // iOS
    const done = document.execCommand('copy');
    field.remove();
    if (!done) throw new Error('not copied');
  }

  async function cite() {
    try {
      await write(citation);
    } catch {
      return; // the browser refused: nothing was copied, so nothing is claimed
    }
    copied = true;
    clearTimeout(back);
    back = setTimeout(() => (copied = false), time('--copied-time'));
  }
  onDestroy(() => clearTimeout(back));
</script>

<span class="hover {klass}" class:active={copied} style:--i={i}>
  {#if tick}
    <button type="button" class="ticks" class:copied onclick={cite}>
      <span class="word">{label}</span>
      <svg class="mark" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M1.5 6.5 4.5 9.5 10.5 2.5" pathLength="1" />
      </svg>
      <span class="said" aria-live="polite">{copied ? 'Copied' : ''}</span>
    </button>
  {:else}
    <button type="button" onclick={cite} aria-live="polite">{copied ? 'Copied' : label}</button>
  {/if}
</span>

<style>
  button {
    cursor: pointer;
  }

  /* The word and the mark in one place: the one going fades out at once,
     the one coming after it (two words in one place, as "Back") */
  .ticks {
    display: inline-grid;
  }
  .word,
  .mark {
    grid-area: 1 / 1;
  }
  .word {
    transition: opacity var(--fade-time) ease var(--fade-out-time);
  }
  .copied .word {
    opacity: 0;
    transition: opacity var(--fade-out-time) ease 0s;
  }
  .mark {
    justify-self: center;
    align-self: center;
    width: calc(1.5 * var(--u));
    height: calc(1.5 * var(--u));
    fill: none;
    stroke: currentColor;
    stroke-width: 1.25;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
    transition: opacity var(--fade-out-time) ease 0s;
  }
  .mark path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition: stroke-dashoffset 0s linear var(--fade-out-time); /* undrawn once faded */
  }
  .copied .mark {
    opacity: 1;
    transition: none;
  }
  .copied .mark path {
    stroke-dashoffset: 0;
    transition: stroke-dashoffset var(--icon) var(--fade-out-time);
  }
  /* Heard, not seen */
  .said {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
