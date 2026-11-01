<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { deLocalizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import LocalizedLink from '#lib/components/ui/LocalizedLink.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import { collectActiveGroupIds, isActive } from '#lib/utils/nav-active.ts';
	import { mobileNavItemClass } from '#lib/utils/nav-style.ts';
	import type { NavItem } from '#lib/types/navigation.ts';
	import type { SiteLocale } from '#lib/types/site.ts';

	type Props = { items: NavItem[]; locales: SiteLocale[]; locale: string };
	let { items, locales, locale }: Props = $props();

	let open = $state(false);
	let expanded = $state<number[]>([]);
	let menuButton = $state<HTMLButtonElement>();
	let panel = $state<HTMLElement>();

	const currentPath = $derived(deLocalizeHref(page.url.pathname));

	afterNavigate(() => {
		open = false;
	});

	// The menu only exists below the lg breakpoint: when the window grows past it (rotating a
	// tablet, resizing the browser) the open menu closes, so the page can scroll again
	const desktop = new MediaQuery('min-width: 64rem');
	$effect(() => {
		if (desktop.current) open = false;
	});

	$effect(() => {
		if (!open) return;
		document.body.style.overflow = 'hidden';
		panel?.querySelector<HTMLElement>('a[href], button')?.focus();
		return () => {
			document.body.style.overflow = '';
		};
	});

	function openMenu() {
		expanded = collectActiveGroupIds(items, currentPath);
		open = true;
	}

	function closeMenu() {
		open = false;
		menuButton?.focus();
	}

	function toggleGroup(id: number) {
		expanded = expanded.includes(id) ? expanded.filter((x) => x !== id) : [...expanded, id];
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') closeMenu();

		if (event.key === 'Tab' && panel) {
			const focusable = [...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
			const first = focusable[0];
			const last = focusable.at(-1);
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last?.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first?.focus();
			}
		}
	}

	const iconButton =
		'inline-flex size-9 items-center justify-center rounded-full border border-line-subtle bg-control text-secondary transition-colors duration-150 hover:bg-control-hover hover:text-strong';
</script>

<svelte:window onkeydown={handleKeydown} />

<button
	bind:this={menuButton}
	type="button"
	class={[iconButton, 'lg:hidden']}
	aria-label={m.open_menu()}
	aria-expanded={open}
	aria-controls="mobile-nav"
	onclick={openMenu}
>
	<svg class="size-4" viewBox="0 0 16 16" aria-hidden="true">
		<path
			d="M2 4h12M2 8h12M2 12h12"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
	</svg>
</button>

{#if open}
	<div class="fixed inset-0 z-50 lg:hidden">
		<button
			type="button"
			tabindex="-1"
			class="absolute inset-0 bg-black/60"
			aria-label={m.close_menu()}
			onclick={closeMenu}
		></button>

		<div
			bind:this={panel}
			id="mobile-nav"
			role="dialog"
			aria-modal="true"
			aria-label={m.nav_main()}
			class="border-line-chrome bg-chrome absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l"
		>
			<div class="border-line-chrome flex h-16 items-center justify-between border-b px-4">
				<span class="text-logo text-accent light:text-black font-mono">AM²</span>
				<button type="button" class={iconButton} aria-label={m.close_menu()} onclick={closeMenu}>
					<svg class="size-4" viewBox="0 0 16 16" aria-hidden="true">
						<path
							d="M4 4l8 8M12 4l-8 8"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			</div>

			<nav aria-label={m.nav_main()} class="flex-1 overflow-y-auto px-4 py-6">
				{@render tree(items, 0)}
			</nav>

			<div class="border-line-chrome flex items-center justify-between gap-4 border-t p-4">
				<span class="text-small text-tertiary">{m.language()}</span>
				<LanguageSwitcher {locales} current={locale} />
			</div>
		</div>
	</div>
{/if}

{#snippet tree(nodes: NavItem[], depth: number)}
	<ul class={depth === 0 ? 'space-y-1' : 'border-line mt-1 ml-3 space-y-1 border-l pl-3'}>
		{#each nodes as node (node.id)}
			<li>
				{#if node.children.length > 0}
					<button
						type="button"
						class={mobileNavItemClass(isActive(node, currentPath))}
						aria-expanded={expanded.includes(node.id)}
						onclick={() => toggleGroup(node.id)}
					>
						{node.label}
						<svg
							class={[
								'size-3 transition-transform duration-150',
								expanded.includes(node.id) && 'rotate-180'
							]}
							viewBox="0 0 12 12"
							aria-hidden="true"
						>
							<path
								d="M3 4.5 6 7.5 9 4.5"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
					{#if expanded.includes(node.id)}
						{@render tree(node.children, depth + 1)}
					{/if}
				{:else if node.path}
					<LocalizedLink
						href={node.path}
						class={mobileNavItemClass(node.path === currentPath)}
						aria-current={node.path === currentPath ? 'page' : undefined}
					>
						{node.label}
					</LocalizedLink>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}
