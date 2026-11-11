<!--
  About. Same layout as the home page: the Large band (set in
  #lib/grid/layouts.ts) with the text at the top, under the menu, in the
  same type as the home statement. Nothing else for now.
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {about} from '#lib/data/fixtures.ts';
  import Acronyms from '#lib/type/Acronyms.svelte';
</script>

<Panel area="band" inset class="on-band from-top">
  <p class="display fade" out:leave|global><Acronyms text={about.text} /></p>
</Panel>
