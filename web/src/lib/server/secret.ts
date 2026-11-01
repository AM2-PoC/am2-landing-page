const encoder = new TextEncoder();

/**
 * Compares a received secret with the expected one in constant time: both are hashed first
 * (same length), then every byte is compared, so the response time doesn't reveal how many
 * leading characters were right.
 */
export async function secretMatches(received: string | null, expected: string): Promise<boolean> {
	if (!received || !expected) return false;
	const [a, b] = await Promise.all([digest(received), digest(expected)]);
	let difference = 0;
	for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
	return difference === 0;
}

async function digest(value: string): Promise<Uint8Array> {
	return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}
