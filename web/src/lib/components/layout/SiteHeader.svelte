<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import LocalizedLink from '#lib/components/ui/LocalizedLink.svelte';
	import Navbar from './Navbar.svelte';
	import MobileNav from './MobileNav.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import type { NavItem } from '#lib/types/navigation.ts';
	import type { SiteLocale } from '#lib/types/site.ts';

	type Props = { items: NavItem[]; locales: SiteLocale[]; locale: string };
	let { items, locales, locale }: Props = $props();
</script>

<header class="border-line-chrome sticky top-0 z-40 border-b">
	<div class="bg-chrome/90 backdrop-blur-navbar absolute inset-0 -z-10" aria-hidden="true"></div>

	<div class="container-site flex h-16 items-center justify-between gap-6">
		<LocalizedLink
			href="/"
			class="text-logo text-accent light:text-black font-mono"
			aria-label={m.home_link()}>AM²</LocalizedLink
		>

		<Navbar {items} />

		<!-- Theme and language buttons stay visible on every screen size, next to the mobile menu button -->
		<div class="flex items-center gap-2.5">
			<ThemeToggle />
			<LanguageSwitcher {locales} current={locale} />
			<MobileNav {items} {locales} {locale} />
		</div>
	</div>
</header>
