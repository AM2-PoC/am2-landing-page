<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import Section from '#lib/components/layout/Section.svelte';
	import SectionIntro from '#lib/components/patterns/SectionIntro.svelte';
	import ProductRow from '#lib/components/patterns/ProductRow.svelte';
	import type { ProductData, SectionData, SectionTone } from '#lib/types/content.ts';

	type Props = { section: SectionData; products: ProductData[]; tone?: SectionTone };
	let { section, products, tone = 'canvas' }: Props = $props();

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
		class={['space-y-section-sm', (section.heading || section.body) && 'mt-intro']}
	>
		{#each products as product, i (product.id)}
			<li data-reveal-group>
				<ProductRow {product} reverse={i % 2 === 1} exploreLabel={m.product_explore_platform()} />
			</li>
		{/each}
	</ul>
</Section>
