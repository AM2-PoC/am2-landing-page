<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { m } from '#lib/paraglide/messages.js';
	import Icon from '#lib/components/ui/Icon.svelte';
	import CarouselDots from '#lib/components/ui/CarouselDots.svelte';
	import type { SlideTrack } from '#lib/utils/slide-track.svelte.ts';

	let { slider, class: className }: { slider: SlideTrack; class?: ClassValue } = $props();

	let prev = $state<HTMLButtonElement>();
	let next = $state<HTMLButtonElement>();

	const button =
		'inline-flex size-11 items-center justify-center rounded-full border border-line-subtle bg-control text-strong transition-colors duration-150 hover:bg-control-hover disabled:opacity-30 disabled:hover:bg-control';
</script>

<!-- Phone/tablet controls under a slider: previous, position dots, next.
     The sr-only line tells screen readers which slide is now in view. -->
<div class={['flex items-center justify-center gap-5 lg:hidden', className]}>
	<button
		bind:this={prev}
		type="button"
		class={button}
		aria-label={m.carousel_prev()}
		disabled={slider.atStart}
		onclick={() => slider.move(-1, prev, next)}
	>
		<Icon name="chevron-left" class="size-5" />
	</button>
	<CarouselDots count={slider.count} active={slider.active} />
	<button
		bind:this={next}
		type="button"
		class={button}
		aria-label={m.carousel_next()}
		disabled={slider.atEnd}
		onclick={() => slider.move(1, prev, next)}
	>
		<Icon name="chevron-right" class="size-5" />
	</button>
</div>

<p class="sr-only" aria-live="polite">
	{m.carousel_status({ current: String(slider.active + 1), total: String(slider.count) })}
</p>
