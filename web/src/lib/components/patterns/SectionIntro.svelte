<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import Eyebrow from '#lib/components/ui/Eyebrow.svelte';
	import HighlightedHeading from '#lib/components/ui/HighlightedHeading.svelte';
	import Paragraphs from '#lib/components/ui/Paragraphs.svelte';
	import IntroDecor from '#lib/components/decor/IntroDecor.svelte';

	type Props = {
		eyebrow?: string | null;
		heading?: string | null;
		highlight?: string | null;
		body?: string | null;
		level?: 1 | 2;
		size?: 'display' | 'h2';
		align?: 'left' | 'center';
		headingId?: string;
		/** Geometric accent in the free space beside a centred heading (shown only where it fits) */
		decor?: boolean;
		/** Reveal animation (styles/reveal.css): eyebrow, heading and text rise in one after the
		 *  other, when scrolled to or, for the intro of a page (hero), right after loading */
		reveal?: 'scroll' | 'load';
		class?: ClassValue;
	};

	let {
		eyebrow = null,
		heading = null,
		highlight = null,
		body = null,
		level = 2,
		size = 'h2',
		align = 'center',
		headingId,
		decor = true,
		reveal = 'scroll',
		class: className = ''
	}: Props = $props();
</script>

{#if eyebrow || heading || body}
	<div
		data-reveal-group={reveal === 'scroll' ? '' : undefined}
		data-reveal-load={reveal === 'load' ? '' : undefined}
		class={[align === 'center' && 'relative mx-auto max-w-3xl text-center', className]}
	>
		{#if decor && align === 'center' && heading}<IntroDecor />{/if}
		{#if eyebrow}<Eyebrow>{eyebrow}</Eyebrow>{/if}
		{#if heading}
			<HighlightedHeading
				text={heading}
				{highlight}
				{level}
				{size}
				{align}
				id={headingId}
				class={eyebrow ? 'mt-2.5' : undefined}
			/>
		{/if}
		{#if body}
			<div class={['mt-5', align === 'left' && 'max-w-2xl']}>
				<Paragraphs text={body} class="text-secondary text-lg" />
			</div>
		{/if}
	</div>
{/if}
