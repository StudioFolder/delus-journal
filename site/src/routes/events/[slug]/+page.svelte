<!-- The news texts are in ../+layout.svelte, which scrolls to this item's text. -->
<script lang="ts">
  import {page} from '$app/state';
  import Found from '#lib/search/Found.svelte';
</script>

<!-- Arriving from the search: the words found, marked in this item's text -->
<Found scroller={`.texts [data-slug="${page.params.slug}"]`} blocks="h2, p" />
