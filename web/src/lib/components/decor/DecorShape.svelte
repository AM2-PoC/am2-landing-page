<script lang="ts">
	import type { DecorSlot } from './decor-layouts.ts';

	let { shape, side, anchor, size, y }: DecorSlot = $props();

	// edge: centred on the section edge, partly cut off; float: fully visible in free space
	const kinds = { rings: 'edge', chevrons: 'edge', diamonds: 'float', cross: 'float' } as const;
	const viewBoxes = {
		rings: '0 0 200 200',
		chevrons: '0 0 200 236',
		diamonds: '0 0 120 120',
		cross: '0 0 36 36'
	};
	// When the shape is scaled down it keeps hugging its corner
	const align = { top: 'YMin', middle: 'YMid', bottom: 'YMax' };
</script>

<svg
	class="decor-shape"
	data-shape={shape}
	data-kind={kinds[shape]}
	data-side={side}
	data-anchor={anchor}
	data-size={size}
	style:--decor-y={y === undefined ? undefined : `${y * 100}%`}
	viewBox={viewBoxes[shape]}
	preserveAspectRatio="xMid{align[anchor]} meet"
	fill="none"
	stroke="currentColor"
	stroke-width="1"
	focusable="false"
>
	{#if shape === 'rings'}
		<circle cx="100" cy="100" r="99.5" />
		<circle cx="100" cy="100" r="91" />
		<circle cx="100" cy="100" r="82.5" />
	{:else if shape === 'chevrons'}
		<path d="M100 .5 199.5 100 100 199.5.5 100Z" />
		<path d="M.5 118 100 217.5 199.5 118" />
		<path d="M.5 136 100 235.5 199.5 136" />
	{:else if shape === 'diamonds'}
		<path d="M60 .5 119.5 60 60 119.5.5 60Z" />
		<path d="M60 22 98 60 60 98 22 60Z" />
	{:else}
		<path d="M18 0v36M0 18h36" />
	{/if}
</svg>
