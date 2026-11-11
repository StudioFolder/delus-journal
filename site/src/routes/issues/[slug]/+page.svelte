<!--
  An issue. Medium band, as the issues list (layouts.ts).

  - The abstract at the top of the band, under the menu: the issue
    number in small capitals, then the text.
  - Below it the publication details (Credits), appearing one after
    another.
  - The cover on the background, in the middle of the space to the
    right of the band.

  FROM THE LIST — arriving from the issues list, nothing reloads: the
  abstract rises from the bottom of the band to the top and the cover
  stays where it was (motion/carry.ts); the details cascade in once the
  abstract has arrived. Arriving any other way, everything fades in.

  MOBILE — one column: abstract, details, cover.
-->
<script lang="ts">
  import {untrack} from 'svelte';
  import Panel from '#lib/grid/Panel.svelte';
  import {COVER_COLUMNS} from '#lib/grid/layouts.ts';
  import {leave} from '#lib/motion/leave.ts';
  import {arriving, land} from '#lib/motion/carry.ts';
  import Acronyms from '#lib/type/Acronyms.svelte';
  import Credits from '#lib/type/Credits.svelte';
  import {issueDetails, issueLabel} from '#lib/data/format.ts';

  let {data} = $props();
  const issue = $derived(data.issue);

  // Where the abstract and the cover come from, when arriving from the
  // list: read once, as the page is created. (Going from one issue
  // straight to another would reuse the page: not possible yet.)
  const slug = untrack(() => data.issue.slug);
  const from = {abstract: arriving(`abstract:${slug}`), cover: arriving(`cover:${slug}`)};
</script>

<Panel area="right" cols={COVER_COLUMNS} class="on-ground">
  <div
    class="cover"
    class:fade={!from.cover}
    role="img"
    aria-label="Cover of {issue.title}"
    use:land={from.cover}
    out:leave|global
  ></div>
</Panel>

<Panel area="band" inset class="on-band from-top">
  <div class="column">
    <div class="labelled" class:fade={!from.abstract} use:land={from.abstract} out:leave|global>
      <p class="label">{issueLabel(issue.number)}</p>
      <p class="display"><Acronyms text={issue.abstract} /></p>
    </div>

    <Credits rows={issueDetails(issue)} cascade />

    <!-- Mobile only -->
    <div class="cover cover-mobile fade" out:leave|global></div>
  </div>
</Panel>

<style>
  .column {
    width: 100%;
    display: grid;
    gap: calc(8 * var(--u));
  }
  .cover-mobile {
    display: none;
  }

  @media (max-width: 767px) {
    :global(.on-ground) > .cover {
      display: none;
    }
    .cover-mobile {
      display: block;
      margin-bottom: calc(3 * var(--u));
    }
  }
</style>
