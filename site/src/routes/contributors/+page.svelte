<!--
  Contributors: everyone who has contributed to an issue, with the
  issue(s) they appear in.
  The band for this URL is set in #lib/grid/layouts.ts.

  A table on the band under the menu: names from column 3, issues from
  column 11 (10 until 15 Nov). Rows are quiet and turn to full
  ink under the pointer; the whole row is a link — for now to the
  contributor's article (their first contribution), until the
  contributor's own page exists.

  From Narrow up (Marco, 15 Nov):
  - the two column titles are words that sort the list: Name (by
    surname, the default) or Issue (newest issue first, by surname
    within it). The order on view is lit, as a menu item. The change:
    the rows fade out, the list is sorted, they cascade in again.
  Phone: as before — the issues always shown, the titles plain words,
  in alphabetical order.
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {time} from '#lib/motion/time.ts';
  import {still} from '#lib/motion/still.ts';
  import {articleOf, people} from '#lib/data/fixtures.ts';
  import {issueNumber} from '#lib/data/format.ts';

  type Order = 'name' | 'issue';
  const byName = (a: (typeof people)[number], b: (typeof people)[number]) =>
    a.sortName.localeCompare(b.sortName, 'en');
  const sorts: Record<Order, typeof people> = {
    name: people.toSorted(byName),
    issue: people.toSorted((a, b) => Math.max(...b.issues) - Math.max(...a.issues) || byName(a, b))
  };

  let order = $state<Order>('name'); // asked for
  let shown = $state<Order>('name'); // on view
  let hidden = $state(false); // the rows fading out before the new order
  let sorted = $state(false); // sorted at least once: the rows come back without waiting for the band
  let swap: ReturnType<typeof setTimeout>;
  function sort(to: Order) {
    if (to === order) return;
    order = to;
    clearTimeout(swap);
    hidden = true;
    swap = setTimeout(
      () => {
        shown = order;
        sorted = true;
        hidden = false;
      },
      still() ? 0 : time('--fade-out-time')
    );
  }
</script>

<Panel area="band" inset class="on-band from-top">
  <div class="table" class:sorted>
    <p class="row head fade" out:leave|global>
      <span class="hover" class:active={order === 'name'}>
        <button type="button" onclick={() => sort('name')}>Name</button>
      </span>
      <span class="hover" class:active={order === 'issue'}>
        <button type="button" onclick={() => sort('issue')}>Issue</button>
      </span>
    </p>
    <ul>
      {#each sorts[shown] as person, i (person.slug)}
        <li class="row hover fade" class:is-hidden={hidden} style:--i={i} out:leave|global>
          <a href={articleOf(person.slug)?.href ?? `/contributors/${person.slug}/`}>{person.name}</a>
          <span class="issues">{person.issues.map(issueNumber).join(', ')}</span>
        </li>
      {/each}
    </ul>
  </div>
</Panel>

<style>
  /* Names from column 3 (the band's inner edge), issues from column 11 */
  .table {
    --columns: calc(8 * var(--col)) auto;
  }
  .head .hover {
    justify-self: start;
  }
  .head button {
    cursor: pointer;
  }
  /* Sorted again: the rows cascade in at once (nothing moves) */
  .sorted .row.fade:not(.is-hidden) {
    transition:
      opacity var(--fade-time) ease calc(var(--i, 0) * var(--cascade-step)),
      --lit var(--hover);
  }
  /* Mobile: names on the left, issues against the right edge; the
     titles are plain words (no sorting, nothing lit) */
  @media (max-width: 767px) {
    .table {
      --columns: 1fr auto;
    }
    .head button {
      pointer-events: none;
    }
    .head .hover.active {
      --lit: 0;
    }
  }
</style>
