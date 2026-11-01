<script lang="ts">
	import Section from '#lib/components/layout/Section.svelte';
	import SectionIntro from '#lib/components/patterns/SectionIntro.svelte';
	import IconFeature from '#lib/components/patterns/IconFeature.svelte';
	import type { SectionData, SectionTone } from '#lib/types/content.ts';

	type Props = {
		section: SectionData;
		tone?: SectionTone;
		variant?: 'compact' | 'feature';
		dividers?: boolean;
	};
	let { section, tone = 'canvas', variant = 'compact', dividers = false }: Props = $props();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);
	const count = $derived(section.items.length);
	// Two or three items sit side by side from tablet width; four items go 2 → 4 columns.
	// Dividers appear at the same breakpoint as the columns they separate.
	const columns = $derived(
		count >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : count === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
	);
	const dividerLine = $derived(
		count >= 4
			? 'lg:divide-x lg:divide-line light:lg:divide-accent/40'
			: 'md:divide-x md:divide-line light:md:divide-accent/40'
	);
	const dividerPad = $derived(count >= 4 ? 'lg:px-8' : 'md:px-5 lg:px-8');
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
			'grid gap-y-12',
			columns,
			// With dividers the padding around each line creates the gap, so no extra column gap
			dividers ? dividerLine : 'gap-x-grid',
			(section.heading || section.body) && 'mt-intro'
		]}
	>
		{#each section.items as item (item.id)}
			<li
				class={[
					'min-w-0',
					dividers && variant === 'compact' && dividerPad,
					variant === 'feature' && 'md:px-10 md:first:pl-0 md:last:pr-0 lg:px-14'
				]}
			>
				<IconFeature {item} {variant} headingLevel={section.heading ? 3 : 2} />
			</li>
		{/each}
	</ul>
</Section>
