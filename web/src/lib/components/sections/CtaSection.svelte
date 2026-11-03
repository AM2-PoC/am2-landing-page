<script lang="ts">
	import Section from '#lib/components/layout/Section.svelte';
	import HighlightedHeading from '#lib/components/ui/HighlightedHeading.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import type { SectionData, SectionTone } from '#lib/types/content.ts';

	let { section, tone = 'raised' }: { section: SectionData; tone?: SectionTone } = $props();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);
</script>

<!-- contentWidth matches the card's max-w-256, so the decoration can use the space beside it.
     blend="none": one flat background colour, no fade from the section above.
     Light theme (Figma Home Light): a solid orange card with dark text and a light button. -->
<Section {tone} blend="none" labelledby={headingId} contentWidth="64rem" class="cta-section">
	<div
		class="rounded-card border-line bg-surface-subtle light:border-transparent light:bg-accent mx-auto max-w-256 border px-6 py-12 text-center sm:px-10 sm:py-14 lg:px-16 lg:py-16"
	>
		{#if section.heading}
			<HighlightedHeading
				text={section.heading}
				highlight={section.highlight}
				align="center"
				id={headingId}
				class="light:text-on-accent light:[&_span]:text-on-accent"
			/>
		{/if}
		{#if section.body}<p class="text-muted light:text-on-accent mx-auto mt-4 max-w-3xl text-lg">
				{section.body}
			</p>{/if}
		{#if section.cta}
			<Button
				href={section.cta.href}
				shape="card"
				class="light:bg-canvas light:text-strong light:hover:bg-canvas-raised mt-8"
				>{section.cta.label}</Button
			>
		{/if}
	</div>
</Section>
