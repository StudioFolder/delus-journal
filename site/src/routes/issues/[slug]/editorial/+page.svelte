<!--
  The editorial of an issue ("A Note from the Editors"), at
  /issues/<issue>/editorial/ — the first entry of the issue's contents.
  It is shown exactly as a contribution: the editors' names on the band,
  its title in the column (and, when it has one, its text) — for a
  forthcoming issue the names only, as its articles. The band
  for this URL (Small, Back → the issue) is set in #lib/grid/layouts.ts.
-->
<script lang="ts">
  import Article from '../[contribution]/+page.svelte';

  let {data} = $props();
</script>

<Article {data} />
