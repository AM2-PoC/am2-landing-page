import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = new URL(process.argv[2] ?? 'http://localhost:5173');
const OUT_DIR = process.env.AUDIT_OUT ?? 'layout-audit';
const WIDTHS = [360, 390, 768, 1024, 1280, 1549, 1920];
// Every page is checked in each language (EN without prefix, ID under /id); AUDIT_LOCALES=en limits it
const LOCALES = (process.env.AUDIT_LOCALES ?? 'en,id').split(',').map((l) => l.trim());
const MIN_GUTTER = 16;
const MIN_TARGET = 24;
const PAGES = [
	'/',
	'/solutions/why-am2',
	'/platforms/am2-ptt-command-center',
	'/products/am2-ptt',
	'/products/am2-command-center',
	'/services/saas',
	'/services/on-premise',
	'/features/am2-ptt-application',
	'/features/am2-ptt-webadmin',
	'/features/am2-command-center-application',
	'/features/am2-command-center-webadmin',
	'/contact-sales',
	'/about-us'
];

function inspect({ minGutter, minTarget }) {
	const vw = document.documentElement.clientWidth;
	const issues = [];
	const pageWidth = document.documentElement.scrollWidth;
	if (pageWidth > vw + 1) {
		issues.push({
			type: 'page-scroll',
			detail: `page is ${pageWidth} px wide on a ${vw} px screen`
		});
	}
	const label = (el) => {
		const id = el.id ? `#${el.id}` : '';
		const cls = [...el.classList].slice(0, 3).join('.');
		const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
		return `<${el.tagName.toLowerCase()}${id}${cls ? '.' + cls : ''}> "${text}"`;
	};
	const isVisible = (el) => {
		const style = getComputedStyle(el);
		if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0)
			return false;
		// Content of a closed <details> (e.g. FAQ answers) is not on screen until it is opened
		const details = el.closest('details');
		if (details && !details.open && !el.closest('summary')) return false;
		const rect = el.getBoundingClientRect();
		return rect.width > 1 && rect.height > 1;
	};
	const insideClipOrFixed = (el) => {
		for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
			const s = getComputedStyle(p);
			if (s.position === 'fixed' || s.overflowX !== 'visible') return true;
		}
		return false;
	};

	for (const el of document.body.querySelectorAll('*')) {
		if (!isVisible(el) || getComputedStyle(el).position === 'fixed' || insideClipOrFixed(el))
			continue;
		const rect = el.getBoundingClientRect();
		if (rect.right > vw + 1 || rect.left < -1) {
			issues.push({
				type: 'overflow',
				detail: `${label(el)} spans ${Math.round(rect.left)}…${Math.round(rect.right)} px (screen ${vw} px)`
			});
		}
	}

	for (const el of document.querySelectorAll('h1, h2, h3, h4, p, a, button, li, td, th, label')) {
		if (!isVisible(el) || insideClipOrFixed(el)) continue;
		if (
			getComputedStyle(el).overflowX === 'visible' &&
			el.scrollWidth > el.clientWidth + 1 &&
			el.clientWidth > 0
		) {
			issues.push({
				type: 'text-overflow',
				detail: `${label(el)} needs ${el.scrollWidth} px, has ${el.clientWidth} px`
			});
		}
	}

	const containers = [...document.querySelectorAll('main .container-site')].filter(isVisible);
	const edges = new Map();
	for (const c of containers) {
		const left = Math.round(
			c.getBoundingClientRect().left + parseFloat(getComputedStyle(c).paddingLeft)
		);
		edges.set(left, (edges.get(left) ?? 0) + 1);
		if (left < minGutter)
			issues.push({
				type: 'gutter',
				detail: `${label(c)} content starts ${left} px from the edge`
			});
	}
	if (edges.size > 1) {
		issues.push({
			type: 'alignment',
			detail: `content left edges differ: ${[...edges].map(([x, n]) => `${x}px ×${n}`).join(', ')}`
		});
	}

	for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary')) {
		if (!isVisible(el) || insideClipOrFixed(el)) continue;
		const r = el.getBoundingClientRect();
		const inline = getComputedStyle(el).display === 'inline' && el.closest('p, li');
		if (!inline && (r.width < minTarget || r.height < minTarget)) {
			issues.push({
				type: 'tap-target',
				detail: `${label(el)} is ${Math.round(r.width)}×${Math.round(r.height)} px`
			});
		}
	}

	// Section decoration (styles/decor.css): never in the footer, never over content
	const footer = document.querySelector('body > footer, footer');
	const footerRect = footer?.getBoundingClientRect();
	const intersect = (a, b) => ({
		left: Math.max(a.left, b.left),
		top: Math.max(a.top, b.top),
		right: Math.min(a.right, b.right),
		bottom: Math.min(a.bottom, b.bottom)
	});
	const area = (r) => Math.max(0, r.right - r.left) * Math.max(0, r.bottom - r.top);
	// Part of an element that is really on screen (inside every clipping ancestor)
	const visibleRect = (el) => {
		let r = el.getBoundingClientRect();
		for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
			if (getComputedStyle(p).overflowX !== 'visible') r = intersect(r, p.getBoundingClientRect());
		}
		return r;
	};
	if (footer?.querySelector('[data-decor]')) {
		issues.push({ type: 'decor-footer', detail: 'decoration rendered inside the footer' });
	}
	const contentSelector =
		'h1, h2, h3, h4, p, a, button, label, td, th, summary, img, table, article, input, select, textarea, .rounded-card';
	let shapes = 0;
	for (const layer of document.querySelectorAll('[data-decor]')) {
		const style = getComputedStyle(layer);
		if (layer.getAttribute('aria-hidden') !== 'true' || style.pointerEvents !== 'none') {
			issues.push({
				type: 'decor-a11y',
				detail: 'decoration layer must be aria-hidden and ignore clicks'
			});
		}
		const section = layer.closest('section') ?? layer.parentElement;
		const sectionRect = section.getBoundingClientRect();
		const content = [...section.querySelectorAll(contentSelector)]
			.filter((el) => !el.closest('[data-decor]') && isVisible(el))
			.map((el) => ({ el, r: visibleRect(el) }))
			// full-bleed hero photos are backgrounds, not content
			.filter(
				({ r }) =>
					area(r) > 0 &&
					!(r.right - r.left >= sectionRect.width - 1 && r.bottom - r.top >= sectionRect.height - 1)
			);
		for (const shape of layer.querySelectorAll('.decor-shape')) {
			const r = intersect(shape.getBoundingClientRect(), layer.getBoundingClientRect());
			if (area(r) < 1) continue;
			shapes++;
			if (footerRect && area(intersect(r, footerRect)) > 0) {
				issues.push({
					type: 'decor-footer',
					detail: `${shape.dataset.shape} reaches into the footer`
				});
			}
			for (const { el, r: c } of content) {
				const o = intersect(r, c);
				if (o.right - o.left > 2 && o.bottom - o.top > 2) {
					issues.push({
						type: 'decor-overlap',
						detail: `${shape.dataset.shape} (${shape.dataset.side}/${shape.dataset.anchor}) covers ${label(el)}`
					});
				}
			}
		}
	}
	issues.push({ type: 'info', detail: `${shapes} decoration shape(s) visible` });

	return issues;
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch(
	process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const totals = {};
let count = 0;

for (const width of WIDTHS) {
	const context = await browser.newContext({ viewport: { width, height: 900 } });
	const page = await context.newPage();
	const paths = LOCALES.flatMap((locale) =>
		PAGES.map((p) => (locale === 'en' ? p : `/${locale}${p === '/' ? '' : p}`))
	);
	for (const path of paths) {
		const response = await page.goto(new URL(path, BASE).href, { waitUntil: 'networkidle' });
		if (!response || response.status() !== 200) {
			console.log(`✗ ${width}px ${path}: HTTP ${response?.status() ?? 'no response'}`);
			continue;
		}

		await page.evaluate(() => document.fonts.ready);
		await page.evaluate(async () => {
			for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
				window.scrollTo(0, y);
				await new Promise((r) => setTimeout(r, 60));
			}
			window.scrollTo(0, 0);
		});
		await page.waitForLoadState('networkidle');
		// Scrolling started the reveal animations (styles/reveal.css): measure the final layout
		await page
			.waitForFunction(() => !document.querySelector('[data-reveal-state="in"]'), null, {
				timeout: 3000
			})
			.catch(() => {});
		const issues = await page.evaluate(inspect, { minGutter: MIN_GUTTER, minTarget: MIN_TARGET });
		const name = path === '/' ? 'home' : path.slice(1).replaceAll('/', '-');
		await page.screenshot({ path: `${OUT_DIR}/${name}@${width}.png`, fullPage: true });

		const info = issues.filter((i) => i.type === 'info').map((i) => i.detail);
		const unique = [
			...new Map(
				issues.filter((i) => i.type !== 'info').map((i) => [i.type + i.detail, i])
			).values()
		];
		console.log(
			`${unique.length ? '!' : '✓'} ${String(width).padStart(4)}px ${path}  (${info.join(', ')})`
		);
		for (const issue of unique.slice(0, 8))
			console.log(`      ${issue.type.padEnd(13)} ${issue.detail}`);
		if (unique.length > 8) console.log(`      … and ${unique.length - 8} more`);
		for (const issue of unique) totals[issue.type] = (totals[issue.type] ?? 0) + 1;
		count += unique.length;
	}
	await context.close();
}

await browser.close();
console.log(`\n${count} issue(s)`, totals, `\nScreenshots: ./${OUT_DIR}/`);
process.exit(count > 0 ? 1 : 0);
