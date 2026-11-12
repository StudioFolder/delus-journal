<!--
  An issue and what is under it (its editorial, its articles): each
  address gets a new page. Going straight from one issue to another, or
  from one article to another (the browser's history), would otherwise
  reuse the page on view, with what was open or scrolled in it — the
  gallery's place, the colophon, a figure shown large.
-->
<script lang="ts">
  import {page} from '$app/state';

  let {children} = $props();
</script>

{#key page.url.pathname}
  {@render children()}
{/key}
