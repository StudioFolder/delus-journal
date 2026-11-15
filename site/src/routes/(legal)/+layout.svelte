<!--
  IMPRINT and PRIVACY — two pages of their own (Marco, 15 Nov: "they
  should behave as distinct pages"). This layout holds what they share
  and what stays while going from one to the other: the two titles on
  the Medium band, one below the other, in the menu's type (--type-ui),
  quiet → full ink, the page on view lit (as the menu's items). Each
  page shows its own text (LegalText.svelte), in the space to the right.
  Phone: no titles on the band — the header shows the page's name, as a
  section's (root layout).
-->
<script lang="ts">
  import {page} from '$app/state';
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {legal} from '#lib/data/fixtures.ts';

  let {children} = $props();
</script>

<Panel area="band" inset class="on-band from-top">
  <ul class="list">
    {#each legal as text, i (text.slug)}
      <li
        class="entry stretched hover fade"
        class:active={page.url.pathname === `/${text.slug}/`}
        style:--i={i}
        out:leave|global
      >
        <a href="/{text.slug}/">{text.title}</a>
      </li>
    {/each}
  </ul>
</Panel>

{@render children()}

<style>
  .list {
    width: 100%;
    display: grid;
    gap: var(--u); /* as the menu's list on Phone */
  }
  a {
    display: block;
    font: var(--type-ui);
  }
  @media (max-width: 767px) {
    .list {
      display: none;
    }
  }
</style>
