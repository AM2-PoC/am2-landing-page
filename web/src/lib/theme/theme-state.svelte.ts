import { getContext, setContext } from 'svelte';
import { themeCookie, type Theme } from './theme.ts';

/**
 * The visitor's theme. Created once in the root layout (from the cookie the server read)
 * and shared through context, so the header button and the layout use the same state.
 */
export class ThemeState {
	active = $state<Theme>('dark');

	constructor(initial: Theme) {
		this.active = initial;
	}

	toggle() {
		this.active = this.active === 'light' ? 'dark' : 'light';
		document.cookie = themeCookie(this.active);
	}
}

const KEY = Symbol('theme');

export function setThemeState(state: ThemeState): ThemeState {
	return setContext(KEY, state);
}

export function getThemeState(): ThemeState {
	return getContext<ThemeState>(KEY);
}
