/**
 * The language the switcher button changes to: the next active language after the
 * current one (EN → ID → EN …). Returns null when there is nothing to switch to.
 */
export function nextLocale(active: readonly string[], current: string): string | null {
	const others = active.filter((code) => code !== current);
	if (others.length === 0) return null;
	const index = active.indexOf(current);
	if (index === -1) return others[0];
	return active[(index + 1) % active.length];
}
