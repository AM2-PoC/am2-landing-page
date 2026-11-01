<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'class'> & {
		children: Snippet;
		class?: ClassValue;
	};
	let { children, class: className = '', ...attributes }: Props = $props();
</script>

<div {...attributes} class={['container-site', className]}>
	{@render children()}
</div>
