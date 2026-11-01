// Security regression tests. They only use harmless probes against the local test server and
// the mock CMS (no destructive payloads, no brute force, nothing outside this machine).

import { test, expect, scrollThrough } from './support/test.ts';
import { E2E_ENV, MOCK_DIRECTUS_URL } from './support/env.ts';

const EXPECTED_HEADERS = {
	'x-content-type-options': 'nosniff',
	'referrer-policy': 'strict-origin-when-cross-origin',
	'x-frame-options': 'DENY',
	'cross-origin-opener-policy': 'same-origin'
};

test.describe('HTTP security headers (audit M-3)', () => {
	for (const [what, path, status] of [
		['a page', '/', 200],
		['an Indonesian page', '/id/about-us', 200],
		['the 404 page', '/does-not-exist', 404],
		['the API', '/api/revalidate', 405]
	] as const) {
		test(`are sent with ${what}`, async ({ request }) => {
			const response = await request.get(path);
			expect(response.status()).toBe(status);
			const headers = response.headers();
			for (const [name, value] of Object.entries(EXPECTED_HEADERS)) {
				expect(headers[name], name).toBe(value);
			}
			expect(headers['permissions-policy']).toContain('camera=()');
		});
	}

	test('pages have a strict Content-Security-Policy that still allows the CMS images', async ({
		request
	}) => {
		const csp = (await request.get('/')).headers()['content-security-policy'] ?? '';
		const directives = Object.fromEntries(
			csp.split(';').map((d) => {
				const [name, ...values] = d.trim().split(/\s+/);
				return [name, values];
			})
		);
		expect(directives['default-src']).toEqual(["'self'"]);
		expect(directives['script-src']).toContain("'self'");
		expect(directives['script-src'].some((v: string) => v.startsWith("'nonce-"))).toBe(true);
		expect(directives['script-src']).not.toContain("'unsafe-inline'");
		expect(directives['script-src']).not.toContain("'unsafe-eval'");
		expect(directives['object-src']).toEqual(["'none'"]);
		expect(directives['frame-ancestors']).toEqual(["'none'"]);
		expect(directives['base-uri']).toEqual(["'self'"]);
		expect(directives['img-src']).toContain(MOCK_DIRECTUS_URL);
	});

	test('the nonce changes with every response', async ({ request }) => {
		const nonce = async () =>
			(await request.get('/')).headers()['content-security-policy']?.match(/'nonce-([^']+)'/)?.[1];
		expect(await nonce()).not.toBe(await nonce());
	});

	test('the policy blocks nothing the website needs (no violations, images load)', async ({
		page
	}) => {
		await page.addInitScript(() => {
			const store = window as unknown as { cspViolations: string[] };
			store.cspViolations = [];
			document.addEventListener('securitypolicyviolation', (event) =>
				store.cspViolations.push(`${event.violatedDirective} ${event.blockedURI}`)
			);
		});
		const failedImages: string[] = [];
		page.on('requestfailed', (r) => failedImages.push(`${r.url()} ${r.failure()?.errorText}`));
		page.on('response', (r) => {
			if (r.request().resourceType() === 'image' && r.status() !== 200) {
				failedImages.push(`${r.url()} ${r.status()}`);
			}
		});

		for (const path of [
			'/id/solutions/why-am2',
			'/features/am2-ptt-application',
			'/about-us',
			'/'
		]) {
			await page.goto(path);
			await scrollThrough(page);
			await page.waitForLoadState('networkidle');
			const violations = await page.evaluate(
				() => (window as unknown as { cspViolations: string[] }).cspViolations
			);
			expect(violations, path).toEqual([]);
		}
		expect(failedImages).toEqual([]);

		// Client-side navigation still works under the policy
		await page.getByRole('banner').getByRole('link', { name: 'AM² home' }).click();
		await page.getByRole('contentinfo').getByRole('link', { name: 'Why AM²' }).click();
		await expect(page).toHaveURL('/solutions/why-am2');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	});
});

test.describe('revalidation webhook', () => {
	test('only answers POST', async ({ request }) => {
		expect((await request.get('/api/revalidate')).status()).toBe(405);
	});

	test('rejects a missing or wrong secret without clearing anything', async ({ request }) => {
		const attempts: Record<string, string>[] = [
			{},
			{ 'x-revalidate-secret': 'wrong' },
			{ 'x-revalidate-secret': '' }
		];
		for (const headers of attempts) {
			const response = await request.post('/api/revalidate', { headers, data: {} });
			expect(response.status()).toBe(401);
			expect(await response.json()).toMatchObject({ message: 'Unauthorized' });
		}
		// A secret that only shares the beginning is wrong too (constant-time compare, audit L-1)
		const partial = await request.post('/api/revalidate', {
			headers: { 'x-revalidate-secret': E2E_ENV.REVALIDATE_SECRET.slice(0, -1) },
			data: {}
		});
		expect(partial.status()).toBe(401);
	});

	test('accepts the right secret', async ({ request }) => {
		const response = await request.post('/api/revalidate', {
			headers: { 'x-revalidate-secret': E2E_ENV.REVALIDATE_SECRET },
			data: {}
		});
		expect(response.status()).toBe(200);
		expect(await response.json()).toEqual({ ok: true });
	});

	test('form posts from another site are refused (CSRF)', async ({ request }) => {
		const response = await request.post('/api/revalidate', {
			headers: { origin: 'https://attacker.example', 'x-revalidate-secret': 'x' },
			form: { a: '1' }
		});
		expect(response.status()).toBe(403);
	});
});

test.describe('input from the address bar', () => {
	// Harmless markers only: the test checks that nothing is executed or rendered as HTML
	const marker = `xss${Date.now()}`;
	const payloads = [
		`"><script>window.${marker}=1</script>`,
		`'><img src=x onerror="window.${marker}=1">`,
		`javascript:window.${marker}=1`
	];

	for (const payload of payloads) {
		test(`a query string is never executed: ${payload.slice(0, 24)}…`, async ({ page }) => {
			await page.goto(`/about-us?ref=${encodeURIComponent(payload)}`);
			// The language switch keeps the query string: it must stay an escaped attribute value
			const href = await page
				.getByRole('banner')
				.getByRole('link', { name: /Switch to Bahasa Indonesia/ })
				.getAttribute('href');
			const target = new URL(href!, 'http://local.test');
			expect(target.pathname).toBe('/id/about-us');
			expect(target.searchParams.get('ref')).toBe(payload);
			expect(await page.evaluate((name) => name in window, marker)).toBe(false);
			expect(await page.locator(`script:has-text("${marker}")`).count()).toBe(0);
			expect(await page.locator('img[onerror]').count()).toBe(0);
		});
	}

	test('a payload in the path is answered with 404 and not reflected', async ({ request }) => {
		const response = await request.get(`/%3Cscript%3E${marker}%3C%2Fscript%3E`);
		expect(response.status()).toBe(404);
		expect(await response.text()).not.toContain(`<script>${marker}`);
	});

	// Absolute URLs on purpose: a relative "//host" would be resolved to that other host
	for (const path of [
		'//attacker.example',
		'/\\attacker.example',
		'/id//attacker.example',
		'/%2F%2Fattacker.example'
	]) {
		test(`${path} does not redirect to another site`, async ({ request, baseURL, pageErrors }) => {
			pageErrors.allow(/status of 404/);
			const response = await request.get(`${baseURL}${path}`, { maxRedirects: 0 });
			expect(new URL(response.url()).host).toBe(new URL(baseURL!).host);
			const location = response.headers()['location'];
			if (location) expect(new URL(location, baseURL).host).toBe(new URL(baseURL!).host);
			expect(response.status()).toBeLessThan(500);
		});
	}

	test('path traversal reaches no files', async ({ request }) => {
		for (const path of [
			'/..%2F..%2Fetc%2Fpasswd',
			'/%2e%2e/%2e%2e/etc/passwd',
			'/.env',
			'/package.json'
		]) {
			const response = await request.get(path);
			expect(response.status(), path).toBe(404);
			const body = await response.text();
			expect(body).not.toMatch(/root:|DIRECTUS_TOKEN|"devDependencies"/);
		}
	});
});

test.describe('no secrets or internals in what the browser receives', () => {
	test('HTML and JavaScript contain no server-side values', async ({
		page,
		request,
		pageErrors
	}) => {
		pageErrors.allow(/status of 404/);
		const secrets = [
			E2E_ENV.DIRECTUS_TOKEN,
			E2E_ENV.REVALIDATE_SECRET,
			'DIRECTUS_TOKEN',
			'REVALIDATE_SECRET'
		];
		const scripts = new Set<string>();
		page.on('response', (response) => {
			if (response.request().resourceType() === 'script') scripts.add(response.url());
		});
		for (const path of ['/', '/id/contact-sales', '/does-not-exist']) {
			const response = await request.get(path);
			const html = await response.text();
			for (const secret of secrets) expect(html, path).not.toContain(secret);
			await page.goto(path);
		}
		expect(scripts.size).toBeGreaterThan(0);
		for (const url of scripts) {
			const body = await (await request.get(url)).text();
			for (const secret of secrets) expect(body, url).not.toContain(secret);
			expect(body, url).not.toContain('sourceMappingURL');
		}
	});

	test('error pages show no stack traces or file paths', async ({ request }) => {
		const body = await (await request.get('/does-not-exist')).text();
		expect(body).not.toMatch(/at \S+ \(|node_modules|\/src\/|\\src\\|Error: /);
	});

	// Regression (audit M-8): inline icons used to carry ~7 KB of C2PA metadata each
	test('inline icons carry no metadata', async ({ request }) => {
		const html = await (await request.get('/')).text();
		expect(html).not.toContain('c2pa');
		expect(html).not.toContain('<metadata');
	});
});
