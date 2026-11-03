<script lang="ts">
	import Section from '#lib/components/layout/Section.svelte';
	import HighlightedHeading from '#lib/components/ui/HighlightedHeading.svelte';
	import Picture from '#lib/components/ui/Picture.svelte';
	import type { SectionData, SectionTone } from '#lib/types/content.ts';

	let { section, tone = 'raised' }: { section: SectionData; tone?: SectionTone } = $props();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);
</script>

<Section {tone} labelledby={headingId}>
	{#if section.heading}
		<HighlightedHeading text={section.heading} highlight={section.highlight} id={headingId} />
	{/if}
	<ol
		data-reveal-group
		class={[
			section.key === 'about_how_we_work' ? 'how-we-work-list' : 'space-y-section-sm',
			section.heading && 'mt-intro'
		]}
	>
		{#each section.items as item, i (item.id)}
			<li data-reveal-group class="lg:gap-x-split grid items-center gap-y-8 lg:grid-cols-2">
				<div data-reveal-group class={['min-w-0', i % 2 === 1 && 'lg:order-2']}>
					{#if item.title}<h3 class="text-h3 text-strong">{item.title}</h3>{/if}
					{#if item.description}<p class={['text-secondary text-lg', item.title && 'mt-3']}>
							{item.description}
						</p>{/if}
				</div>
				<Picture
					image={item.image}
					sizes="(min-width: 1024px) 40vw, 100vw"
					class="rounded-card order-first aspect-8/5 w-full lg:order-none"
				/>
			</li>
		{/each}
	</ol>
</Section>

<style>
	.how-we-work-list {
		display: grid;
		row-gap: 4rem;
	}

	@media (width >= 64rem) {
		.how-we-work-list {
			row-gap: 10rem;
		}
	}
</style>
