<script lang="ts">
	import Picture from '#lib/components/ui/Picture.svelte';
	import ArrowLink from '#lib/components/ui/ArrowLink.svelte';
	import type { SectionItemData } from '#lib/types/content.ts';

	type Props = { item: SectionItemData; variant?: 'feature' | 'banner' | 'tall' | 'slide' };
	let { item, variant = 'banner' }: Props = $props();

	// Rounded corners: the card is drawn as one layer (will-change-transform) and that layer is
	// cut once with clip-path. With overflow + border-radius every layer (background, photo,
	// fade) is cut on its own, and their half-covered edge pixels add up to a thin visible line
	// along the bottom corners.
	const roundAll = '[clip-path:inset(0_round_var(--radius-card))]';
	const layout = {
		feature:
			'h-110 [clip-path:inset(0_round_var(--radius-card)_var(--radius-card)_0_0)] lg:h-127.5',
		banner: ['min-h-57', roundAll],
		// Figma (Security cards on Home, benefit cards on the Platform pages): rounded at the top,
		// square at the bottom with a straight orange line along the bottom edge
		tall: [
			'h-110 border-b-2 border-accent/60 lg:h-127.5',
			'[clip-path:inset(0_round_var(--radius-card)_var(--radius-card)_0_0)]'
		],
		// One wide card at a time (slideshow): a little taller than the 374 px mockup
		slide: ['h-90 sm:h-100 lg:h-105', roundAll]
	};
	const titleSize = {
		feature: 'text-h3-card',
		banner: 'text-h3',
		tall: 'text-h3',
		slide: 'text-h3-card'
	};
	const sizes = {
		feature: '(min-width: 768px) 50vw, 100vw',
		banner: '(min-width: 768px) 50vw, 100vw',
		tall: '(min-width: 1024px) 33vw, 85vw',
		slide: '(min-width: 1280px) 1120px, 100vw'
	};
	// Light theme: the photo at full strength, and the fade into the page colour starts
	// lower, just behind the text, so the picture stays clearly visible
	// (dark theme keeps its fade from the top). Stops follow where the text sits per variant.
	// (stops: clear until … / 82 % page colour at … / solid page colour from …;
	// written out in full so Tailwind can find the classes)
	const lightFade = {
		feature:
			'light:bg-[linear-gradient(to_bottom,transparent_30%,color-mix(in_oklab,var(--am2-card-fade)_82%,transparent)_60%,var(--am2-card-fade)_82%)]',
		banner:
			'light:bg-[linear-gradient(to_bottom,transparent_25%,color-mix(in_oklab,var(--am2-card-fade)_82%,transparent)_62%,var(--am2-card-fade)_100%)]',
		tall: 'light:bg-[linear-gradient(to_bottom,transparent_45%,color-mix(in_oklab,var(--am2-card-fade)_82%,transparent)_72%,var(--am2-card-fade)_92%)]',
		slide:
			'light:bg-[linear-gradient(to_bottom,transparent_40%,color-mix(in_oklab,var(--am2-card-fade)_82%,transparent)_72%,var(--am2-card-fade)_95%)]'
	};
	const bodySize = {
		feature: 'text-base max-w-md',
		banner: 'text-sm max-w-md',
		tall: 'text-sm max-w-md',
		slide: 'text-base max-w-2xl lg:text-lead'
	};
</script>

<article
	class={[
		// overflow-hidden (no radius, so no corner line): the photo zoom on hover stays inside
		// the card and never covers the orange bottom border of the tall cards
		'group bg-surface relative isolate flex flex-col justify-end overflow-hidden will-change-transform',
		layout[variant]
	]}
>
	<Picture
		image={item.image}
		sizes={sizes[variant]}
		class="light:opacity-100 absolute inset-0 -z-20 opacity-80 transition-transform duration-300 group-hover:scale-103"
	/>
	<div
		class={[
			'via-card-fade/70 to-card-fade absolute inset-0 -z-10 bg-linear-to-b from-transparent via-60%',
			lightFade[variant]
		]}
		aria-hidden="true"
	></div>

	<!-- Light theme: a soft glow in the page colour keeps the text readable over the photo -->
	<div
		class="light:[text-shadow:0_0_14px_var(--am2-card-fade),0_0_4px_var(--am2-card-fade)] flex flex-col items-center px-6 pt-24 pb-8 text-center"
	>
		{#if item.title}<h3 class={[titleSize[variant], 'text-strong/90 light:text-strong']}>
				{item.title}
			</h3>{/if}
		{#if item.description}
			<p class={['text-subtle/80 light:text-subtle mt-3', bodySize[variant]]}>
				{item.description}
			</p>
		{/if}
		{#if item.link}<ArrowLink href={item.link.href} label={item.link.label} class="mt-6" />{/if}
	</div>
</article>
