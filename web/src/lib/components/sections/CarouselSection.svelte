<script lang="ts">
	import { tick } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { m } from '#lib/paraglide/messages.js';
	import Section from '#lib/components/layout/Section.svelte';
	import SectionIntro from '#lib/components/patterns/SectionIntro.svelte';
	import ImageCard from '#lib/components/patterns/ImageCard.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { clampSlide, laneShift } from '#lib/utils/slideshow.ts';
	import type { SectionData, SectionTone } from '#lib/types/content.ts';

	type Props = { section: SectionData; tone?: SectionTone };
	let { section, tone = 'canvas' }: Props = $props();

	const headingId = $derived(section.heading ? `${section.key}-heading` : undefined);

	// Desktop: three cards per page, the arrows move one page at a time (Figma: Home security)
	const perPage = 3;
	const pageCount = $derived(Math.ceil(section.items.length / perPage));
	const desktop = new MediaQuery('min-width: 64rem');

	let page = $state(0);
	let announced = $state(false);
	let prevButton = $state<HTMLButtonElement>();
	let nextButton = $state<HTMLButtonElement>();

	// Row position of the current page: the first card of every later page has an extra arrow
	// lane in front of it (lg:nth-[3n+4]), so one page = the row width plus one gap and no card
	// of a neighbouring page peeks in under an arrow; the cards then shift right by laneShift()
	// arrow lanes
	const rowShift = $derived(
		`calc(${page} * (-100% - var(--carousel-gap)) + ${laneShift(page, pageCount)} * var(--carousel-lane)) 0`
	);

	async function move(direction: 1 | -1) {
		page = clampSlide(page + direction, pageCount);
		announced = true;
		// The pressed arrow disappears on the first/last page: keyboard focus moves to the other one
		await tick();
		if (direction === 1 && page === pageCount - 1) prevButton?.focus();
		if (direction === -1 && page === 0) nextButton?.focus();
	}

	// Plain chevron in the free lane beside the cards (Figma: 48 px, no background).
	// On the first/last page it fades out and then becomes invisible (can't be focused);
	// when it comes back it is visible at once, so it can take over keyboard focus right away.
	const arrow =
		'absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full text-strong [transition:opacity_300ms,background-color_150ms] hover:bg-control-hover disabled:invisible disabled:opacity-0 disabled:[transition:opacity_300ms,visibility_0s_300ms] lg:inline-flex';
</script>

<Section {tone} labelledby={headingId}>
	<SectionIntro
		heading={section.heading}
		highlight={section.highlight}
		body={section.body}
		align="center"
		{headingId}
	/>

	<!-- Phones and tablets: swipe through the cards; the track runs to the screen edge, so the
	     next card "peeks" in (the first one still lines up with the page content).
	     Desktop: pages of three cards. The free lane for the arrow (3 rem arrow + 3 rem gap) is
	     on the right on the first page and on the left on the last page; the whole row slides
	     sideways to the chosen page (ease-out, 0.7 s, only translate changes). Cards of the
	     other pages are inert, so keyboard focus and screen readers stay on the visible page. -->
	<div
		style:--carousel-lane="6rem"
		style:--carousel-gap="3rem"
		style:--carousel-x={rowShift}
		class={['relative lg:overflow-hidden', (section.heading || section.body) && 'mt-intro']}
	>
		<!-- Phones/tablets: the swipe track can also be focused and scrolled with the arrow keys
		     (WCAG 2.1.1; the cards themselves contain no links). Desktop pages with the buttons. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<ul
			tabindex={desktop.current ? undefined : 0}
			aria-labelledby={headingId}
			class="no-scrollbar -mx-gutter gap-grid px-gutter scroll-px-gutter flex snap-x snap-mandatory overflow-x-auto scroll-smooth focus-visible:-outline-offset-2 lg:mx-0 lg:[translate:var(--carousel-x)] lg:snap-none lg:gap-x-(--carousel-gap) lg:overflow-visible lg:px-0 lg:transition-[translate] lg:duration-700 lg:ease-(--reveal-ease)"
		>
			{#each section.items as item, i (item.id)}
				{@const hidden = desktop.current && pageCount > 1 && Math.floor(i / perPage) !== page}
				<li
					class="min-w-0 shrink-0 basis-[85%] snap-start sm:basis-[calc((100%-var(--spacing-grid))/2)] lg:basis-[calc((100%-var(--carousel-lane)-2*var(--carousel-gap))/3)] lg:nth-[3n+4]:ml-(--carousel-lane)"
					aria-hidden={hidden || undefined}
					inert={hidden}
				>
					<ImageCard {item} variant="tall" />
				</li>
			{/each}
		</ul>

		{#if pageCount > 1}
			<button
				bind:this={prevButton}
				type="button"
				class={[arrow, 'left-0']}
				aria-label={m.carousel_prev()}
				disabled={page === 0}
				onclick={() => move(-1)}
			>
				<Icon name="chevron-left" class="size-7" />
			</button>
			<button
				bind:this={nextButton}
				type="button"
				class={[arrow, 'right-0']}
				aria-label={m.carousel_next()}
				disabled={page === pageCount - 1}
				onclick={() => move(1)}
			>
				<Icon name="chevron-right" class="size-7" />
			</button>
			<p class="sr-only" aria-live="polite">
				{announced ? m.carousel_status({ current: page + 1, total: pageCount }) : ''}
			</p>
		{/if}
	</div>
</Section>
