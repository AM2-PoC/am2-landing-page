/**
 * Shape of a page path in the database (pages.path, CHECK constraint pages_path_chk in
 * 01_schema.sql): "/" or lowercase words with hyphens separated by "/", no language prefix,
 * at most 255 characters. Any other URL can't be a page, so the website answers 404 right
 * away instead of asking Directus (and caching the empty answer) for every made-up URL.
 */
const PAGE_PATH = /^\/([a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*)?$/;
const MAX_LENGTH = 255;

export function isPagePath(path: string): boolean {
	return path.length <= MAX_LENGTH && PAGE_PATH.test(path);
}

/** URL path of the catch-all route → page path: "/" + rest, without trailing slashes */
export function toPagePath(rest: string | undefined): string {
	return `/${rest ?? ''}`.replace(/\/+$/, '') || '/';
}
