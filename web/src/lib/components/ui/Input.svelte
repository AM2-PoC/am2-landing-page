<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { fieldBase } from '#lib/utils/field-style.ts';

	type Props = Omit<HTMLInputAttributes, 'value'> & { value?: string; invalid?: boolean };
	let { value = $bindable(''), invalid = false, class: className = '', ...rest }: Props = $props();
</script>

<input
	bind:value
	aria-invalid={invalid || undefined}
	class={[fieldBase, 'h-11 rounded-full px-5', className]}
	{...rest}
/>
