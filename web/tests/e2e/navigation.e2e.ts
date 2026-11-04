import type { Page } from '@playwright/test';
import { test, expect, gotoReady } from './support/test.ts';
import { sectionHeading, sectionItemTitles } from './support/content.ts';

const desktop = { width: 1440, height: 900 };
const phone = { width: 375, height: 812 };

/** The <section> that contains the card/heading with this text */
const sectionWith = (page: Page, heading: string) =>
	page.locator('section', { has: page.getByRole('heading', { name: heading, exact: true }) });

test.describe('keyboard basics', () => {
	test.use({ viewport: desktop });

	test('the first Tab shows the skip link, which moves focus to the main content', async ({
		page
	}) => {
		await gotoReady(page, '/about-us');
		await page.keyboard.press('Tab');
		const skip = page.getByRole('link', { name: 'Skip to main content' });
		await expect(skip).toBeFocused();
		await expect(skip).toBeInViewport();

		await page.keyboard.press('Enter');
		await expect(page.getByRole('main')).toBeFocused();
	});

	test('keyboard focus is always visible', async ({ page }) => {
		await gotoReady(page, '/');
		for (let i = 0; i < 12; i++) {
			await page.keyboard.press('Tab');
			const outline = await page.evaluate(() => {
				const el = document.activeElement as HTMLElement | null;
				if (!el || el === document.body) return 'body';
				const style = getComputedStyle(el);
				return `${style.outlineStyle} ${style.outlineWidth}`;
			});
			expect(outline).not.toMatch(/^none|0px$/);
		}
	});
});

test.describe('desktop menu', () => {
	test.use({ viewport: desktop });

	test('a dropdown opens with the keyboard, closes with Escape and gives focus back', async ({
		page
	}) => {
		await gotoReady(page, '/');
		const menu = page.getByRole('navigation', { name: 'Main navigation' });
		const solutions = menu.getByRole('button', { name: 'Solutions' });

		await solutions.focus();
		await page.keyboard.press('Enter');
		await expect(solutions).toHaveAttribute('aria-expanded', 'true');
		const link = menu.getByRole('link', { name: 'Why AM²' });
		await expect(link).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(solutions).toHaveAttribute('aria-expanded', 'false');
		await expect(link).toBeHidden();
		await expect(solutions).toBeFocused();
	});

	test('nested groups open and lead to their page', async ({ page }) => {
		await gotoReady(page, '/');
		const menu = page.getByRole('navigation', { name: 'Main navigation' });
		await menu.getByRole('button', { name: 'Ecosystems' }).click();
		await menu.getByRole('button', { name: 'Platforms' }).click();
		await menu.getByRole('link', { name: 'AM² PTT & Command Center', exact: true }).click();

		await expect(page).toHaveURL('/platforms/am2-ptt-command-center');
		await expect(menu.getByRole('button', { name: 'Ecosystems' })).toHaveAttribute(
			'aria-expanded',
			'false'
		);
	});

	// Regression (audit M-6): after choosing a page with the keyboard (or by touch on a
	// tablet) the dropdown used to stay open on top of the new page
	test('a page chosen with the keyboard closes the dropdown', async ({ page }) => {
		await gotoReady(page, '/');
		const menu = page.getByRole('navigation', { name: 'Main navigation' });
		const solutions = menu.getByRole('button', { name: 'Solutions' });
		await solutions.focus();
		await page.keyboard.press('Enter');
		await page.keyboard.press('Tab');
		await expect(menu.getByRole('link', { name: 'Why AM²' })).toBeFocused();
		await page.keyboard.press('Enter');

		await expect(page).toHaveURL('/solutions/why-am2');
		await expect(solutions).toHaveAttribute('aria-expanded', 'false');
		await expect(menu.getByRole('link', { name: 'Why AM²' })).toBeHidden();
	});

	test('a click outside closes the open dropdown', async ({ page }) => {
		await gotoReady(page, '/');
		const solutions = page
			.getByRole('navigation', { name: 'Main navigation' })
			.getByRole('button', { name: 'Solutions' });
		await solutions.click();
		await expect(solutions).toHaveAttribute('aria-expanded', 'true');
		await page.getByRole('heading', { level: 1 }).click();
		await expect(solutions).toHaveAttribute('aria-expanded', 'false');
	});

	test('the current page is marked in the menu', async ({ page }) => {
		await gotoReady(page, '/about-us');
		await expect(
			page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', {
				name: 'About Us'
			})
		).toHaveAttribute('aria-current', 'page');
	});
});

test.describe('mobile menu', () => {
	test.use({ viewport: phone, hasTouch: true, isMobile: true });

	test('opens as a dialog, keeps focus inside and closes with Escape', async ({ page }) => {
		await gotoReady(page, '/');
		const button = page.getByRole('button', { name: 'Open menu' });
		await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden();

		await button.click();
		const dialog = page.getByRole('dialog', { name: 'Main navigation' });
		await expect(dialog).toBeVisible();
		await expect(dialog).toHaveAttribute('aria-modal', 'true');
		await expect(button).toHaveAttribute('aria-expanded', 'true');
		expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

		// Tab and Shift+Tab never leave the dialog
		for (let i = 0; i < 25; i++) {
			await page.keyboard.press(i % 3 === 2 ? 'Shift+Tab' : 'Tab');
			expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
		}

		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
		await expect(button).toBeFocused();
		expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
	});

	test('a link in the menu navigates and closes the menu', async ({ page }) => {
		await gotoReady(page, '/');
		await page.getByRole('button', { name: 'Open menu' }).click();
		const dialog = page.getByRole('dialog', { name: 'Main navigation' });
		await dialog.getByRole('button', { name: 'Features' }).click();
		await dialog.getByRole('link', { name: 'AM² PTT App' }).click();

		await expect(page).toHaveURL('/features/am2-ptt-application');
		await expect(dialog).toBeHidden();
		expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
	});

	// Regression (audit M-4): the open menu used to stay "open" (invisible, page locked)
	// when the window grew to desktop width
	test('growing the window to desktop width closes the menu and unlocks scrolling', async ({
		page
	}) => {
		await gotoReady(page, '/');
		await page.getByRole('button', { name: 'Open menu' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();

		await page.setViewportSize(desktop);
		await expect(page.getByRole('dialog')).toHaveCount(0);
		expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
		await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
	});
});

test.describe('theme', () => {
	test.use({ viewport: desktop });

	test('the theme button switches light/dark and the choice survives a reload', async ({
		page
	}) => {
		await gotoReady(page, '/');
		const html = page.locator('html');
		await expect(html).toHaveAttribute('data-theme', 'dark');

		await page.getByRole('button', { name: 'Switch to light mode' }).click();
		await expect(html).toHaveAttribute('data-theme', 'light');

		await page.reload();
		await expect(html).toHaveAttribute('data-theme', 'light');
		await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
	});
});

test.describe('sliders and disclosures', () => {
	test('Home hero pills switch between the two dashboards', async ({ page }) => {
		await page.setViewportSize(desktop);
		await gotoReady(page, '/');
		const pills = page.getByRole('button', { name: /^Show the .+ dashboard$/ });
		await expect(pills).toHaveCount(2);
		await expect(pills.nth(0)).toHaveAttribute('aria-pressed', 'true');

		await pills.nth(1).click();
		await expect(pills.nth(1)).toHaveAttribute('aria-pressed', 'true');
		await expect(pills.nth(0)).toHaveAttribute('aria-pressed', 'false');
		// Only the chosen dashboard is exposed to assistive technology
		const hero = page.locator('section', { has: page.getByRole('heading', { level: 1 }) });
		await expect(hero.locator('[inert]', { has: page.locator('img') })).toHaveCount(1);

		await pills.nth(0).click();
		await expect(pills.nth(0)).toHaveAttribute('aria-pressed', 'true');
	});

	test('Security carousel pages through its cards with the arrows (desktop)', async ({ page }) => {
		await page.setViewportSize(desktop);
		await gotoReady(page, '/');
		const titles = sectionItemTitles('home_security_controls', 'en');
		expect(titles).toHaveLength(6);
		const section = page.getByRole('region', {
			name: sectionHeading('home_security_controls', 'en')
		});
		const card = (title: string) => section.getByRole('heading', { name: title, exact: true });

		await section.scrollIntoViewIfNeeded();
		await expect(card(titles[0])).toBeVisible();
		await expect(card(titles[3])).toBeHidden(); // inert + aria-hidden on the other page

		// On the first/last page the arrow that can't move is disabled and invisible
		const next = section.getByRole('button', { name: 'Next slide', includeHidden: true });
		const prev = section.getByRole('button', { name: 'Previous slide', includeHidden: true });
		await expect(prev).toBeDisabled();
		await expect(prev).toBeHidden();
		await next.click();

		await expect(card(titles[3])).toBeVisible();
		await expect(card(titles[0])).toBeHidden();
		await expect(section.getByText('Slide 2 of 2')).toBeAttached();
		await expect(next).toBeDisabled();
		await expect(prev).toBeFocused(); // the pressed arrow disappeared: focus moved over

		await prev.click();
		await expect(card(titles[0])).toBeVisible();
		await expect(next).toBeFocused();
	});

	test('Why AM² slideshow moves with the buttons (phone)', async ({ page }) => {
		await page.setViewportSize(phone);
		await gotoReady(page, '/solutions/why-am2');
		const titles = sectionItemTitles('solutions_capabilities', 'en');
		const section = sectionWith(page, titles[0]);
		await section.scrollIntoViewIfNeeded();

		await section.getByRole('button', { name: 'Next slide' }).click();
		await expect(section.getByText(`Slide 2 of ${titles.length}`)).toBeAttached();
		await expect(section.getByRole('heading', { name: titles[1], exact: true })).toBeInViewport();
	});

	// Regression (audit M-5): swipe tracks without links must be reachable with the keyboard
	// (WCAG 2.1.1, axe scrollable-region-focusable)
	for (const { path, key } of [
		{ path: '/', key: 'home_security_controls' },
		{ path: '/solutions/why-am2', key: 'solutions_capabilities' },
		{ path: '/features/am2-ptt-application', key: 'feature_ptt_app_list' }
	]) {
		test(`the swipe track on ${path} can be focused and scrolled with the arrow keys`, async ({
			page
		}) => {
			await page.setViewportSize(phone);
			await gotoReady(page, path);
			const title = sectionItemTitles(key, 'en')[0];
			const track = sectionWith(page, title).locator('[tabindex="0"]');
			await expect(track).toHaveCount(1);
			await expect(track).toHaveAccessibleName(/.+/);

			await track.focus();
			await expect(track).toBeFocused();
			const before = await track.evaluate((el) => el.scrollLeft);
			await page.keyboard.press('ArrowRight');
			await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
		});
	}

	test('FAQ answers open and close with the keyboard', async ({ page }) => {
		await page.setViewportSize(desktop);
		await gotoReady(page, '/');
		const questions = sectionItemTitles('home_faq', 'en');
		const summary = page.locator('summary', { hasText: questions[0] });
		const details = page.locator('details', { has: summary });

		await summary.focus();
		await expect(details).not.toHaveAttribute('open');
		await page.keyboard.press('Enter');
		await expect(details).toHaveAttribute('open');
		await page.keyboard.press('Space');
		await expect(details).not.toHaveAttribute('open');
	});
});
