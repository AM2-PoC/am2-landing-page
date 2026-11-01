<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { fieldBase } from '#lib/utils/field-style.ts';
	import Icon from './Icon.svelte';

	type Option = { value: string | number; label: string };
	type Props = Omit<HTMLSelectAttributes, 'value'> & {
		options: Option[];
		placeholder?: string;
		value?: string;
		invalid?: boolean;
	};

	let {
		options,
		placeholder = '—',
		value = $bindable(''),
		invalid = false,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div class="relative">
	<select
		bind:value
		aria-invalid={invalid || undefined}
		class={[
			fieldBase,
			'[&>option]:bg-surface h-11 appearance-none rounded-full pr-11 pl-5',
			className
		]}
		{...rest}
	>
		<option value="" disabled>{placeholder}</option>
		{#each options as option (option.value)}
			<option value={String(option.value)}>{option.label}</option>
		{/each}
	</select>
	<Icon
		name="chevron-down"
		class="text-strong pointer-events-none absolute top-1/2 right-5 size-2.5 -translate-y-1/2"
	/>
</div>
