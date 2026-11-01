<script lang="ts">
	import Section from '#lib/components/layout/Section.svelte';
	import SectionIntro from '#lib/components/patterns/SectionIntro.svelte';
	import ImageCard from '#lib/components/patterns/ImageCard.svelte';
	import type { SectionData, SectionTone } from '#lib/types/content.ts';

	type Props = {
		section: SectionData;
		tone?: SectionTone;
		variant?: 'feature' | 'banner' | 'tall';
		columns?: 2 | 3;
	};
	let { section, tone = 'canvas', variant = 'banner', columns = 2 }: Props = $props();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);
</script>

<Section {tone} labelledby={headingId}>
	<SectionIntro
		heading={section.heading}
		highlight={section.highlight}
		body={section.body}
		{headingId}
	/>
	<ul
		data-reveal-group
		class={[
			'gap-grid grid',
			columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2',
			(section.heading || section.body) && 'mt-intro'
		]}
	>
		{#each section.items as item (item.id)}
			<li class="min-w-0"><ImageCard {item} {variant} /></li>
		{/each}
	</ul>
</Section>
