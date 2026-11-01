<script lang="ts">
	import Icon from '#lib/components/ui/Icon.svelte';
	import Paragraphs from '#lib/components/ui/Paragraphs.svelte';

	let {
		question,
		answer,
		first = false
	}: { question: string; answer: string | null; first?: boolean } = $props();
</script>

<details class={['group', !first && 'border-line border-t']}>
	<summary
		class="text-body-strong text-secondary hover:text-strong flex cursor-pointer list-none items-center justify-between gap-6 py-6 transition-colors duration-150 [&::-webkit-details-marker]:hidden"
	>
		{question}
		<Icon
			name="plus"
			class="text-accent size-3.5 shrink-0 transition-transform duration-300 group-open:rotate-45"
		/>
	</summary>
	{#if answer}
		<div class="pr-10 pb-6">
			<Paragraphs text={answer} class="text-tertiary text-base" />
		</div>
	{/if}
</details>
