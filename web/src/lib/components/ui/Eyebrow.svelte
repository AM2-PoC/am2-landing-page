<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	let { children, class: className = '' }: { children: Snippet; class?: ClassValue } = $props();
</script>

<p class={['text-eyebrow text-subtle font-mono uppercase', className]}>{@render children()}</p>
