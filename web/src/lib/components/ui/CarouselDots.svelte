<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	let {
		count,
		active = 0,
		class: className = ''
	}: { count: number; active?: number; class?: ClassValue } = $props();

	const indexes = $derived(Array.from({ length: count }, (_, i) => i));
</script>

<div class={['flex items-center justify-center gap-2.5', className]} aria-hidden="true">
	{#each indexes as i (i)}
		<span
			class={[
				'h-2 rounded-full transition-all duration-300',
				i === active ? 'bg-accent w-15' : 'bg-strong light:bg-strong/15 w-8.75'
			]}
		></span>
	{/each}
</div>
