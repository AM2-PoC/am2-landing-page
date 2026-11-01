<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { getThemeState } from '#lib/theme/theme-state.svelte.ts';
	import { chip, chipInteractive } from '#lib/utils/nav-style.ts';

	const theme = getThemeState();

	// The icon shows the current mode (moon = dark, sun = light), as in the Figma navbar;
	// the label says what a click does.
	const label = $derived(theme.active === 'light' ? m.theme_to_dark() : m.theme_to_light());
</script>

<button
	type="button"
	class={[chip, chipInteractive]}
	aria-label={label}
	title={label}
	onclick={() => theme.toggle()}
>
	<Icon name={theme.active === 'light' ? 'sun' : 'moon'} class="size-3.5" />
</button>
