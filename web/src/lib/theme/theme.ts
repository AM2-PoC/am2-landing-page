export type Theme = 'dark' | 'light';

/** Cookie that remembers the visitor's choice, so the server renders the right theme (no flash) */
export const THEME_COOKIE = 'am2-theme';
export const DEFAULT_THEME: Theme = 'dark';

export function parseTheme(value: string | null | undefined): Theme {
	return value === 'light' ? 'light' : DEFAULT_THEME;
}

/** Set-Cookie value for document.cookie: one year, whole site */
export function themeCookie(theme: Theme): string {
	return `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
