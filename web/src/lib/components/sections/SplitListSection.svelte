<script lang="ts">
	import Section from '#lib/components/layout/Section.svelte';
	import HighlightedHeading from '#lib/components/ui/HighlightedHeading.svelte';
	import Paragraphs from '#lib/components/ui/Paragraphs.svelte';
	import Picture from '#lib/components/ui/Picture.svelte';
	import ListRow from '#lib/components/patterns/ListRow.svelte';
	import type { SectionData, SectionTone } from '#lib/types/content.ts';

	type Props = { section: SectionData; tone?: SectionTone; imagePosition?: 'left' | 'right' };
	let { section, tone = 'canvas', imagePosition = 'right' }: Props = $props();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);
</script>

<!-- Desktop: the text takes the free width, the photo stays compact beside it (Figma: about
     414 px wide): at most 26 rem wide and, through 52svh, never taller than ~65 % of the screen -->
<Section {tone} labelledby={headingId}>
	<div
		data-reveal-group
		class={[
			'lg:gap-x-split grid items-center gap-y-10',
			imagePosition === 'left'
				? 'lg:grid-cols-[auto_minmax(0,1fr)]'
				: 'lg:grid-cols-[minmax(0,1fr)_auto]'
		]}
	>
		<div data-reveal-group class={['min-w-0', imagePosition === 'left' && 'lg:order-2']}>
			{#if section.heading}
				<HighlightedHeading text={section.heading} highlight={section.highlight} id={headingId} />
			{/if}
			{#if section.body}
				<div class="mt-5"><Paragraphs text={section.body} class="text-secondary text-lg" /></div>
			{/if}
			<ul data-reveal-group class="mt-8">
				{#each section.items as item, i (item.id)}
					<li><ListRow {item} first={i === 0} /></li>
				{/each}
			</ul>
		</div>
		<Picture
			image={section.image}
			sizes="(min-width: 1024px) 416px, 100vw"
			class={[
				'rounded-card aspect-4/3 w-full lg:aspect-4/5 lg:w-[min(26rem,52svh)]',
				'order-first',
				imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'
			]}
		/>
	</div>
</Section>
