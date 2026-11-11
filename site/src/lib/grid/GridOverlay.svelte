<!-- The 36 columns, drawn over the page. Press G to show / hide. -->
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
  <div class="grid" aria-hidden="true">
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
    grid-template-columns: repeat(36, 1fr);
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
