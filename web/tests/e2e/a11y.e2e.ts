import AxeBuilder from '@axe-core/playwright';
import { test, expect, scrollThrough, useTheme } from './support/test.ts';
import { LOCALES, PAGES, localize } from './support/content.ts';

// Automatic WCAG 2.2 AA checks (axe-core) on every page, in both languages and both themes,
// on a phone and on a laptop, plus checks axe can't do on its own.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// One test per page, language, theme and screen size, so a failure names the exact page
for (const viewport of [
	{ name: 'phone', width: 375, height: 812 },
	{ name: 'laptop', width: 1440, height: 900 }
]) {
	for (const theme of ['dark', 'light'] as const) {
		test.describe(`axe on a ${viewport.name}, ${theme} theme`, () => {
			test.use({ viewport: { width: viewport.width, height: viewport.height } });

			for (const locale of LOCALES) {
				for (const info of PAGES) {
					const url = localize(info.path, locale);
					test(`${url} has no WCAG violations`, async ({ page, baseURL }) => {
						await useTheme(page, theme, baseURL!);
						await page.goto(url);
						await scrollThrough(page);
						await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

						const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
						const violations = result.violations.map((v) => {
							const where = v.nodes
								.slice(0, 3)
								.map((n) => n.target.join(' '))
								.join(' | ');
							return `[${v.impact}] ${v.id} — ${v.help} (${where})`;
						});
						expect(violations).toEqual([]);
					});
				}
			}
		});
	}
}

test.describe('structure (checked by hand in the audit, kept as tests)', () => {
	for (const locale of LOCALES) {
		test(`landmarks, headings and names on every page (${locale})`, async ({ page }) => {
			test.slow(); // visits all pages
			await page.setViewportSize({ width: 1440, height: 900 });
			const problems: string[] = [];

			for (const info of PAGES) {
				const url = localize(info.path, locale);
				await page.goto(url);

				const found = await page.evaluate(() => {
					const out: string[] = [];
					const visible = (el: Element) => el.getClientRects().length > 0;

					const navNames = [...document.querySelectorAll('nav')]
						.filter(visible)
						.map(
							(nav) =>
								nav.getAttribute('aria-label') ??
								document.getElementById(nav.getAttribute('aria-labelledby') ?? '')?.textContent ??
								''
						);
					if (navNames.some((n) => !n.trim())) out.push('a <nav> without a name');
					// Headings start with the h1 and never skip a level
					const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(visible);
					if (headings[0]?.tagName !== 'H1') out.push(`first heading is ${headings[0]?.tagName}`);
					let previous = 0;
					for (const h of headings) {
						const level = Number(h.tagName[1]);
						if (level > previous + 1)
							out.push(`${h.tagName} after H${previous}: "${h.textContent?.trim().slice(0, 30)}"`);
						previous = level;
					}
					for (const section of document.querySelectorAll('section[aria-labelledby]')) {
						const id = section.getAttribute('aria-labelledby')!;
						if (!document.getElementById(id)?.textContent?.trim())
							out.push(`section label #${id} is empty`);
					}
					// Images always say whether they are decorative (alt="") or describe something
					for (const img of document.querySelectorAll('img:not([alt])'))
						out.push(`img without alt: ${img.getAttribute('src')?.slice(-30)}`);
					for (const el of document.querySelectorAll<HTMLElement>('a[href], button')) {
						if (!visible(el) || el.closest('[inert]')) continue;
						const name = (el.getAttribute('aria-label') ?? el.innerText ?? '').trim();
						if (!name) out.push(`unnamed ${el.tagName.toLowerCase()} ${el.outerHTML.slice(0, 60)}`);
					}
					return out;
				});
				for (const problem of found) problems.push(`${url}: ${problem}`);

				for (const role of ['banner', 'main', 'contentinfo'] as const) {
					const count = await page.getByRole(role).count();
					if (count !== 1) problems.push(`${url}: ${count} ${role} landmarks`);
				}
			}

			expect(problems).toEqual([]);
		});
	}
});

test.describe('motion', () => {
	test.use({ contextOptions: { reducedMotion: 'no-preference' } });

	for (const info of PAGES) {
		test(`${info.path}: with animations on, all content ends up visible after scrolling`, async ({
			page
		}) => {
			await page.setViewportSize({ width: 1440, height: 900 });
			await page.goto(info.path);
			await expect(page.locator('html')).toHaveAttribute('data-reveal-ready');
			await scrollThrough(page);
			await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
			await expect
				.poll(() => page.locator('[data-reveal-state="in"]').count(), { timeout: 5000 })
				.toBe(0);

			// Everything on screen width (sliders' other pages excluded) has been revealed
			const hidden = await page.evaluate(() =>
				[
					...document.querySelectorAll(
						':is([data-reveal], [data-reveal-group] > :not([data-reveal-group], [data-reveal-load])):not([data-reveal-state])'
					)
				]
					.filter((el) => {
						if (el.closest('[inert], [aria-hidden="true"]')) return false;
						const r = el.getBoundingClientRect();
						return r.width > 0 && r.right > 0 && r.left < document.documentElement.clientWidth;
					})
					.map((el) => `${el.tagName.toLowerCase()} ${(el.textContent ?? '').trim().slice(0, 30)}`)
			);
			expect(hidden).toEqual([]);
		});
	}

	test('with reduced motion nothing waits to be revealed', async ({ browser, baseURL }) => {
		const context = await browser.newContext({ reducedMotion: 'reduce', baseURL });
		const page = await context.newPage();
		await page.goto('/');
		const invisible = await page.evaluate(
			() =>
				[...document.querySelectorAll('main h1, main h2, main h3, main p, main img')].filter(
					(el) =>
						!el.closest('[inert], [aria-hidden="true"]') && getComputedStyle(el).opacity === '0'
				).length
		);
		expect(invisible).toBe(0);
		await context.close();
	});
});
