<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = Omit<HTMLInputAttributes, 'type' | 'checked'> & {
		checked?: boolean;
		invalid?: boolean;
		children: Snippet;
	};
	let { checked = $bindable(false), invalid = false, id, children, ...rest }: Props = $props();
</script>

<div class="flex items-start gap-2.5">
	<input
		type="checkbox"
		{id}
		bind:checked
		aria-invalid={invalid || undefined}
		class="accent-accent aria-[invalid=true]:outline-error mt-0.75 size-3.5 shrink-0 cursor-pointer aria-[invalid=true]:outline-2"
		{...rest}
	/>
	<label for={id} class="text-micro text-strong cursor-pointer">{@render children()}</label>
</div>
