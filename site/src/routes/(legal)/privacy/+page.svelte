<script lang="ts">
  import {legal} from '#lib/data/fixtures.ts';
  import LegalText from '../LegalText.svelte';
</script>

<LegalText text={legal.find((text) => text.slug === 'privacy')!} />
