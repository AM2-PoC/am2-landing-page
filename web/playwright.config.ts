import { defineConfig, devices } from '@playwright/test';
import {
	APP_PORT,
	APP_URL,
	E2E_ENV,
	MOCK_DIRECTUS_PORT,
	MOCK_DIRECTUS_URL
} from './tests/e2e/support/env.ts';

// End-to-end tests against the production build, with a mock Directus instead of the real CMS
// (tests/e2e/mock-directus.mjs answers from the fixed snapshot tests/e2e/fixtures/content.json).
// Every run therefore sees the same content, touches no real Directus/database and needs no
// .env: the test values (tests/e2e/support/env.ts) take precedence over web/.env.
//
//   npm run test:e2e                              all tests (builds the site first)
//   npx playwright test tests/e2e/a11y.e2e.ts     one file
//   npx playwright show-report                    open the HTML report of the last run

/** Tests that switch the mock CMS into another state (down, slow, missing translations) */
const CMS_STATES = '**/cms-states.e2e.ts';

export default defineConfig({
	testDir: '.',
	testMatch: '**/*.e2e.{ts,js}',
	testIgnore: '**/node_modules/**',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	timeout: 60_000,
	expect: { timeout: 10_000 },
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: APP_URL,
		trace: 'retain-on-failure',
		// Fixed animation state: reveal/intro animations are skipped, so screenshots, axe and
		// layout checks never measure a half-faded element (motion is tested on its own)
		contextOptions: { reducedMotion: 'reduce' },
		// Optional: a Chromium that is already installed (e.g. in CI images)
		launchOptions: process.env.CHROMIUM_PATH
			? { executablePath: process.env.CHROMIUM_PATH }
			: undefined
	},
	projects: [
		{
			name: 'chromium',
			testIgnore: ['**/node_modules/**', CMS_STATES],
			use: { ...devices['Desktop Chrome'] }
		},
		{
			// Runs after the other tests, one test at a time (see the file)
			name: 'cms-states',
			testMatch: CMS_STATES,
			dependencies: ['chromium'],
			fullyParallel: false,
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: [
		{
			command: 'node tests/e2e/mock-directus.mjs',
			url: `${MOCK_DIRECTUS_URL}/__e2e/health`,
			env: {
				MOCK_DIRECTUS_PORT: String(MOCK_DIRECTUS_PORT),
				MOCK_DIRECTUS_TOKEN: E2E_ENV.DIRECTUS_TOKEN
			},
			reuseExistingServer: false,
			timeout: 30_000
		},
		{
			command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${APP_PORT} --strictPort`,
			url: APP_URL,
			env: E2E_ENV,
			// Never reuse a server started by hand: it may be connected to the real Directus
			reuseExistingServer: false,
			timeout: 240_000
		}
	]
});
