<script lang="ts">
	import '@fontsource-variable/inter';
	import '@fontsource/dm-mono/400.css';
	import '@fontsource/dm-mono/500.css';
	import '../app.css';

	import { untrack } from 'svelte';
	import type { LayoutProps } from './$types';
	import SkipLink from '#lib/components/layout/SkipLink.svelte';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
	import { ThemeState, setThemeState } from '#lib/theme/theme-state.svelte.ts';
	import { startReveal } from '#lib/utils/reveal.ts';

	let { data, children }: LayoutProps = $props();

	// The server already set <html data-theme>; keep it in sync when the visitor presses the theme button
	// (only the first value is needed: after that the button owns the choice)
	const theme = setThemeState(new ThemeState(untrack(() => data.themePreference)));
	$effect(() => {
		document.documentElement.dataset.theme = theme.active;
	});

	// Reveal animation for the whole site (styles/reveal.css): one observer, also for pages
	// opened later
	$effect(() => startReveal());
</script>

<SkipLink />

<SiteHeader items={data.navigation.header} locales={data.site.locales} locale={data.locale} />

<!-- On short pages the last section stretches, so its background reaches the footer -->
<main
	id="content"
	tabindex="-1"
	class="flex flex-1 flex-col focus:outline-none [&>:last-child]:grow"
>
	{@render children()}
</main>

<SiteFooter items={data.navigation.footer} tagline={data.site.footerTagline} />

{#if import.meta.env.DEV}
	{#await import('#lib/dev/FigmaOverlay.svelte') then { default: FigmaOverlay }}
		<FigmaOverlay />
	{/await}
{/if}
