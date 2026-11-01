<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import LocalizedLink from '#lib/components/ui/LocalizedLink.svelte';
	import { isActive } from '#lib/utils/nav-active.ts';
	import { navItemClass, navPillClass } from '#lib/utils/nav-style.ts';
	import type { NavItem } from '#lib/types/navigation.ts';

	let { item, currentPath }: { item: NavItem; currentPath: string } = $props();

	let open = $state(false);
	let openChildId = $state<number | null>(null);
	let root = $state<HTMLElement>();
	let button = $state<HTMLButtonElement>();
	let timer: ReturnType<typeof setTimeout> | undefined;

	const panelId = $derived(`nav-panel-${item.id}`);

	const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

	function setOpen(value: boolean) {
		clearTimeout(timer);
		open = value;
		if (!value) openChildId = null;
	}

	// A link in the panel was used (mouse, touch or keyboard): close the panel on the new page,
	// otherwise it stays open over the content (touch and keyboard never "leave" it)
	afterNavigate(() => setOpen(false));

	function scheduleOpen(value: boolean, delay: number) {
		clearTimeout(timer);
		timer = setTimeout(() => setOpen(value), delay);
	}

	function handleClick(event: MouseEvent) {
		const toggle = event.detail === 0 || !canHover();
		setOpen(toggle ? !open : true);
	}

	function handleChildClick(event: MouseEvent, childId: number) {
		const toggle = event.detail === 0 || !canHover();
		openChildId = toggle && openChildId === childId ? null : childId;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			setOpen(false);
			button?.focus();
		}
	}

	function handleWindowClick(event: MouseEvent) {
		if (open && root && !root.contains(event.target as Node)) setOpen(false);
	}

	function handleFocusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (next && root && !root.contains(next)) setOpen(false);
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

{#snippet chevron(extra: string)}
	<svg
		class={['size-3 transition-transform duration-150', extra]}
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
{/snippet}

<div
	bind:this={root}
	class="relative"
	role="presentation"
	onpointerenter={() => canHover() && scheduleOpen(true, 120)}
	onpointerleave={() => canHover() && scheduleOpen(false, 250)}
	onfocusout={handleFocusOut}
>
	<button
		bind:this={button}
		type="button"
		class={navPillClass(isActive(item, currentPath))}
		aria-expanded={open}
		aria-controls={panelId}
		onclick={handleClick}
	>
		{item.label}
		{@render chevron(open ? 'rotate-180' : '')}
	</button>

	{#if open}
		<div id={panelId} class="absolute top-full left-0 z-50 pt-3">
			<ul
				class="rounded-card border-line-chrome bg-chrome light:shadow-black/10 min-w-56 border p-2 shadow-2xl shadow-black/40"
			>
				{#each item.children as child (child.id)}
					<li class="relative">
						{#if child.children.length > 0}
							<button
								type="button"
								class={navItemClass(isActive(child, currentPath))}
								aria-expanded={openChildId === child.id}
								aria-controls="{panelId}-{child.id}"
								onpointerenter={() => canHover() && (openChildId = child.id)}
								onclick={(event) => handleChildClick(event, child.id)}
							>
								{child.label}
								{@render chevron('-rotate-90')}
							</button>

							{#if openChildId === child.id}
								<div id="{panelId}-{child.id}" class="absolute top-0 left-full pl-2">
									<ul
										class="rounded-card border-line-chrome bg-chrome light:shadow-black/10 min-w-64 border p-2 shadow-2xl shadow-black/40"
									>
										{#each child.children as leaf (leaf.id)}
											{#if leaf.path}
												<li>
													<LocalizedLink
														href={leaf.path}
														class={navItemClass(leaf.path === currentPath)}
														aria-current={leaf.path === currentPath ? 'page' : undefined}
													>
														{leaf.label}
													</LocalizedLink>
												</li>
											{/if}
										{/each}
									</ul>
								</div>
							{/if}
						{:else if child.path}
							<LocalizedLink
								href={child.path}
								class={navItemClass(child.path === currentPath)}
								aria-current={child.path === currentPath ? 'page' : undefined}
								onpointerenter={() => (openChildId = null)}
							>
								{child.label}
							</LocalizedLink>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
