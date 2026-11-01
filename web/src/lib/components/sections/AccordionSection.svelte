<script lang="ts">
	import Section from '#lib/components/layout/Section.svelte';
	import SectionIntro from '#lib/components/patterns/SectionIntro.svelte';
	import AccordionItem from '#lib/components/patterns/AccordionItem.svelte';
	import type { SectionData, SectionTone } from '#lib/types/content.ts';

	let { section, tone = 'gradient' }: { section: SectionData; tone?: SectionTone } = $props();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);
</script>

<Section {tone} labelledby={headingId}>
	<div data-reveal-group class="gap-y-intro lg:gap-x-split grid lg:grid-cols-2">
		<SectionIntro
			eyebrow={section.eyebrow}
			heading={section.heading}
			highlight={section.highlight}
			body={section.body}
			align="left"
			class="lg:self-center"
			{headingId}
		/>
		<div data-reveal-group class="min-w-0">
			{#each section.items as item, i (item.id)}
				{#if item.title}
					<AccordionItem question={item.title} answer={item.description} first={i === 0} />
				{/if}
			{/each}
		</div>
	</div>
</Section>
