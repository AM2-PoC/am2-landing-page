import { parse } from 'node-html-parser';

const BASE = new URL(process.argv[2] ?? 'http://localhost:5173');
const START_PATHS = ['/', '/id'];
const SKIP_PATHS = [/^\/styleguide/, /^\/api\//];

/** @type {{ path: string; status: number; errors: string[]; warnings: string[] }[]} */
const pages = [];
const linkedFrom = new Map();
const queue = [...START_PATHS];
const seen = new Set(queue);

function normalizePath(href, currentPath) {
	if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) return null;
	const url = new URL(href, new URL(currentPath, BASE));
	if (url.origin !== BASE.origin) return null;
	const path = url.pathname.replace(/\/+$/, '') || '/';
	if (/\.[a-z0-9]{2,5}$/i.test(path)) return null; // files: images, fonts, pdf
	if (SKIP_PATHS.some((re) => re.test(path))) return null;
	return path;
}

function checkPage(path, html) {
	const errors = [];
	const warnings = [];
	const root = parse(html);

	const title = root.querySelector('title')?.text.trim();
	if (!title) errors.push('missing <title>');
	if (!root.querySelector('meta[name="description"]')?.getAttribute('content')) {
		warnings.push('missing meta description');
	}
	if (!root.querySelector('link[rel="canonical"]')) errors.push('missing canonical link');

	const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
	const h1Count = headings.filter((h) => h.tagName === 'H1').length;
	if (h1Count !== 1) errors.push(`expected 1 <h1>, found ${h1Count}`);
	let previous = 0;
	for (const h of headings) {
		const level = Number(h.tagName[1]);
		if (previous && level > previous + 1) {
			warnings.push(
				`heading skips a level: <h${previous}> → <h${level}> "${h.text.trim().slice(0, 40)}"`
			);
		}
		previous = level;
	}

	// Images must have an alt attribute ("" is fine for decorative images)
	for (const img of root.querySelectorAll('img')) {
		if (img.getAttribute('alt') === undefined) {
			errors.push(`<img> without alt: ${img.getAttribute('src')?.slice(0, 60)}`);
		}
	}

	const ids = root.querySelectorAll('[id]').map((el) => el.id);
	const idSet = new Set(ids);
	for (const id of idSet) {
		if (ids.indexOf(id) !== ids.lastIndexOf(id)) errors.push(`duplicate id="${id}"`);
	}
	for (const el of root.querySelectorAll('[aria-labelledby]')) {
		for (const ref of el.getAttribute('aria-labelledby').split(/\s+/)) {
			if (!idSet.has(ref)) errors.push(`aria-labelledby="${ref}" points to a missing id`);
		}
	}

	for (const a of root.querySelectorAll('a[href]')) {
		const target = normalizePath(a.getAttribute('href'), path);
		if (!target) continue;
		if (!linkedFrom.has(target)) linkedFrom.set(target, new Set());
		linkedFrom.get(target).add(path);
		if (!seen.has(target)) {
			seen.add(target);
			queue.push(target);
		}
	}

	return { errors, warnings };
}

while (queue.length > 0) {
	const path = queue.shift();
	let status = 0;
	let result = { errors: [], warnings: [] };
	try {
		const res = await fetch(new URL(path, BASE), { redirect: 'manual' });
		status = res.status;
		if (status === 200) result = checkPage(path, await res.text());
		else result.errors.push(`HTTP ${status}`);
	} catch (err) {
		result.errors.push(`request failed: ${err.cause?.code ?? err.message}`);
	}
	pages.push({ path, status, ...result });
}

pages.sort((a, b) => a.path.localeCompare(b.path));
let errorCount = 0;
let warningCount = 0;
console.log(`\nAudited ${pages.length} pages on ${BASE.origin}\n`);
for (const page of pages) {
	errorCount += page.errors.length;
	warningCount += page.warnings.length;
	const mark = page.errors.length ? '✗' : page.warnings.length ? '!' : '✓';
	console.log(`${mark} ${String(page.status).padEnd(4)} ${page.path}`);
	for (const e of page.errors) console.log(`      error:   ${e}`);
	for (const w of page.warnings) console.log(`      warning: ${w}`);
	if (page.status !== 200 && linkedFrom.has(page.path)) {
		console.log(`      linked from: ${[...linkedFrom.get(page.path)].join(', ')}`);
	}
}
console.log(`\n${errorCount} error(s), ${warningCount} warning(s)\n`);
process.exit(errorCount > 0 ? 1 : 0);
