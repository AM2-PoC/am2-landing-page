<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import type { SectionTone } from '#lib/types/content.ts';
	import Container from './Container.svelte';
	import SectionDecor from '#lib/components/decor/SectionDecor.svelte';

	type Props = {
		/** Background of the full-width band */
		tone?: SectionTone;
		/** Vertical padding from the spacing system: default 64 → 120 px, compact 48 → 80 px */
		spacing?: 'default' | 'compact' | 'none';
		/** Wrap the content in the site container (max 1280 px + side gutters) */
		contained?: boolean;
		/** Fade in from the colour of the section above (styles/section-tones.css):
		 *  'section' over about 40 % of the section, 'none' a flat colour without a fade */
		blend?: 'section' | 'none';
		/** Background geometry on the left and right (styles/decor.css) */
		decor?: boolean;
		/** Widest content of the section (CSS length) when narrower than the container,
		 *  so the decoration can use the free space beside it, e.g. '64rem' for max-w-256 */
		contentWidth?: string;
		/** Reveal animation (styles/reveal.css): every top-level block of the section rises
		 *  into view when it is first scrolled to; off for heroes, which have their own */
		reveal?: boolean;
		id?: string;
		labelledby?: string;
		class?: ClassValue;
		children: Snippet;
	};

	let {
		tone = 'canvas',
		blend = 'section',
		spacing = 'default',
		contained = true,
		decor = true,
		contentWidth,
		reveal = true,
		id,
		labelledby,
		class: className,
		children
	}: Props = $props();

	const spacings = { default: 'section-y', compact: 'section-y-sm', none: '' };
</script>

<!-- data-section-tone sets the background (styles/section-tones.css: it fades in from the section
     above, so there is no hard colour edge) and lets two neighbouring sections with the same
     background share one rhythm.
     relative + isolate: the decoration layer sits above the background and below the content.
     @container: decoration inside the section sizes itself against the section width. -->
<section
	{id}
	aria-labelledby={labelledby}
	data-section-tone={tone}
	data-section-blend={blend}
	style:--decor-content-width={contentWidth}
	class={['@container relative isolate', spacings[spacing], className]}
>
	{#if decor}<SectionDecor {reveal} />{/if}
	{#if contained}
		<Container data-reveal-group={reveal ? '' : undefined}>{@render children()}</Container>
	{:else}
		{@render children()}
	{/if}
</section>
