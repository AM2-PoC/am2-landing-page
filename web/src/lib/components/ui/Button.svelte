<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import LocalizedLink from './LocalizedLink.svelte';

	type Props = {
		href?: string;
		type?: 'button' | 'submit';
		shape?: 'pill' | 'card';
		full?: boolean;
		loading?: boolean;
		disabled?: boolean;
		class?: ClassValue;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	};

	let {
		href,
		type = 'button',
		shape = 'pill',
		full = false,
		loading = false,
		disabled = false,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const classes = $derived([
		'inline-flex items-center justify-center gap-2 bg-accent px-6 py-3 text-button text-on-accent',
		'transition duration-150 hover:bg-accent-hover active:scale-98',
		'disabled:cursor-not-allowed disabled:opacity-40',
		shape === 'pill' ? 'rounded-full' : 'rounded-card',
		full && 'w-full',
		className
	]);
</script>

{#if href}
	<LocalizedLink {href} class={classes}>{@render children()}</LocalizedLink>
{:else}
	<button {type} class={classes} disabled={disabled || loading} aria-busy={loading} {onclick}>
		{#if loading}
			<span
				class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
				aria-hidden="true"
			></span>
		{/if}
		{@render children()}
	</button>
{/if}
