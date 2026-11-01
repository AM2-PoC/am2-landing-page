<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import LocalizedLink from '#lib/components/ui/LocalizedLink.svelte';
	import { nextLocale } from '#lib/i18n/locale-switch.ts';
	import { chip, chipInteractive } from '#lib/utils/nav-style.ts';
	import type { SiteLocale } from '#lib/types/site.ts';

	let { locales, current }: { locales: SiteLocale[]; current: string } = $props();

	// Same page (and query string) in the other language: /about-us ⇄ /id/about-us
	const path = $derived(deLocalizeHref(page.url.pathname) + page.url.search);
	const target = $derived.by(() => {
		const code = nextLocale(
			locales.map((l) => l.code),
			current
		);
		return locales.find((l) => l.code === code) ?? null;
	});
</script>

<!-- One button that shows the current language; a click opens the same page in the next one.
     A full page load (data-sveltekit-reload) so every text, the menu and <html lang> switch together. -->
{#if target}
	<LocalizedLink
		href={path}
		locale={target.code}
		hreflang={target.code}
		data-sveltekit-reload
		class={[chip, chipInteractive]}
	>
		{current}<span class="sr-only">: {m.language_switch({ language: target.name })}</span>
	</LocalizedLink>
{:else}
	<span class={chip}>{current}</span>
{/if}
