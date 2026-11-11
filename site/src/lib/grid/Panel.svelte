<!--
  A panel placed on the 36-column grid.
  `area` takes its columns from the current URL's entry in layouts.ts;
  `span` places it by hand instead, e.g. span={[15, 32]}.
  Changes of position or width animate.
-->
<script lang="ts">
  import type {Snippet} from 'svelte';
  import {current} from './layout.svelte.ts';
  import {spanStyle, type Span} from './layouts.ts';

  type Props = {
    area?: 'band';
    span?: Span;
    inset?: boolean; // keep content one column in from each side
    class?: string;
    children?: Snippet;
  };
  let {area, span, inset = false, class: klass = '', children}: Props = $props();

  const resolved: Span = $derived(span ?? (area ? current.layout[area] : [1, 1]));
</script>

<div class="panel {klass}" class:inset style={spanStyle(resolved)}>
  {@render children?.()}
</div>

<style>
  .panel {
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--from) * var(--col));
    width: calc(var(--cols) * var(--col));
    transition:
      left var(--move),
      width var(--move);
  }
  .inset {
    padding-inline: var(--col);
  }
</style>
