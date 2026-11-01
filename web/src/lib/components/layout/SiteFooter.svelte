<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import LocalizedLink from '#lib/components/ui/LocalizedLink.svelte';
	import Container from './Container.svelte';
	import type { NavItem } from '#lib/types/navigation.ts';

	let { items, tagline }: { items: NavItem[]; tagline: string } = $props();

	const year = new Date().getFullYear();
</script>

<footer class="border-line-chrome bg-chrome pt-section-sm border-t pb-10">
	<Container data-reveal-group>
		<div
			data-reveal-group
			class="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-10 lg:grid-cols-4"
		>
			<div class="col-span-full lg:col-span-1">
				<LocalizedLink
					href="/"
					class="text-logo-sm text-accent light:text-black inline-block py-1 font-mono"
					aria-label={m.home_link()}>AM²</LocalizedLink
				>
				<p class="text-small text-tertiary mt-2.5 max-w-45">{tagline}</p>
			</div>

			{#each items as group (group.id)}
				<nav aria-labelledby="footer-nav-{group.id}">
					<h2 id="footer-nav-{group.id}" class="text-overline text-tertiary font-mono uppercase">
						{group.label}
					</h2>
					<ul class="mt-3 space-y-1">
						{#each group.children as link (link.id)}
							{#if link.path}
								<li>
									<LocalizedLink
										href={link.path}
										class="text-small text-tertiary hover:text-strong inline-block py-1 transition-colors duration-150"
									>
										{link.label}
									</LocalizedLink>
								</li>
							{/if}
						{/each}
					</ul>
				</nav>
			{/each}
		</div>

		<div class="border-line-subtle mt-12 border-t pt-6">
			<p class="text-caption text-faint">{m.footer_copyright({ year })}</p>
		</div>
	</Container>
</footer>
