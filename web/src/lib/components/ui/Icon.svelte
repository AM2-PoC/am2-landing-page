<script lang="ts" module>
	import { cleanSvg } from '#lib/utils/svg.ts';
	import { iconFileName } from '#lib/utils/icon-name.ts';

	const files = import.meta.glob('../../assets/icons/*.svg', {
		query: '?raw',
		import: 'default',
		eager: true
	}) as Record<string, string>;

	// Inlined into every page: metadata such as C2PA credentials is removed once, here
	const registry: Record<string, string> = Object.fromEntries(
		Object.entries(files).map(([path, svg]) => [
			path.split('/').pop()!.replace('.svg', ''),
			cleanSvg(svg)
		])
	);
</script>

<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		name: string;
		class?: ClassValue;
		label?: string;
	};

	let { name, class: className = 'size-6', label }: Props = $props();

	const svg = $derived(registry[iconFileName(name)]);

	$effect(() => {
		if (import.meta.env.DEV && !svg)
			console.warn(`[Icon] missing file: src/lib/assets/icons/${name}.svg`);
	});
</script>

{#if svg}
	<span
		class={['inline-flex shrink-0 [&>svg]:size-full', className]}
		role={label ? 'img' : undefined}
		aria-label={label}
		aria-hidden={label ? undefined : 'true'}
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted local SVG files bundled at build time -->
		{@html svg}
	</span>
{/if}
