<script lang="ts">
	import DecorShape from './DecorShape.svelte';
	import { getSectionDecor } from './decor-layouts.ts';

	// The parent section must be `relative isolate` and may set --section-pad-top/-bottom
	// and --decor-content-width (see styles/decor.css)
	// reveal: fade in with the section (styles/reveal.css); off in heroes, which have their own entrance
	let { reveal = true }: { reveal?: boolean } = $props();

	const layout = getSectionDecor();
	const slots = $derived(layout().slots);
</script>

<div class="decor" aria-hidden="true" data-decor data-reveal={reveal ? '' : undefined}>
	{#each slots as slot, i (i)}
		<DecorShape {...slot} />
	{/each}
</div>
