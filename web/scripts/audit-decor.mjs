import { chromium } from 'playwright';

const BASE = new URL(process.argv[2] ?? 'http://localhost:5173');
const WIDTHS = [320, 360, 390, 768, 1024, 1280, 1440, 1549, 1920, 2560];
const CLICK_WIDTHS = new Set([390, 768, 1280, 1920]);
const PAGES = [
	'/',
	'/solutions/why-am2',
	'/platforms/am2-ptt',
	'/platforms/am2-command-center',
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

function inspect(checkClicks) {
	const issues = [];
	const vw = document.documentElement.clientWidth;
	if (document.documentElement.scrollWidth > vw + 1) {
		issues.push(`page is ${document.documentElement.scrollWidth} px wide on a ${vw} px screen`);
	}

	for (const plain of document.querySelectorAll('body > header, body > footer')) {
		if (plain.matches('[data-decor]'))
			issues.push(`${plain.tagName.toLowerCase()}: should have no decor`);
	}

	for (const section of document.querySelectorAll('main > section')) {
		const name = section.getAttribute('aria-labelledby') ?? section.tagName.toLowerCase();
		if (!section.dataset.decor) {
			const hasPhoto = section.querySelector(':scope > img, :scope > picture');
			if (!hasPhoto) issues.push(`${name}: no decor`);
			continue;
		}
		const box = section.getBoundingClientRect();
		const style = getComputedStyle(section);
		if (style.position !== 'relative' || style.isolation !== 'isolate') {
			issues.push(`${name}: section must be position relative + isolation isolate`);
		}
		for (const part of ['::before', '::after']) {
			const ornament = getComputedStyle(section, part);
			if (ornament.content === 'none') {
				issues.push(`${name}${part}: missing`);
				continue;
			}
			if (ornament.pointerEvents !== 'none') issues.push(`${name}${part}: catches clicks`);
			if (ornament.zIndex !== '-1') issues.push(`${name}${part}: z-index ${ornament.zIndex}`);
			if (ornament.animationName !== 'none') issues.push(`${name}${part}: animated`);
			if (parseFloat(ornament.width) > box.width / 2 + 0.5) {
				issues.push(`${name}${part}: wider than half the section`);
			}
		}
	}

	if (checkClicks) {
		const header = document.querySelector('header');
		const targets = [
			...document.querySelectorAll('a[href], button:not(:disabled), summary')
		].filter((el) => {
			const rect = el.getBoundingClientRect();
			return (
				rect.width > 1 &&
				rect.height > 1 &&
				getComputedStyle(el).visibility !== 'hidden' &&
				!el.closest('[aria-hidden="true"], .sr-only, [data-dev-tool]')
			);
		});
		for (const el of targets) {
			el.scrollIntoView({ block: 'center', inline: 'nearest' });
			const rect = el.getBoundingClientRect();
			if (rect.right < 0 || rect.left > vw) continue; // carousel card outside the visible track
			const x = Math.min(Math.max(rect.left + rect.width / 2, 1), vw - 1);
			const hit = document.elementFromPoint(x, rect.top + rect.height / 2);
			const underHeader = header && !header.contains(el) && header.contains(hit);
			if (!underHeader && hit !== el && !el.contains(hit)) {
				const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
				issues.push(`"${text}" is covered by <${hit?.tagName.toLowerCase()}>`);
			}
		}
		window.scrollTo(0, 0);
	}
	return issues;
}

const browser = await chromium.launch(
	process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
let count = 0;

for (const width of WIDTHS) {
	const page = await browser.newPage({ viewport: { width, height: 900 } });
	for (const path of PAGES) {
		await page.goto(new URL(path, BASE).href, { waitUntil: 'networkidle' });
		const issues = await page.evaluate(inspect, CLICK_WIDTHS.has(width));
		count += issues.length;
		console.log(`${issues.length ? '✗' : '✓'} ${width}px ${path}`);
		for (const issue of issues) console.log(`    ${issue}`);
	}
	await page.close();
}

const modes = [
	['high contrast (forced-colors)', { forcedColors: 'active' }],
	['prefers-contrast: more', { contrast: 'more' }],
	['print', { media: 'print' }]
];
for (const [name, emulation] of modes) {
	const page = await browser.newPage({ viewport: { width: 1920, height: 900 } });
	await page.emulateMedia(emulation);
	await page.goto(BASE.href, { waitUntil: 'networkidle' });
	const visible = await page.evaluate(
		() =>
			[...document.querySelectorAll('[data-decor]')].filter(
				(el) =>
					getComputedStyle(el, '::before').content !== 'none' ||
					getComputedStyle(el, '::after').content !== 'none'
			).length
	);
	if (visible > 0) count++;
	console.log(`${visible ? '✗' : '✓'} ${name}: decor ${visible ? 'still visible' : 'hidden'}`);
	await page.close();
}

await browser.close();
console.log(`\n${count} issue(s)`);
process.exit(count > 0 ? 1 : 0);
