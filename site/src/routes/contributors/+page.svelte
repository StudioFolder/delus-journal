<!--
  Contributors: everyone who has contributed to an issue, in alphabetical
  order of surname, with the issue(s) they appear in.
  The band for this URL is set in #lib/grid/layouts.ts.

  A table on the band under the menu: names from column 3, issues from
  column 10. Rows are quiet and turn to full ink under the pointer; the
  whole row is the link to the contributor's page.
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {people} from '#lib/data/fixtures.ts';
  import {issueNumber} from '#lib/data/format.ts';

  const sorted = people.toSorted((a, b) => a.sortName.localeCompare(b.sortName, 'en'));
</script>

<Panel area="band" inset class="on-band from-top">
  <div class="contributors">
    <p class="row head fade" out:leave|global><span>Name</span><span>Issue</span></p>
    <ul>
      {#each sorted as person, i (person.slug)}
        <li class="row hover fade" style:--i={i} out:leave|global>
          <a href="/contributors/{person.slug}/">{person.name}</a>
          <span>{person.issues.map(issueNumber).join(', ')}</span>
        </li>
      {/each}
    </ul>
  </div>
</Panel>

<style>
  .contributors {
    width: 100%;
    display: grid;
    gap: calc(3 * var(--u));
  }
  ul {
    display: grid;
    gap: var(--u);
  }
  /* Names from column 3 (the band's inner edge), issues from column 10 */
  .row {
    position: relative;
    display: grid;
    grid-template-columns: calc(7 * var(--col)) auto;
  }
  .head {
    font: var(--type-ui);
    color: var(--ink-quiet);
  }
  /* Mobile: names on the left, issues against the right edge */
  @media (max-width: 767px) {
    .row {
      grid-template-columns: 1fr auto;
    }
  }
  /* The name is the link; it is stretched over the whole row */
  a::after {
    content: '';
    position: absolute;
    inset: 0;
  }
</style>
