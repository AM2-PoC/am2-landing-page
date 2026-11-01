/**
 * Removes everything from an SVG file that the browser doesn't draw before it is inlined into
 * the page: the XML prolog, comments and <metadata> blocks (e.g. ~7 KB C2PA content
 * credentials per exported icon), plus namespace declarations nothing uses any more.
 * The drawing itself (paths, shapes, attributes) stays exactly the same.
 */
export function cleanSvg(svg: string): string {
	let out = svg
		.replace(/<\?xml[\s\S]*?\?>/g, '')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<metadata\b[\s\S]*?<\/metadata>/gi, '')
		.replace(/<metadata\b[^>]*\/>/gi, '');

	for (const [declaration, prefix] of out.matchAll(/\s+xmlns:([\w.-]+)="[^"]*"/g)) {
		const rest = out.replace(declaration, '');
		if (!new RegExp(`[<\\s]${prefix}:`).test(rest)) out = rest;
	}
	return out.trim();
}
