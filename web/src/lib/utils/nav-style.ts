export function navPillClass(active: boolean): string {
	return [
		'inline-flex h-9 items-center gap-1.5 rounded-full text-nav transition-colors duration-150',
		active
			? 'bg-accent px-4.5 font-semibold text-on-accent hover:bg-accent-hover'
			: 'text-muted hover:text-strong'
	].join(' ');
}

export function navItemClass(active: boolean): string {
	return [
		'flex w-full items-center justify-between gap-4 rounded-field px-3 py-2 text-left text-nav transition-colors duration-150',
		active ? 'bg-accent-soft text-strong' : 'text-muted hover:bg-accent-soft hover:text-strong'
	].join(' ');
}

export function mobileNavItemClass(active: boolean): string {
	return [
		'flex w-full items-center justify-between gap-4 rounded-field px-3 py-3 text-left text-base transition-colors duration-150',
		active ? 'bg-accent-soft text-strong' : 'text-secondary hover:bg-accent-soft hover:text-strong'
	].join(' ');
}

/** Small round button in the header (language, theme). Light theme: orange, as in the Figma mockup */
export const chip =
	'inline-flex h-9 min-w-11 items-center justify-center rounded-full border border-line-subtle bg-control px-3 font-mono text-chip uppercase text-secondary transition-colors duration-150 light:border-transparent light:bg-accent light:text-on-accent';

/** Hover state of a chip that is a link or a button */
export const chipInteractive =
	'hover:bg-control-hover hover:text-strong hover:border-line light:hover:border-transparent light:hover:bg-accent-hover light:hover:text-on-accent';
