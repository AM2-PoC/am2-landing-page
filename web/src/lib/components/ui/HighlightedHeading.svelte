<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { splitHighlight } from '#lib/utils/highlight.ts';

	type Props = {
		text: string;
		highlight?: string | null;
		level?: 1 | 2 | 3;
		size?: 'display' | 'h2' | 'h3-card' | 'h3';
		align?: 'left' | 'center';
		id?: string;
		class?: ClassValue;
	};

	let {
		text,
		highlight = null,
		level = 2,
		size = 'h2',
		align = 'left',
		id,
		class: className = ''
	}: Props = $props();

	const sizes = {
		display: 'text-display',
		h2: 'text-h2',
		'h3-card': 'text-h3-card',
		h3: 'text-h3'
	};
	const parts = $derived(splitHighlight(text, highlight));
</script>

{#snippet lines(value: string)}
	{#each value.split('\n') as line, i (i)}{#if i > 0}<br />{/if}{line}{/each}
{/snippet}

<svelte:element
	this={`h${level}`}
	{id}
	class={[sizes[size], 'text-strong', align === 'center' && 'text-center', className]}
>
	{#each parts as part, i (i)}
		{#if part.accent}<span class="text-accent-heading">{@render lines(part.text)}</span
			>{:else}{@render lines(part.text)}{/if}
	{/each}
</svelte:element>
