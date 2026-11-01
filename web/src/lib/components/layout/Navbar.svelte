<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import LocalizedLink from '#lib/components/ui/LocalizedLink.svelte';
	import NavDropdown from './NavDropdown.svelte';
	import { isActive } from '#lib/utils/nav-active.ts';
	import { navPillClass } from '#lib/utils/nav-style.ts';
	import type { NavItem } from '#lib/types/navigation.ts';

	let { items }: { items: NavItem[] } = $props();

	const currentPath = $derived(deLocalizeHref(page.url.pathname));
</script>

<nav aria-label={m.nav_main()} class="hidden lg:block">
	<ul class="flex items-center gap-6 xl:gap-8">
		{#each items as item (item.id)}
			<li>
				{#if item.children.length > 0}
					<NavDropdown {item} {currentPath} />
				{:else if item.path}
					<LocalizedLink
						href={item.path}
						class={navPillClass(isActive(item, currentPath))}
						aria-current={item.path === currentPath ? 'page' : undefined}
					>
						{item.label}
					</LocalizedLink>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
