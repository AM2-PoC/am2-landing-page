<script lang="ts">
	import Section from '#lib/components/layout/Section.svelte';
	import HighlightedHeading from '#lib/components/ui/HighlightedHeading.svelte';
	import Paragraphs from '#lib/components/ui/Paragraphs.svelte';
	import Picture from '#lib/components/ui/Picture.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import type { SectionData, SectionTone } from '#lib/types/content.ts';

	type Props = { section: SectionData; tone?: SectionTone; imagePosition?: 'left' | 'right' };
	let { section, tone = 'raised', imagePosition = 'left' }: Props = $props();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);
</script>

<Section {tone} labelledby={headingId}>
	<div data-reveal-group class="lg:gap-x-split grid items-center gap-y-10 lg:grid-cols-2">
		<Picture
			image={section.image}
			sizes="(min-width: 1024px) 40vw, 100vw"
			class={['rounded-card aspect-8/5 w-full', imagePosition === 'right' && 'lg:order-2']}
		/>
		<div data-reveal-group class="min-w-0">
			{#if section.heading}
				<HighlightedHeading text={section.heading} highlight={section.highlight} id={headingId} />
			{/if}
			{#if section.body}
				<div class="mt-4"><Paragraphs text={section.body} class="text-tertiary text-lg" /></div>
			{/if}
			{#if section.cta}
				<Button href={section.cta.href} class="mt-8">{section.cta.label} →</Button>
			{/if}
		</div>
	</div>
</Section>
