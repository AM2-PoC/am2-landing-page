<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import LocalizedLink from './LocalizedLink.svelte';
	import Icon from './Icon.svelte';

	let {
		href,
		label,
		class: className = ''
	}: { href: string; label: string; class?: ClassValue } = $props();
</script>

<LocalizedLink
	{href}
	class={['group text-link text-accent-ink inline-flex items-center gap-2 py-1', className]}
>
	<span class="underline-offset-4 group-hover:underline">{label}</span>
	<Icon
		name="arrow-right"
		class="size-3.75 transition-transform duration-150 group-hover:translate-x-0.5"
	/>
</LocalizedLink>
