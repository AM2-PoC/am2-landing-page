import type { Attachment } from 'svelte/attachments';

/** Same condition as the intro rules in styles/hero-intro.css: otherwise there is no intro */
export const INTRO_MEDIA =
	'screen and (scripting: enabled) and (prefers-reduced-motion: no-preference) and (forced-colors: none)';

/**
 * How long the page stays in place after the first scroll gesture: at least until the
 * reveal animation has played (0.8 s + 0.15 s delay), and until the gesture itself has
 * stopped (trackpads and phones keep sending scroll input for a moment), never longer than 3 s.
 */
export const HOLD = { minMs: 950, quietMs: 200, maxMs: 3000 } as const;

export function holdIsOver(sinceReveal: number, sinceLastInput: number, hold = HOLD): boolean {
	return sinceReveal >= hold.maxMs || (sinceReveal >= hold.minMs && sinceLastInput >= hold.quietMs);
}

const SCROLL_DOWN_KEYS = new Set(['ArrowDown', 'PageDown', 'End', ' ']);

/** Keys that scroll the page down, unless typed into a field or pressed on a control */
export function isScrollDownKey(
	key: string,
	target: { tagName?: string; isContentEditable?: boolean } | null
): boolean {
	if (!SCROLL_DOWN_KEYS.has(key)) return false;
	const tag = target?.tagName ?? '';
	if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return false;
	return !(key === ' ' && ['BUTTON', 'SUMMARY', 'A'].includes(tag));
}

/**
 * Attachment for the Home hero intro. The visitor's first scroll down (mouse wheel,
 * trackpad, swipe, arrow / Page Down / Space key) does not move the page: it calls
 * `onReveal`, and the page stays on the hero while the animation plays ("scrolling in
 * place"). The next scroll moves the page as usual.
 *
 * The intro is skipped (`onReveal` right away, no hold) when the page opens already
 * scrolled (reload, back button, #anchor link) or when there is no intro (reduced motion,
 * high contrast). A scroll that cannot be held back, such as dragging the scrollbar,
 * reveals at once.
 *
 * `isRevealed` tells it when the intro was ended another way (e.g. keyboard focus on the
 * hero's buttons): then scrolling is no longer held.
 *
 * Usage: <section {@attach revealOnScroll(() => (revealed = true), () => revealed)}>
 */
export function revealOnScroll(onReveal: () => void, isRevealed?: () => boolean): Attachment {
	return () => {
		if (window.scrollY > 0 || !window.matchMedia(INTRO_MEDIA).matches) {
			onReveal();
			return;
		}

		const listeners = new AbortController();
		const options = { passive: false, signal: listeners.signal };
		let revealedAt = 0;
		let lastInput = 0;
		let touchY: number | null = null;
		let timer: ReturnType<typeof setTimeout> | undefined;

		const stop = () => {
			clearTimeout(timer);
			listeners.abort();
		};
		const releaseWhenDone = () => {
			const now = performance.now();
			if (holdIsOver(now - revealedAt, now - lastInput)) stop();
			else timer = setTimeout(releaseWhenDone, 50);
		};
		/** First gesture: play the reveal instead of scrolling; later ones are held back */
		const handle = (event: Event) => {
			if (!revealedAt && isRevealed?.()) {
				stop();
				return;
			}
			event.preventDefault();
			lastInput = performance.now();
			if (revealedAt) return;
			revealedAt = lastInput;
			onReveal();
			releaseWhenDone();
		};

		window.addEventListener(
			'wheel',
			(event) => {
				// Pinch zoom and sideways scrolling are left alone
				if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
				if (revealedAt || event.deltaY > 0) handle(event);
			},
			options
		);
		window.addEventListener(
			'touchstart',
			(event) => (touchY = event.touches[0]?.clientY ?? null),
			options
		);
		window.addEventListener(
			'touchmove',
			(event) => {
				if (touchY === null || event.touches.length > 1) return;
				const movedUp = touchY - (event.touches[0]?.clientY ?? touchY);
				if (revealedAt || movedUp > 8) handle(event);
			},
			options
		);
		window.addEventListener('touchend', () => (touchY = null), options);
		window.addEventListener(
			'keydown',
			(event) => {
				if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
				if (event.key === ' ' && event.shiftKey) return;
				if (isScrollDownKey(event.key, event.target as HTMLElement | null)) handle(event);
			},
			options
		);
		// Scrollbar drag, focus moving further down, find in page: reveal and let it scroll
		window.addEventListener(
			'scroll',
			() => {
				if (revealedAt || window.scrollY <= 0) return;
				onReveal();
				stop();
			},
			{ passive: true, signal: listeners.signal }
		);

		return stop;
	};
}
