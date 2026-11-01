<script lang="ts">
	import Icon from '#lib/components/ui/Icon.svelte';
	import ArrowLink from '#lib/components/ui/ArrowLink.svelte';
	import type { SectionItemData } from '#lib/types/content.ts';

	type Props = {
		item: SectionItemData;
		variant?: 'compact' | 'feature';
		/** h2 when the section has no heading of its own, so the outline never skips a level */
		headingLevel?: 2 | 3;
	};
	let { item, variant = 'compact', headingLevel = 3 }: Props = $props();
</script>

{#if variant === 'compact'}
	<div class="flex flex-col items-center text-center">
		{#if item.iconKey}<Icon name={item.iconKey} class="text-accent size-17.5" />{/if}
		{#if item.title}<svelte:element this={`h${headingLevel}`} class="text-h4 text-strong mt-5"
				>{item.title}</svelte:element
			>{/if}
		{#if item.description}<p class="text-tertiary mt-2 max-w-68 text-sm">{item.description}</p>{/if}
		{#if item.link}<ArrowLink href={item.link.href} label={item.link.label} class="mt-4" />{/if}
	</div>
{:else}
	<div>
		{#if item.iconKey}<Icon name={item.iconKey} class="text-accent size-20" />{/if}
		{#if item.title}<svelte:element this={`h${headingLevel}`} class="text-h2 text-strong mt-6"
				>{item.title}</svelte:element
			>{/if}
		{#if item.description}<p class="text-tertiary mt-6 max-w-xl text-base">
				{item.description}
			</p>{/if}
		{#if item.link}<ArrowLink href={item.link.href} label={item.link.label} class="mt-8" />{/if}
	</div>
{/if}
