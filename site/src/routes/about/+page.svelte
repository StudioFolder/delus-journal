<!--
  About. Same layout as the home page: the Large band (set in
  #lib/grid/layouts.ts) with the text at the top, under the menu, in the
  same type as the home statement; the colophon follows it (Credits).
  Text and colophon are one block, so on short screens and on mobile
  they scroll together.
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {about} from '#lib/data/fixtures.ts';
  import Acronyms from '#lib/type/Acronyms.svelte';
  import Credits from '#lib/type/Credits.svelte';
</script>

<Panel area="band" inset class="on-band from-top">
  <div class="about fade" out:leave|global>
    <p class="display"><Acronyms text={about.text} /></p>
    <Credits rows={about.credits} />
  </div>
</Panel>

<style>
  .about {
    width: 100%;
    display: grid;
    gap: calc(8 * var(--u));
  }
</style>
