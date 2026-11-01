<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		/** Accessible name of each button, e.g. "Show the AM² PTT dashboard" */
		labels: string[];
		active: number;
		onselect: (index: number) => void;
		class?: ClassValue;
	};
	let { labels, active, onselect, class: className = '' }: Props = $props();
</script>

<!-- Pill buttons that pick a slide (same look as CarouselDots): the active pill is long and
     orange, the others short and light. On a change the new pill grows and turns orange while
     the old one shrinks and turns light (ease-out, 450 ms: it ends within the half second after
     the click, so browsers do not count the moving pills as a layout shift), so the orange bar
     seems to slide over.
     The buttons are 24 px tall for easy tapping; -my-2 keeps the row 8 px high in the layout. -->
<div class={['flex items-center justify-center gap-2.5', className]}>
	{#each labels as label, i (i)}
		<button
			type="button"
			class="group -my-2 flex h-6 cursor-pointer items-center rounded-full"
			aria-label={label}
			aria-pressed={i === active}
			onclick={() => onselect(i)}
		>
			<span
				class={[
					'block h-2 rounded-full transition-[width,background-color] duration-450 ease-(--reveal-ease)',
					i === active
						? 'bg-accent w-15'
						: 'bg-strong light:bg-strong/15 group-hover:bg-accent/60 w-8.75'
				]}
			></span>
		</button>
	{/each}
</div>
