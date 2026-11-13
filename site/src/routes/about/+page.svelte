<!--
  About. The Medium band (set in #lib/grid/layouts.ts), as the other
  sections: the colophon (Credits) at the top of the band, under the
  menu, and the newsletter at its bottom (Newsletter.svelte). The text
  sits in the space to the right of the band, set as a news text: 18
  columns, one column after the band, starting at the height of the
  colophon, in the large type; a long text scrolls the whole height of
  the screen. Everything appears in a cascade, as on the other pages:
  the text, then the colophon row by row, then the newsletter.

  MOBILE — one column under the header: the text, the colophon, then the
  newsletter (not at the bottom of the screen).
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {TEXT_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {about} from '#lib/data/fixtures.ts';
  import Inlines from '#lib/article/Inlines.svelte';
  import Credits from '#lib/type/Credits.svelte';
  import Newsletter from '#lib/newsletter/Newsletter.svelte';
</script>

<Panel area="band" inset class="on-band from-top above-newsletter">
  <div class="about">
    <!-- Mobile only: on desktop the text is on the right -->
    <p class="display mobile fade" style:--i={0} out:leave|global>
      <Inlines parts={about.text} />
    </p>
    <Credits rows={about.credits} cascade start={1} />
    <!-- Phone only: the newsletter after the colophon -->
    <Newsletter i={1 + about.credits.length} inline />
  </div>
</Panel>

<Panel area="rest" class="on-ground from-top">
  <div class="text" style:--text-cols={TEXT_COLUMNS}>
    <p class="display fade" style:--i={0} out:leave|global>
      <Inlines parts={about.text} />
    </p>
  </div>
</Panel>

<Newsletter i={1 + about.credits.length} />

<style>
  .about {
    width: 100%;
    display: grid;
    gap: calc(8 * var(--u));
  }
  .mobile {
    display: none;
  }

  /* As a news text (events/NewsText.svelte): one column after the band,
     18 columns wide, starting at --edge; 12 units after the last line */
  .text {
    width: 100%;
    padding: var(--edge) 0 calc(12 * var(--u)) var(--col);
  }
  .text p {
    width: calc(var(--text-cols) * var(--col));
  }

  @media (max-width: 767px) {
    .mobile {
      display: block;
    }
    .text {
      display: none;
    }
  }
</style>
