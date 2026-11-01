import { describe, expect, it } from 'vitest';
import {
	SECURITY_HEADERS,
	addCspSource,
	applySecurityHeaders,
	originOf
} from './security-headers.ts';

describe('addCspSource', () => {
	const policy = "default-src 'self'; img-src 'self' data:; script-src 'self' 'nonce-abc'";

	it('adds the source to the chosen directive only', () => {
		expect(addCspSource(policy, 'img-src', 'https://cms.example')).toBe(
			"default-src 'self'; img-src 'self' data: https://cms.example; script-src 'self' 'nonce-abc'"
		);
	});

	it('does not add the same source twice', () => {
		const once = addCspSource(policy, 'img-src', 'https://cms.example');
		expect(addCspSource(once, 'img-src', 'https://cms.example')).toBe(once);
	});

	it('creates the directive when it is missing', () => {
		expect(addCspSource("default-src 'self'", 'img-src', 'https://cms.example')).toBe(
			"default-src 'self'; img-src https://cms.example"
		);
	});
});

describe('originOf', () => {
	it('keeps scheme, host and port', () => {
		expect(originOf('http://localhost:8055/')).toBe('http://localhost:8055');
		expect(originOf('https://cms.example/assets')).toBe('https://cms.example');
	});

	it.each(['', 'not a url', 'javascript:alert(1)', 'data:image/png;base64,xx'])(
		'returns null for %j',
		(value) => expect(originOf(value)).toBeNull()
	);
});

describe('applySecurityHeaders', () => {
	it('sets the security headers and the image host in the CSP', () => {
		const headers = new Headers({ 'content-security-policy': "img-src 'self'" });
		applySecurityHeaders(headers, { assetsOrigin: 'https://cms.example', https: false });

		for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
			expect(headers.get(name)).toBe(value);
		}
		expect(headers.get('content-security-policy')).toBe("img-src 'self' https://cms.example");
		expect(headers.has('strict-transport-security')).toBe(false);
	});

	it('adds HSTS only over HTTPS', () => {
		const headers = new Headers();
		applySecurityHeaders(headers, { assetsOrigin: null, https: true });
		expect(headers.get('strict-transport-security')).toContain('max-age=');
	});

	it('keeps headers a route set itself', () => {
		const headers = new Headers({ 'x-frame-options': 'SAMEORIGIN' });
		applySecurityHeaders(headers, { assetsOrigin: null, https: false });
		expect(headers.get('x-frame-options')).toBe('SAMEORIGIN');
	});
});
