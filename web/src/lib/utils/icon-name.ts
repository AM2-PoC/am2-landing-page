/**
 * Icon names used in the content (Directus icon_key) that differ from the file name in
 * src/lib/assets/icons. SvelteKit treats files named server.* as server-only, so that icon is
 * stored as server-rack.svg, while the seed data (02_seed.sql) and existing content say "server".
 */
export const ICON_ALIASES: Readonly<Record<string, string>> = {
	server: 'server-rack'
};

/** File name (without .svg) for an icon name from the content */
export function iconFileName(name: string): string {
	return ICON_ALIASES[name] ?? name;
}
