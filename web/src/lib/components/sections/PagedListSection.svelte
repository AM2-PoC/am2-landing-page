<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import Section from '#lib/components/layout/Section.svelte';
	import HighlightedHeading from '#lib/components/ui/HighlightedHeading.svelte';
	import Paragraphs from '#lib/components/ui/Paragraphs.svelte';
	import Picture from '#lib/components/ui/Picture.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import SlideControls from '#lib/components/ui/SlideControls.svelte';
	import ListRow from '#lib/components/patterns/ListRow.svelte';
	import { SlideTrack, sideArrowClass } from '#lib/utils/slide-track.svelte.ts';
	import { chunk } from '#lib/utils/slideshow.ts';
	import type { SectionData, SectionTone } from '#lib/types/content.ts';

	type Props = { section: SectionData; tone?: SectionTone; pageSize?: number };
	let { section, tone = 'canvas', pageSize = 4 }: Props = $props();

	// Features in groups of four; the arrows move one group at a time (Figma: Features 1 / 2)
	const pages = $derived(chunk(section.items, pageSize));
	const slider = new SlideTrack(() => pages.length);

	let sidePrev = $state<HTMLButtonElement>();
	let sideNext = $state<HTMLButtonElement>();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);
</script>

<Section {tone} labelledby={headingId}>
	<!-- Desktop: arrow | features | arrow | photo. The photo stays put; only the list changes.
	     The arrow columns keep their width when an arrow is hidden, so the list never jumps.
	     The photo stays compact: at most 24 rem wide and, through 46svh, never taller than
	     ~65 % of the screen; the list takes the rest of the width. -->
	<div
		data-reveal-group
		class="grid items-center gap-y-10 lg:grid-cols-[3rem_minmax(0,1fr)_3rem_auto] lg:gap-x-8 xl:gap-x-10"
	>
		<div
			data-reveal-role="media"
			class="aspect-4/3 w-full [clip-path:inset(0_round_var(--radius-card))] sm:aspect-16/10 lg:col-start-4 lg:row-start-1 lg:aspect-5/7 lg:w-[min(24rem,46svh)]"
		>
			<Picture image={section.image} sizes="(min-width: 1024px) 384px, 100vw" class="size-full" />
		</div>

		{#if slider.count > 1}
			<button
				bind:this={sidePrev}
				type="button"
				class={[sideArrowClass, 'lg:col-start-1 lg:row-start-1']}
				aria-label={m.carousel_prev()}
				disabled={slider.atStart}
				onclick={() => slider.move(-1, sidePrev, sideNext)}
			>
				<Icon name="chevron-left" class="size-7" />
			</button>
		{/if}

		<div
			data-reveal-group
			class={[
				'min-w-0 lg:row-start-1',
				slider.count > 1 ? 'lg:col-start-2' : 'lg:col-span-3 lg:col-start-1'
			]}
		>
			{#if section.heading}
				<HighlightedHeading text={section.heading} highlight={section.highlight} id={headingId} />
			{/if}
			{#if section.body}
				<div class="mt-5"><Paragraphs text={section.body} class="text-secondary text-lg" /></div>
			{/if}

			<!-- The track can also be focused and scrolled with the arrow keys (WCAG 2.1.1) -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				bind:this={slider.element}
				onscroll={slider.update}
				role="group"
				tabindex="0"
				aria-labelledby={headingId}
				class="no-scrollbar mt-8 flex snap-x snap-mandatory gap-10 overflow-x-auto focus-visible:-outline-offset-2"
			>
				{#each pages as page, p (p)}
					<ul class="min-w-0 shrink-0 basis-full snap-start snap-always">
						{#each page as item, i (item.id)}
							<li><ListRow {item} first={i === 0} /></li>
						{/each}
					</ul>
				{/each}
			</div>

			{#if slider.count > 1}
				<SlideControls {slider} class="mt-6" />
			{/if}
		</div>

		{#if slider.count > 1}
			<button
				bind:this={sideNext}
				type="button"
				class={[sideArrowClass, 'lg:col-start-3 lg:row-start-1']}
				aria-label={m.carousel_next()}
				disabled={slider.atEnd}
				onclick={() => slider.move(1, sidePrev, sideNext)}
			>
				<Icon name="chevron-right" class="size-7" />
			</button>
		{/if}
	</div>
</Section>
