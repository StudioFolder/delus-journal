<!--
  A panel placed on the 36-column grid.
  - area="band": the band of the current URL (layouts.ts);
  - area="right" with cols={13}: that many columns in the middle of the
    space to the right of the band — it follows the band when it resizes;
  - area="rest": everything to the right of the band — it also follows
    the band;
  - span={[15, 32]}: placed by hand.
  Changes of position or width animate.
  A band panel also carries the size of its page's band (data-band="m"…),
  as set for the URL, without focus, fixed when the page is created:
  styles can depend on it (e.g. .display on a Medium band, styles.css).
-->
<script lang="ts">
  import {untrack, type Snippet} from 'svelte';
  import {page} from '$app/state';
  import {current} from './layout.svelte.ts';
  import {
    centredRight,
    layoutFor,
    restOfScreen,
    sizeOf,
    spanStyle,
    type Span
  } from './layouts.ts';

  type Props = {
    area?: 'band' | 'right' | 'rest';
    cols?: number; // with area="right": how many columns wide
    span?: Span;
    inset?: boolean; // keep content one column in from each side
    class?: string;
    children?: Snippet;
  };
  let {area, cols = 1, span, inset = false, class: klass = '', children}: Props = $props();

  const resolved: Span = $derived(
    span ??
      (area === 'band'
        ? current.layout.band
        : area === 'right'
          ? centredRight(current.layout.band, cols)
          : area === 'rest'
            ? restOfScreen(current.layout.band)
            : [1, 1])
  );

  // Read once, when the page is created (see above)
  const size = untrack(() =>
    area === 'band' ? sizeOf(layoutFor(page.route.id).band) : undefined
  );
</script>

<div class="panel {klass}" class:inset style={spanStyle(resolved)} data-band={size}>
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
