<script lang="ts">
	import DecorShape from './DecorShape.svelte';
	import { getSectionDecor } from './decor-layouts.ts';

	// Placed inside a centred, `relative` SectionIntro: fills the free space between the
	// content edge and the intro text on one side (see .decor-intro in styles/decor.css)
	const layout = getSectionDecor();
	const accent = $derived(layout().intro);
</script>

<div class="decor-intro" data-side={accent.side} aria-hidden="true" data-decor>
	<DecorShape shape={accent.shape} side={accent.side} anchor="middle" size="md" />
</div>
