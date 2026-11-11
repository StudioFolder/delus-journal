<!--
  About. Same layout as the home page: the Large band (set in
  #lib/grid/layouts.ts) with the text at the top, under the menu, in the
  same type as the home statement; the colophon follows it (Credits).
  Text and colophon are one block, so on short screens and on mobile
  they scroll together. They appear in a cascade, as on the other pages:
  the text, then the colophon row by row, then the newsletter, at the
  bottom of the band (Newsletter.svelte).
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {about} from '#lib/data/fixtures.ts';
  import Acronyms from '#lib/type/Acronyms.svelte';
  import Credits from '#lib/type/Credits.svelte';
  import Newsletter from '#lib/newsletter/Newsletter.svelte';
</script>

<Panel area="band" inset class="on-band from-top above-newsletter">
  <div class="about">
    <p class="display fade" style:--i={0} out:leave|global><Acronyms text={about.text} /></p>
    <Credits rows={about.credits} cascade start={1} />
  </div>
</Panel>

<Newsletter i={1 + about.credits.length} />

<style>
  .about {
    width: 100%;
    display: grid;
    gap: calc(8 * var(--u));
  }
</style>
