<script lang="ts">
	import { HERO_SILHOUETTES } from './hero-silhouettes.ts';
</script>

<!-- Intro decoration of the Home hero (Figma 231:4279). Purely decorative: hidden from
     assistive technology, never receives clicks. Size, position, colours and motion live in
     styles/hero-intro.css; the parent section must carry the .hero-home class. -->
<div class="hero-silhouettes" aria-hidden="true" data-hero-part="silhouettes">
	{#each HERO_SILHOUETTES as item, i (item.name)}
		<svg
			class="hero-silhouette"
			data-side={item.side}
			data-anchor={item.anchor}
			style:--i={i}
			style:--w={item.width}
			style:--h={item.height}
			style:--x={item.x}
			style:--y={item.y}
			style:--r="{item.rotate}deg"
			viewBox="0 0 {item.width} {item.height}"
			fill="none"
			focusable="false"
		>
			{#each item.shapes as shape, s (s)}
				{#if shape.kind === 'rect'}
					<rect
						x={shape.x}
						y={shape.y}
						width={shape.width}
						height={shape.height}
						rx={shape.radius}
						data-paint={shape.paint}
						data-outline={shape.outline || undefined}
						style:--a={shape.alpha}
					/>
				{:else if shape.kind === 'circle'}
					<circle
						cx={shape.cx}
						cy={shape.cy}
						r={shape.r}
						data-paint={shape.paint}
						data-outline={shape.outline || undefined}
						style:--a={shape.alpha}
					/>
				{:else}
					<line
						x1={shape.x1}
						y1={shape.y1}
						x2={shape.x2}
						y2={shape.y2}
						data-paint={shape.paint}
						data-outline
						style:--a={shape.alpha}
					/>
				{/if}
			{/each}
		</svg>
	{/each}
</div>
