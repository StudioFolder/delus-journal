<!--
  NEWSLETTER — a field to subscribe, at the bottom of the band, just above
  the footer (on mobile, just above the bottom zone). On the About page.

  - a title in small capitals ("Subscribe to our newsletter"), quiet;
  - one line: the email field over a single thin line (quiet, full ink
    while typing), and on its right a return arrow (↵) that appears only
    once something has been typed;
  - the line ends where the footer's tagline ends (DELUS, two columns,
    the tagline), so the two share their right edge; on mobile it takes
    the whole width.

  The band panel above it carries `above-newsletter`, so its content stops
  before the newsletter. `i`: the newsletter's place in the page's cascade.

  On Phone it is not at the bottom: it follows the page's content (the
  About page's credits). The page places a second one there, `inline`
  (no panel of its own), shown on Phone only; the one in its panel is
  shown on the other screens only.

  No newsletter service yet: the form only checks the address and sends
  nothing.
-->
<script lang="ts">
  import Panel from '#lib/grid/Panel.svelte';
  import {leave} from '#lib/motion/leave.ts';
  import {site} from '#lib/data/fixtures.ts';

  let {i = 0, inline = false}: {i?: number; inline?: boolean} = $props();
  const id = $props.id(); // the page has two of them: each its own field id
</script>

{#snippet form()}
  <form
    class="newsletter fade"
    class:inline
    style:--i={i}
    onsubmit={(e) => e.preventDefault()}
    out:leave|global
  >
    <label class="label" for="{id}-email">Subscribe to our newsletter</label>
    <div class="field">
      <input id="{id}-email" type="email" name="email" placeholder="email" required />
      <button type="submit" aria-label="Subscribe"></button>
    </div>
    <!-- Gives the form its width: two columns and the footer's tagline -->
    <span class="measure" aria-hidden="true">{site.tagline}</span>
  </form>
{/snippet}

{#if inline}
  {@render form()}
{:else}
  <Panel area="band" inset class="on-band from-bottom">
    {@render form()}
  </Panel>
{/if}

<style>
  /* Content above stops before the newsletter: 12 units as every from-top
     panel, plus the newsletter (7 units: title 2, gap 1, field 3 + 1) and
     5 units of air (as between menu and content) */
  :global(.stage .on-band.from-top.above-newsletter) {
    padding-bottom: calc(24 * var(--u));
  }

  .newsletter {
    display: grid;
    width: max-content;
  }
  .newsletter.inline {
    display: none; /* Phone only (below) */
  }
  .measure {
    height: 0;
    overflow: hidden;
    visibility: hidden;
    padding-left: calc(2 * var(--col)); /* the tagline starts two columns after DELUS */
    font: var(--type-ui);
    white-space: nowrap;
  }
  .label {
    margin-bottom: var(--u);
    color: var(--ink-quiet);
  }
  .field {
    display: flex;
    align-items: center;
    gap: calc(2 * var(--u));
    padding-bottom: var(--u);
    border-bottom: 1px solid
      color-mix(in srgb, var(--ink) calc(var(--lit) * 100%), var(--ink-quiet));
    transition: --lit var(--hover);
  }
  .field:focus-within {
    --lit: 1;
  }
  input {
    flex: 1;
    width: 0; /* the width comes from the measure, not from the field */
    padding: 0;
    border: 0;
    background: none;
    font: var(--type-text);
    color: var(--ink);
    outline: none;
  }
  input::placeholder {
    color: var(--ink-quiet);
  }
  /* The return arrow (↵, drawn: neither font has a plain one), 1.5 units
     square, quiet → full ink under the pointer; it fades in once something
     has been typed (the placeholder is gone) */
  button {
    flex: none;
    width: calc(1.5 * var(--u));
    height: calc(1.5 * var(--u));
    background: color-mix(in srgb, var(--ink) calc(var(--lit) * 100%), var(--ink-quiet));
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='black' stroke-width='1.25'%3E%3Cpath d='M10.5 1.5v5.5H2M5 4 2 7l3 3'/%3E%3C/svg%3E")
      center / contain no-repeat;
    cursor: pointer;
    transition:
      opacity var(--hover),
      --lit var(--hover);
  }
  button:hover {
    --lit: 1;
  }
  input:placeholder-shown + button {
    opacity: 0;
    pointer-events: none;
  }

  /* Phone: after the content, the whole width; the panel at the bottom
     is not shown, so the content above ends as on any page */
  @media (max-width: 767px) {
    :global(.stage .on-band.from-top.above-newsletter) {
      padding-bottom: 0;
    }
    .newsletter {
      display: none;
    }
    .newsletter.inline {
      display: grid;
      width: 100%;
    }
    .measure {
      display: none;
    }
  }
</style>
