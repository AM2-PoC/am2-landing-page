/**
 * SvelteKit serves pages without a trailing slash, but localizeHref('/', { locale: 'id' })
 * returns '/id/', which costs a 308 redirect. '/id/' → '/id', '/id/?a=1' → '/id?a=1', '/' stays.
 */
export function withoutTrailingSlash(href: string): string {
	return href.replace(/^([^?#]+?)\/+(?=$|[?#])/, '$1');
}
