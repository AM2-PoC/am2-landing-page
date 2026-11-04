// Mock Directus for the E2E tests: answers the REST reads the website makes
// (GET /items/:collection with fields / filter / sort / limit) from a fixed snapshot of the
// AM² content (tests/e2e/fixtures/content.json = 01_schema + 02_seed + 04–08 +
// 10_combined_platform_page, with fake images), and serves placeholder images at /assets/:id. No real Directus, database or
// production data is touched, so every run sees exactly the same content.
//
// Test controls (only on this mock, used by tests/e2e/cms-states.e2e.ts):
//   POST /__e2e/outage?on=1          every /items request answers 503 (CMS down), ?on=0 restores
//   POST /__e2e/delay?ms=12000       /items answers only after this delay (hanging CMS)
//   POST /__e2e/hide-locale?collection=page_translations&locale=id
//                                    rows of that collection in that language are left out
//                                    (missing translation)
//   POST /__e2e/reset                back to normal
//   GET  /__e2e/requests             the /items requests received so far (collection + filter)
//   GET  /__e2e/health               200 when the mock is ready (Playwright waits for it)
//
// Usage: node tests/e2e/mock-directus.mjs   (port: MOCK_DIRECTUS_PORT, default 8065;
// accepted token: MOCK_DIRECTUS_TOKEN)

import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const PORT = Number(process.env.MOCK_DIRECTUS_PORT ?? 8065);
const TOKEN = process.env.MOCK_DIRECTUS_TOKEN ?? 'e2e-directus-token-not-a-secret';
const data = JSON.parse(readFileSync(new URL('./fixtures/content.json', import.meta.url), 'utf8'));

/** Many-to-one relations: collection → field → related collection */
const RELATIONS = {
	page_translations: { page_id: 'pages' },
	navigation_items: { page_id: 'pages', parent_id: 'navigation_items' },
	navigation_item_translations: { navigation_item_id: 'navigation_items' },
	content_sections: { image_id: 'directus_files', cta_page_id: 'pages' },
	content_section_translations: { content_section_id: 'content_sections' },
	page_content_sections: { page_id: 'pages', content_section_id: 'content_sections' },
	section_items: {
		content_section_id: 'content_sections',
		image_id: 'directus_files',
		link_page_id: 'pages'
	},
	section_item_translations: { section_item_id: 'section_items' },
	products: { image_id: 'directus_files' },
	product_translations: { product_id: 'products' },
	responsibility_translations: { responsibility_id: 'responsibilities' },
	deployment_model_responsibilities: { responsibility_id: 'responsibilities' },
	file_translations: { directus_files_id: 'directus_files' }
};

/** Collections the website's read-only token may read (like the "Website Read" policy) */
const READABLE = new Set([...Object.keys(data)]);

let outage = false;
let delayMs = 0;
/** collection → locales whose rows are left out */
let hiddenLocales = new Map();
/** Last /items requests, newest last (bounded) */
const requestLog = [];

function related(collection, field, value) {
	const target = RELATIONS[collection]?.[field];
	if (!target || value === null || value === undefined) return null;
	return (data[target] ?? []).find((row) => row.id === value) ?? null;
}

function matches(collection, row, filter) {
	if (!filter) return true;
	return Object.entries(filter).every(([key, condition]) => {
		if (key === '_and') return condition.every((f) => matches(collection, row, f));
		if (key === '_or') return condition.some((f) => matches(collection, row, f));
		const value = row[key];
		const operators = Object.keys(condition);
		if (operators.every((op) => op.startsWith('_'))) {
			return operators.every((op) => {
				const expected = condition[op];
				switch (op) {
					case '_eq':
						return value === expected;
					case '_neq':
						return value !== expected;
					case '_in':
						return expected.includes(value);
					case '_nin':
						return !expected.includes(value);
					case '_null':
						return expected ? value === null : value !== null;
					case '_nnull':
						return expected ? value !== null : value === null;
					default:
						throw new Error(`unsupported filter operator ${op}`);
				}
			});
		}
		// Nested filter on a related row, e.g. { content_section_id: { section_key: { _eq } } }
		const target = RELATIONS[collection]?.[key];
		const relatedRow = related(collection, key, value);
		return target && relatedRow ? matches(target, relatedRow, condition) : false;
	});
}

function project(collection, row, fields) {
	if (fields.includes('*')) return { ...row };
	const out = {};
	const nested = new Map();
	for (const field of fields) {
		const [head, ...rest] = field.split('.');
		if (rest.length === 0) out[head] = row[head] ?? null;
		else nested.set(head, [...(nested.get(head) ?? []), rest.join('.')]);
	}
	for (const [head, subFields] of nested) {
		const target = RELATIONS[collection]?.[head];
		const relatedRow = related(collection, head, row[head]);
		out[head] = target && relatedRow ? project(target, relatedRow, subFields) : null;
	}
	return out;
}

function sortRows(rows, sort) {
	if (!sort) return rows;
	const keys = sort.split(',').filter(Boolean);
	return [...rows].sort((a, b) => {
		for (const key of keys) {
			const desc = key.startsWith('-');
			const field = desc ? key.slice(1) : key;
			const x = a[field];
			const y = b[field];
			if (x === y) continue;
			const order = x === null ? 1 : y === null ? -1 : x < y ? -1 : 1;
			return desc ? -order : order;
		}
		return 0;
	});
}

// 1 × 1 grey PNG: the website only needs a real image, the size comes from width/height
const PIXEL = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNoaGgAAAMEAYFL09IQAAAAAElFTkSuQmCC',
	'base64'
);

function send(res, status, body, headers = {}) {
	res.writeHead(status, { 'content-type': 'application/json', ...headers });
	res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const server = createServer((req, res) => {
	const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

	if (url.pathname === '/__e2e/health') return send(res, 200, { ok: true });
	if (url.pathname === '/__e2e/outage' && req.method === 'POST') {
		outage = url.searchParams.get('on') === '1';
		return send(res, 200, { outage });
	}
	if (url.pathname === '/__e2e/delay' && req.method === 'POST') {
		delayMs = Math.max(0, Number(url.searchParams.get('ms')) || 0);
		return send(res, 200, { delayMs });
	}
	if (url.pathname === '/__e2e/hide-locale' && req.method === 'POST') {
		const collection = url.searchParams.get('collection') ?? '';
		const locale = url.searchParams.get('locale') ?? '';
		hiddenLocales.set(collection, new Set([...(hiddenLocales.get(collection) ?? []), locale]));
		const hidden = Object.fromEntries([...hiddenLocales].map(([key, set]) => [key, [...set]]));
		return send(res, 200, { hidden });
	}
	if (url.pathname === '/__e2e/reset' && req.method === 'POST') {
		outage = false;
		delayMs = 0;
		hiddenLocales = new Map();
		return send(res, 200, { ok: true });
	}
	if (url.pathname === '/__e2e/requests' && req.method === 'GET') {
		return send(res, 200, { data: requestLog });
	}

	const asset = url.pathname.match(/^\/assets\/([0-9a-f-]{36})$/);
	if (asset && req.method === 'GET') {
		const file = data.directus_files.find((f) => f.id === asset[1]);
		if (!file) return send(res, 404, { errors: [{ message: 'Not found' }] });
		return send(res, 200, PIXEL, { 'content-type': 'image/png', 'cache-control': 'max-age=60' });
	}

	const items = url.pathname.match(/^\/items\/([a-z_]+)$/);
	if (items && req.method === 'GET') {
		if (req.headers.authorization !== `Bearer ${TOKEN}`) {
			return send(res, 401, { errors: [{ message: 'Invalid user credentials.' }] });
		}
		requestLog.push({ collection: items[1], filter: url.searchParams.get('filter') });
		if (requestLog.length > 2000) requestLog.shift();
		if (delayMs > 0) {
			const timer = setTimeout(() => answerItems(res, url, items[1]), delayMs);
			res.on('close', () => clearTimeout(timer));
			return;
		}
		return answerItems(res, url, items[1]);
	}

	send(res, 404, { errors: [{ message: 'Route not found' }] });
});

/** GET /items/:collection — rows of the snapshot matching filter / sort / limit / fields */
function answerItems(res, url, collection) {
	if (outage) return send(res, 503, { errors: [{ message: 'Service Unavailable' }] });
	if (!READABLE.has(collection)) {
		return send(res, 403, { errors: [{ message: "You don't have permission to access this." }] });
	}
	try {
		const filter = url.searchParams.get('filter');
		const fields = (url.searchParams.get('fields') ?? '*').split(',');
		const limit = Number(url.searchParams.get('limit') ?? 100);
		const hidden = hiddenLocales.get(collection);
		let rows = (data[collection] ?? []).filter(
			(row) =>
				!hidden?.has(row.locale_code) &&
				matches(collection, row, filter ? JSON.parse(filter) : null)
		);
		rows = sortRows(rows, url.searchParams.get('sort'));
		if (limit >= 0) rows = rows.slice(0, limit);
		return send(res, 200, { data: rows.map((row) => project(collection, row, fields)) });
	} catch (error) {
		return send(res, 400, { errors: [{ message: String(error) }] });
	}
}

server.listen(PORT, '127.0.0.1', () => {
	console.log(`mock Directus on http://127.0.0.1:${PORT}`);
});
