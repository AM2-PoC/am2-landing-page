<script lang="ts">
	import Container from '#lib/components/layout/Container.svelte';
	import Section from '#lib/components/layout/Section.svelte';
	import HighlightedHeading from '#lib/components/ui/HighlightedHeading.svelte';
	import Picture from '#lib/components/ui/Picture.svelte';
	import CarouselDots from '#lib/components/ui/CarouselDots.svelte';
	import SlidePills from '#lib/components/ui/SlidePills.svelte';
	import SectionIntro from '#lib/components/patterns/SectionIntro.svelte';
	import SectionDecor from '#lib/components/decor/SectionDecor.svelte';
	import HeroSilhouettes from '#lib/components/decor/HeroSilhouettes.svelte';
	import { revealOnScroll } from '#lib/utils/reveal-on-scroll.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { ImageAsset, SectionData } from '#lib/types/content.ts';

	type Props = { section: SectionData; variant?: 'centered' | 'background' | 'media-pair' };
	let { section, variant = 'background' }: Props = $props();

	const headingId = $derived(`${section.key}-heading`);

	// Home hero dashboards: one slide per item with an image (AM² PTT, AM² Command Center),
	// or the section's own image when the hero has no items yet
	type Slide = { id: number; title: string | null; image: ImageAsset };
	const slides = $derived.by((): Slide[] => {
		const items = section.items.flatMap((item) =>
			item.image ? [{ id: item.id, title: item.title, image: item.image }] : []
		);
		if (items.length) return items;
		return section.image ? [{ id: 0, title: null, image: section.image }] : [];
	});
	let activeSlide = $state(0);
	const slideLabels = $derived(
		slides.map((slide, i) =>
			slide.title
				? m.hero_show_dashboard({ name: slide.title })
				: m.carousel_status({ current: i + 1, total: slides.length })
		)
	);

	// Home hero intro: only when there is a dashboard image to reveal
	const hasIntro = $derived(variant === 'centered' && slides.length > 0);
	const mediaRatio = $derived(slides[0] ? slides[0].image.height / slides[0].image.width : 0);
	let revealed = $state(false);
</script>

{#if variant === 'background'}
	<!-- 480 px (phone) / 600 px (desktop), but never taller than 85% of a short screen.
	     The decoration may use the padding bands and the space beside the max-w-4xl heading. -->
	<section
		aria-labelledby={headingId}
		style:--section-pad-top="var(--spacing-section-sm)"
		style:--section-pad-bottom="var(--spacing-section-sm)"
		style:--decor-content-width="56rem"
		class="light:pb-32 light:min-h-[calc(min(30rem,85svh)+8rem)] light:lg:min-h-[calc(min(37.5rem,85svh)+8rem)] relative isolate flex min-h-[min(30rem,85svh)] items-center overflow-hidden lg:min-h-[min(37.5rem,85svh)]"
	>
		<!-- Photo + darkening layer. Light theme: the pair fades out at the bottom (hero-fade-mask,
		     utilities.css) into the light page, over an extra 8rem fade zone below the text
		     (light:pb-32 + 8rem taller), so the long, eased fade never reaches the text. -->
		<div class="light:hero-fade-mask absolute inset-0 -z-10">
			<Picture image={section.image} priority sizes="100vw" class="absolute inset-0" />
			<div class="light:bg-black/70 absolute inset-0 bg-black/65" aria-hidden="true"></div>
		</div>
		<!-- Dark theme: soft fade at the bottom, so the photo melts into the next section -->
		<div
			class="to-canvas light:hidden absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-linear-to-b from-transparent"
			aria-hidden="true"
		></div>
		<!-- The photo banner stays dark in both themes (light text on a darkened photo), so the
		     photo keeps its strength and the text stays readable; data-theme="dark" gives this
		     part the dark colours. display: contents keeps the layout unchanged. -->
		<div data-theme="dark" class="contents">
			<SectionDecor reveal={false} />
			<Container data-reveal-load class="section-y-sm text-center">
				{#if section.heading}
					<HighlightedHeading
						text={section.heading}
						highlight={section.highlight}
						level={1}
						size="display"
						align="center"
						id={headingId}
						class="mx-auto max-w-4xl"
					/>
				{/if}
				{#if section.body}<p class="text-lead text-secondary mx-auto mt-6 max-w-2xl">
						{section.body}
					</p>{/if}
			</Container>
		</div>
	</section>
{:else if variant === 'media-pair'}
	<!-- The intro and then the two images rise in right after the page has loaded -->
	<Section tone="canvas" labelledby={headingId} reveal={false}>
		<SectionIntro
			heading={section.heading}
			highlight={section.highlight}
			body={section.body}
			level={1}
			reveal="load"
			{headingId}
		/>
		{#if section.items.length > 0}
			<div
				data-reveal-load
				style:--reveal-load-start="3"
				class="mt-intro gap-grid grid sm:grid-cols-2"
			>
				{#each section.items as item (item.id)}
					<div
						class="rounded-card bg-surface-subtle flex h-56 items-center justify-center p-6 sm:h-64 lg:h-80"
					>
						<Picture
							image={item.image}
							fit="contain"
							sizes="(min-width: 640px) 40vw, 90vw"
							class="h-full w-full"
						/>
					</div>
				{/each}
			</div>
		{/if}
	</Section>
{:else}
	<!-- Home hero: no bottom padding, the product image itself closes the section.
	     Heading and text keep their size; only the dashboard image grows with the screen.
	     The decoration may use the top band and the space beside the image.

	     Intro (Figma "ease out home", styles/hero-intro.css): the page opens with the heading
	     centred on the first screen between device silhouettes. The first scroll does not move
	     the page: the heading slides up into place and the dots and the dashboard image fade in
	     (ease-out, 0.8 s) while the page stays on the hero; the next scroll moves on.
	     Only position and opacity change, never the layout, so nothing below jumps.
	     Without JavaScript or with "reduce motion" the final state is shown right away. -->
	<section
		aria-labelledby={headingId}
		data-hero-stage={hasIntro ? (revealed ? 'revealed' : 'intro') : undefined}
		style:--section-pad-top="var(--spacing-section-sm)"
		style:--decor-content-width="min(90rem, 150svh)"
		style:--hero-media-ratio={mediaRatio}
		class="hero-home bg-canvas pt-section-sm relative isolate"
		{@attach hasIntro &&
			revealOnScroll(
				() => (revealed = true),
				() => revealed
			)}
		onfocusin={() => (revealed = true)}
	>
		<SectionDecor reveal={false} />
		{#if hasIntro}<HeroSilhouettes />{/if}
		<Container class="text-center">
			<div data-hero-part="copy">
				{#if section.heading}
					<HighlightedHeading
						text={section.heading}
						highlight={section.highlight}
						level={1}
						size="display"
						align="center"
						id={headingId}
						class="mx-auto max-w-4xl"
					/>
				{/if}
				{#if section.body}<p class="text-lead text-secondary mx-auto mt-6 max-w-140">
						{section.body}
					</p>{/if}
			</div>
			<!-- With two or more dashboards the pills switch between them; with one they are decoration -->
			<div data-hero-part="dots" class="mt-8">
				{#if slides.length > 1}
					<SlidePills
						labels={slideLabels}
						active={activeSlide}
						onselect={(i) => (activeSlide = i)}
					/>
				{:else}
					<CarouselDots count={2} />
				{/if}
			</div>
		</Container>
		{#if slides.length}
			<!-- Wider than the text container on big screens: up to 1440 px, but never wider than
			     the screen (minus the side gutters) or 1.5 × the screen height (short laptops).
			     The dashboards sit side by side; the row slides sideways to the chosen one
			     (ease-out, only translate changes). Hidden dashboards are inert for screen readers. -->
			<div
				data-hero-part="media"
				class="mt-intro mx-auto w-[min(100%-2*var(--spacing-gutter),90rem,150svh)] overflow-hidden"
			>
				<div
					class="flex transition-[translate] duration-700 ease-(--reveal-ease)"
					style:translate="{-activeSlide * 100}% 0"
				>
					{#each slides as slide, i (slide.id)}
						<div class="w-full shrink-0" aria-hidden={i !== activeSlide} inert={i !== activeSlide}>
							<Picture
								image={slide.image}
								fit="natural"
								priority={i === 0}
								eager
								sizes="(min-width: 1536px) 1440px, (min-width: 768px) 92vw, 100vw"
							/>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</section>
{/if}
