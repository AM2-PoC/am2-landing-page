<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import Section from '#lib/components/layout/Section.svelte';
	import SectionIntro from '#lib/components/patterns/SectionIntro.svelte';
	import ImageCard from '#lib/components/patterns/ImageCard.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import SlideControls from '#lib/components/ui/SlideControls.svelte';
	import { SlideTrack, sideArrowClass } from '#lib/utils/slide-track.svelte.ts';
	import type { SectionData, SectionTone } from '#lib/types/content.ts';

	type Props = { section: SectionData; tone?: SectionTone };
	let { section, tone = 'canvas' }: Props = $props();

	const slider = new SlideTrack(() => section.items.length);

	// Arrows beside the card (desktop); the phone/tablet buttons live in SlideControls
	let sidePrev = $state<HTMLButtonElement>();
	let sideNext = $state<HTMLButtonElement>();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);
</script>

<Section {tone} labelledby={headingId}>
	<SectionIntro
		heading={section.heading}
		highlight={section.highlight}
		body={section.body}
		align="left"
		{headingId}
	/>

	<!-- Desktop: arrow | card | arrow, as in the Figma mockup. The arrow columns keep their
	     width on the first/last slide, so the card never jumps while you click through. -->
	<div
		class={[
			'lg:grid lg:grid-cols-[3rem_minmax(0,1fr)_3rem] lg:items-center lg:gap-x-8',
			(section.heading || section.body) && 'mt-intro'
		]}
	>
		{#if slider.count > 1}
			<button
				bind:this={sidePrev}
				type="button"
				class={sideArrowClass}
				aria-label={m.carousel_prev()}
				disabled={slider.atStart}
				onclick={() => slider.move(-1, sidePrev, sideNext)}
			>
				<Icon name="chevron-left" class="size-7" />
			</button>
		{/if}

		<!-- The track can also be focused and scrolled with the arrow keys (WCAG 2.1.1) -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<ul
			bind:this={slider.element}
			onscroll={slider.update}
			tabindex="0"
			aria-labelledby={headingId}
			class="no-scrollbar gap-grid col-start-2 flex snap-x snap-mandatory overflow-x-auto focus-visible:-outline-offset-2"
		>
			{#each section.items as item (item.id)}
				<li class="min-w-0 shrink-0 basis-full snap-start snap-always">
					<ImageCard {item} variant="slide" />
				</li>
			{/each}
		</ul>

		{#if slider.count > 1}
			<button
				bind:this={sideNext}
				type="button"
				class={sideArrowClass}
				aria-label={m.carousel_next()}
				disabled={slider.atEnd}
				onclick={() => slider.move(1, sidePrev, sideNext)}
			>
				<Icon name="chevron-right" class="size-7" />
			</button>
		{/if}
	</div>

	{#if slider.count > 1}
		<SlideControls {slider} class="mt-6" />
	{/if}
</Section>
