<!--
  An address that doesn't exist (404), or a page that failed: one line
  in the space to the right of the band, set as a text beside the band
  (the About text, a news text): one column after the band, starting at
  the height of the band's content, in the large type. The menu and
  "DELUS" lead back into the site. The band is the one of the address's
  own kind of page, or Medium (the fallback in #lib/grid/layouts.ts).
  On a static host this is what 404.html shows (vite.config.ts).
-->
<script lang="ts">
  import {page} from '$app/state';
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<Panel area="rest" class="on-ground from-top">
  <div class="text">
    <p class="display fade" out:leave|global>
      {page.status === 404 ? 'Page not found' : (page.error?.message ?? 'Something went wrong')}
    </p>
  </div>
</Panel>

<style>
  .text {
    width: 100%;
    padding: var(--edge) 0 0 var(--col);
  }
  /* Phone: the panel already keeps --pad at the sides */
  @media (max-width: 767px) {
    .text {
      padding-left: 0;
    }
  }
</style>
