<!--
  Credits: rows of a label and one or more lines, some of them links
  (the About colophon, an issue's publication details).
  - label in --type-ui, quiet (as the column titles of the tables),
    1 unit above its lines; lines in --type-text; rows 3 units apart;
  - links stay in full ink, marked by the arrow of `.link` (styles.css);
    links to other sites open in a new tab (links.ts);
  - `cascade`: the rows appear one after another and fade out when the
    page is left (FADE in styles.css); otherwise they follow the block
    they sit in. `start`: the cascade's place of the first row, when
    something on the page comes before it (default 0);
  - `compact` (an issue's colophon): everything in the small Styrene B
    (--type-ui), the label quiet and its lines in full ink beside it —
    labels in a column three grid columns wide — rows 1 unit apart. On
    phones the label column is 12 units wide.
-->
<script lang="ts">
  import type {Credit} from '#lib/data/format.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {opens} from './links.ts';

  let {
    rows,
    cascade = false,
    start = 0,
    compact = false
  }: {rows: Credit[]; cascade?: boolean; start?: number; compact?: boolean} = $props();
</script>

{#snippet row(credit: Credit)}
  <dt>{credit.label}</dt>
  {#each credit.value as line (line.text)}
    {#if line.href}
      <dd class="link"><a href={line.href} {...opens(line.href)}>{line.text}</a></dd>
    {:else}
      <dd>{#if line.em}<em>{line.text}</em>{:else}{line.text}{/if}</dd>
    {/if}
  {/each}
{/snippet}

<dl class="credits" class:compact>
  {#each rows as credit, i (credit.label)}
    {#if cascade}
      <div class="fade" style:--i={start + i} out:leave|global>{@render row(credit)}</div>
    {:else}
      <div>{@render row(credit)}</div>
    {/if}
  {/each}
</dl>

<style>
  .credits {
    display: grid;
    gap: calc(3 * var(--u));
  }
  dt {
    font: var(--type-ui);
    color: var(--ink-quiet);
    margin-bottom: var(--u);
  }

  /* Compact: label and lines side by side, all in the small Styrene */
  .compact {
    gap: var(--u);
    font: var(--type-ui);
  }
  .compact > div {
    display: grid;
    grid-template-columns: calc(3 * var(--col)) 1fr;
  }
  .compact dt {
    margin-bottom: 0;
  }
  .compact dd {
    grid-column: 2;
  }
  @media (max-width: 767px) {
    .compact > div {
      grid-template-columns: calc(12 * var(--u)) 1fr;
    }
  }
</style>
