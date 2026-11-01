<script lang="ts">
	import type { SectionItemData } from '#lib/types/content.ts';

	let { item, first = false }: { item: SectionItemData; first?: boolean } = $props();
</script>

<div class={['py-6', !first && 'border-line border-t']}>
	{#if item.title}<h3 class="text-h3 text-strong">{item.title}</h3>{/if}
	{#if item.description}<p class="text-tertiary mt-2 text-base">{item.description}</p>{/if}
</div>
