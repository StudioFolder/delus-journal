<!--
  The 36 columns, drawn over the page. Press G to show / hide.
  Only while the site is run locally (the root layout leaves it out of
  the built site).
  A tool for building the site, not part of its design: its colour and
  its small figures are its own, outside the tokens of styles.css.
-->
<script lang="ts">
  import {COLUMNS} from './layouts.ts';

  let visible = $state(false);

  function onkeydown(e: KeyboardEvent) {
    const t = e.target as HTMLElement;
    if (t.isContentEditable || ['INPUT', 'TEXTAREA'].includes(t.tagName)) return;
    if (e.key === 'g' || e.key === 'G') visible = !visible;
  }
</script>

<svelte:window {onkeydown} />

{#if visible}
  <div class="grid" style:--columns={COLUMNS} aria-hidden="true">
    {#each {length: COLUMNS} as _, i}
      <div class="col"><span>{i + 1}</span></div>
    {/each}
  </div>
{/if}

<style>
  .grid {
    position: fixed;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    pointer-events: none;
    z-index: 1000;
  }
  .col {
    border-left: 1px solid rgb(255 0 80 / 0.35);
    background: rgb(255 0 80 / 0.03);
  }
  .col:nth-child(odd) {
    background: rgb(255 0 80 / 0.06);
  }
  span {
    display: block;
    padding: 2px 3px;
    font: 10px/1 ui-monospace, monospace;
    color: rgb(255 0 80);
  }
</style>
