<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import type { ImageAsset } from '#lib/types/content.ts';

	type Props = {
		image: ImageAsset | null | undefined;
		fit?: 'cover' | 'contain' | 'natural';
		priority?: boolean;
		/** Load right away, but without high priority (e.g. the next slide of a slider) */
		eager?: boolean;
		sizes?: string;
		class?: ClassValue;
	};

	let {
		image,
		fit = 'cover',
		priority = false,
		eager = false,
		sizes,
		class: className = ''
	}: Props = $props();

	const fits = {
		cover: 'size-full object-cover',
		contain: 'object-contain',
		natural: 'h-auto w-full'
	};
</script>

{#if image}
	<img
		src={image.src}
		srcset={image.srcset}
		{sizes}
		alt={image.alt}
		width={image.width}
		height={image.height}
		loading={priority || eager ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding="async"
		class={['block', fits[fit], className]}
	/>
{:else}
	<div
		class={['from-surface to-canvas-raised bg-linear-to-br', className]}
		aria-hidden="true"
	></div>
{/if}
