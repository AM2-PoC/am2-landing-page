import { test, expect, scrollThrough } from './support/test.ts';
import { LOCALES, PAGES, localize } from './support/content.ts';
import { DESKTOP_MIN_WIDTH, VIEWPORTS } from './support/env.ts';

type LayoutProblem = { kind: string; detail: string };

for (const viewport of VIEWPORTS) {
	test.describe(`layout on ${viewport.name}`, () => {
		test.use({
			viewport: { width: viewport.width, height: viewport.height },
			hasTouch: viewport.width < DESKTOP_MIN_WIDTH,
			isMobile: viewport.width < 768
		});

		for (const locale of LOCALES) {
			test(`all pages fit the screen (${locale})`, async ({ page }) => {
				test.slow(); // visits all pages
				const problems: string[] = [];

				for (const info of PAGES) {
					const url = localize(info.path, locale);
					await page.goto(url);
					await scrollThrough(page);

					const found: LayoutProblem[] = await page.evaluate(() => {
						const out: LayoutProblem[] = [];
						const width = document.documentElement.clientWidth;

						// 1. No sideways scrolling of the whole page
						if (document.documentElement.scrollWidth > width + 1) {
							out.push({
								kind: 'page scrolls sideways',
								detail: `${document.documentElement.scrollWidth}px`
							});
						}

						// 2. Nothing sticks out of the screen, except inside a clipping or scrolling
						//    container (sliders) and decoration hidden from assistive technology
						const clipped = (el: Element) => {
							for (let n = el.parentElement; n; n = n.parentElement) {
								const s = getComputedStyle(n);
								if (/(auto|scroll|hidden|clip)/.test(s.overflowX) || s.clipPath !== 'none')
									return true;
							}
							return false;
						};
						for (const el of document.querySelectorAll('header *, main *, footer *')) {
							const r = el.getBoundingClientRect();
							if (r.width === 0 || r.height === 0) continue;
							if (r.right <= width + 1 && r.left >= -1) continue;
							if (el.closest('[aria-hidden="true"]') || clipped(el)) continue;
							out.push({
								kind: 'sticks out of the screen',
								detail: `<${el.tagName.toLowerCase()} class="${String(el.getAttribute('class')).slice(0, 40)}"> ${Math.round(r.left)}…${Math.round(r.right)}`
							});
						}

						// 3. Buttons and links are big enough to tap (WCAG 2.5.8: 24 × 24 px; links
						//    inside a sentence are exempt)
						for (const el of document.querySelectorAll<HTMLElement>(
							'a[href], button, summary, input, select, textarea'
						)) {
							const r = el.getBoundingClientRect();
							const style = getComputedStyle(el);
							if (r.width === 0 || style.visibility === 'hidden') continue;
							if (el.closest('[inert], [aria-hidden="true"]') || el.classList.contains('sr-only'))
								continue;
							if (el.tagName === 'A' && style.display === 'inline') continue;
							if (r.width < 24 || r.height < 24) {
								out.push({
									kind: 'tap target smaller than 24 px',
									detail: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`
								});
							}
						}

						// 4. Text is not cut off inside its box
						for (const el of document.querySelectorAll<HTMLElement>(
							'main h1, main h2, main h3, main p, main a, main button'
						)) {
							// sr-only texts (e.g. "Slide 1 of 4" for screen readers) are clipped on purpose
							if (el.closest('[aria-hidden="true"], [inert], .sr-only')) continue;
							const style = getComputedStyle(el);
							if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
							if (el.scrollWidth > el.clientWidth + 1) {
								out.push({
									kind: 'text cut off',
									detail: (el.textContent ?? '').trim().slice(0, 40)
								});
							}
						}
						return out;
					});
					for (const problem of found) problems.push(`${url}: ${problem.kind} — ${problem.detail}`);

					// 5. The sticky header never covers the page title
					const h1 = await page.getByRole('heading', { level: 1 }).boundingBox();
					const header = await page.getByRole('banner').boundingBox();
					if (h1 && header && h1.y < header.y + header.height) {
						problems.push(`${url}: header covers the h1`);
					}
				}

				expect(problems).toEqual([]);
			});
		}

		test('the right navigation is shown for this width', async ({ page }) => {
			await page.goto('/');
			const desktopNav = page
				.getByRole('banner')
				.getByRole('navigation', { name: 'Main navigation' });
			const menuButton = page.getByRole('button', { name: 'Open menu' });
			if (viewport.width >= DESKTOP_MIN_WIDTH) {
				await expect(desktopNav).toBeVisible();
				await expect(menuButton).toBeHidden();
			} else {
				await expect(desktopNav).toBeHidden();
				await expect(menuButton).toBeVisible();
			}
			await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
			await expect(
				page.getByRole('banner').getByRole('link', { name: /Bahasa Indonesia/ })
			).toBeVisible();
		});
	});
}
