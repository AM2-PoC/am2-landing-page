<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { fieldBase } from '#lib/utils/field-style.ts';

	type Props = Omit<HTMLTextareaAttributes, 'value'> & { value?: string; invalid?: boolean };
	let { value = $bindable(''), invalid = false, class: className = '', ...rest }: Props = $props();
</script>

<textarea
	bind:value
	aria-invalid={invalid || undefined}
	class={[fieldBase, 'rounded-field min-h-22 resize-y px-5 py-3', className]}
	{...rest}></textarea>
