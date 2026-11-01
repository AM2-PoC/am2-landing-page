<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	let { text, class: className = '' }: { text: string; class?: ClassValue } = $props();

	const paragraphs = $derived(
		text
			.split(/\n{2,}/)
			.map((p) => p.trim())
			.filter(Boolean)
	);
</script>

{#each paragraphs as paragraph, i (i)}
	<p class={[i > 0 && 'mt-4', className]}>{paragraph}</p>
{/each}
