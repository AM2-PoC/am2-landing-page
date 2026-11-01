<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		for: htmlFor,
		required = false,
		children
	}: { for: string; required?: boolean; children: Snippet } = $props();
</script>

<label for={htmlFor} class="text-label text-strong block pb-2 font-mono uppercase">
	{@render children()}
	{#if required}<span class="text-required ml-0.5" aria-hidden="true">*</span>{/if}
</label>
