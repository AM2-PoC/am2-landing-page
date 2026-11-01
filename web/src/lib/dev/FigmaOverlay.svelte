<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeUrl } from '#lib/paraglide/runtime.js';

	const screenshots = import.meta.glob<string>('./figma/*.png', {
		query: '?url',
		import: 'default',
		eager: true
	});

	const FRAME_WIDTH = 1549;
	const STORAGE_KEY = 'am2-figma-overlay';

	let visible = $state(false);
	let opacity = $state(0.5);
	let difference = $state(false);

	const slug = $derived.by(() => {
		const path = deLocalizeUrl(page.url).pathname.replace(/\/+$/, '');
		return path === '' ? 'home' : path.slice(1).replaceAll('/', '-');
	});
	const src = $derived(screenshots[`./figma/${slug}.png`]);

	$effect.pre(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
			visible = saved.visible ?? false;
			opacity = saved.opacity ?? 0.5;
			difference = saved.difference ?? false;
		} catch {
			// storage unavailable: keep defaults
		}
	});

	$effect(() => {
		const settings = JSON.stringify({ visible, opacity, difference });
		try {
			localStorage.setItem(STORAGE_KEY, settings);
		} catch {
			// storage unavailable: ignore
		}
	});
</script>

{#if visible && src}
	<img
		{src}
		alt=""
		aria-hidden="true"
		class="pointer-events-none absolute top-0 left-1/2 z-[9999] max-w-none -translate-x-1/2"
		style:width="{FRAME_WIDTH}px"
		style:opacity
		style:mix-blend-mode={difference ? 'difference' : 'normal'}
	/>
{/if}

<div
	data-dev-tool
	class="rounded-field border-line bg-surface/95 text-micro text-secondary fixed bottom-4 left-4 z-[10000] flex items-center gap-3 border px-3 py-2 font-mono shadow-lg"
>
	<label class="flex items-center gap-1.5">
		<input type="checkbox" bind:checked={visible} />
		Figma: {slug}
	</label>
	{#if !src}
		<span class="text-error">no screenshot</span>
	{:else}
		<label class="flex items-center gap-1.5">
			<input type="range" min="0" max="1" step="0.05" bind:value={opacity} class="w-20" />
			{Math.round(opacity * 100)}%
		</label>
		<label class="flex items-center gap-1.5">
			<input type="checkbox" bind:checked={difference} />
			diff
		</label>
	{/if}
</div>
