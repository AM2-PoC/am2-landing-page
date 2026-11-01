<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import Section from '#lib/components/layout/Section.svelte';
	import SectionIntro from '#lib/components/patterns/SectionIntro.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import type { ResponsibilityRowData, SectionData, SectionTone } from '#lib/types/content.ts';

	type Props = { section: SectionData; rows: ResponsibilityRowData[]; tone?: SectionTone };
	let { section, rows, tone = 'canvas' }: Props = $props();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);
	const parties = ['am2', 'customer'] as const;
	const cellX = 'px-4 sm:px-6';
	const headerCell = `${cellX} py-4 font-mono text-label text-subtle uppercase`;
</script>

<!-- contentWidth matches the table's max-w-4xl, so the decoration can use the space beside it -->
<Section {tone} labelledby={headingId} contentWidth="56rem">
	<SectionIntro
		heading={section.heading}
		highlight={section.highlight}
		body={section.body}
		{headingId}
	/>

	<!-- relative: keeps the screen-reader-only labels inside the scroll box (no page-wide overflow) -->
	<div
		class={[
			'rounded-card border-line relative mx-auto max-w-4xl overflow-x-auto border',
			(section.heading || section.body) && 'mt-intro'
		]}
	>
		<table class="w-full min-w-72 text-left">
			<thead class="bg-surface">
				<tr>
					<th scope="col" class={headerCell}>{m.matrix_responsibility()}</th>
					<th scope="col" class={[headerCell, 'w-20 text-center sm:w-32']}>{m.matrix_am2()}</th>
					<th scope="col" class={[headerCell, 'w-20 text-center sm:w-32']}>
						{m.matrix_customer()}
					</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.id)}
					<tr class="border-line border-t">
						<th scope="row" class={[cellX, 'text-secondary py-4 text-base font-normal']}>
							{row.label}
						</th>
						{#each parties as party (party)}
							<td class={[cellX, 'py-4 text-center']}>
								{#if row.owner === party}
									<Icon name="check" class="text-accent mx-auto size-5" label={m.matrix_yes()} />
								{:else}
									<span class="sr-only">{m.matrix_no()}</span>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</Section>
