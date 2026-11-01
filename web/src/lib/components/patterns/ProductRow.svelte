<script lang="ts">
	import Picture from '#lib/components/ui/Picture.svelte';
	import ArrowLink from '#lib/components/ui/ArrowLink.svelte';
	import type { ProductData } from '#lib/types/content.ts';

	type Props = { product: ProductData; reverse?: boolean; exploreLabel: string };
	let { product, reverse = false, exploreLabel }: Props = $props();
</script>

<article data-reveal-group class="lg:gap-x-split grid items-center gap-y-8 lg:grid-cols-2">
	<div data-reveal-role="media" class={['flex justify-center', reverse && 'lg:order-2']}>
		<Picture
			image={product.image}
			fit="contain"
			sizes="(min-width: 1024px) 40vw, 80vw"
			class="h-64 w-full max-w-md sm:h-72 lg:h-96"
		/>
	</div>
	<div data-reveal-group class="min-w-0">
		<h2 class="text-h2 text-accent-heading">{product.name}</h2>
		<p class="text-secondary mt-5 text-lg">{product.description}</p>
		{#if product.platformHref}
			<ArrowLink href={product.platformHref} label={exploreLabel} class="mt-8" />
		{/if}
	</div>
</article>
