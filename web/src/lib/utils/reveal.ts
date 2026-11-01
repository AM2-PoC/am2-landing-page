/**
 * Reveal animation controller (styles/reveal.css explains the markup).
 * One IntersectionObserver for the whole site, started once in the root layout. Elements
 * that come into view together are revealed in order of importance (text, then media,
 * then decoration) and in page order, each a little after the previous one.
 */

export type RevealRole = 'text' | 'media' | 'decor';

/** Must match styles/reveal.css */
export const REVEAL_MEDIA =
	'screen and (scripting: enabled) and (prefers-reduced-motion: no-preference)';
export const REVEAL_TARGETS =
	'[data-reveal], [data-reveal-group] > :not([data-reveal-group], [data-reveal-load])';
export const REVEAL_TIMING = {
	staggerMs: 70,
	/** Never more than 5 steps of delay, so a large batch does not keep anyone waiting */
	maxSteps: 5,
	durationMs: { text: 600, media: 700, decor: 900 } satisfies Record<RevealRole, number>,
	/** After this the CSS failsafe has shown everything already */
	failsafeMs: 3000,
	/**
	 * How far into the screen an element has to come before it starts: text and decoration
	 * just before the bottom edge, media a little later, so in a text + image row the text
	 * leads even though the image's top edge reaches the screen first
	 */
	rootMargin: { text: '0px 0px -6% 0px', media: '0px 0px -15% 0px' }
} as const;

const ROLE_ORDER: Record<RevealRole, number> = { text: 0, media: 1, decor: 2 };

/** Role of an element from its markup: explicit data-reveal-role, decoration, or media */
export function revealRole(element: {
	dataset: DOMStringMap;
	hasAttribute(name: string): boolean;
	matches(selector: string): boolean;
}): RevealRole {
	const explicit = element.dataset.revealRole;
	if (explicit === 'text' || explicit === 'media' || explicit === 'decor') return explicit;
	if (element.hasAttribute('data-decor')) return 'decor';
	if (element.matches('img, picture, video, figure')) return 'media';
	return 'text';
}

/**
 * Order and delays for elements that come into view at the same moment (given in page
 * order): text first, then media, then decoration; each one stagger step later.
 */
export function planReveal<T>(
	items: readonly { item: T; role: RevealRole }[],
	{ staggerMs, maxSteps } = REVEAL_TIMING
): { item: T; role: RevealRole; delayMs: number }[] {
	return items
		.map((entry, index) => ({ ...entry, index }))
		.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.index - b.index)
		.map(({ item, role }, step) => ({ item, role, delayMs: Math.min(step, maxSteps) * staggerMs }));
}

/**
 * Starts revealing on the current page and on every page the visitor opens later
 * (new elements are picked up as they are added). Returns a stop function.
 */
export function startReveal(root: HTMLElement = document.body): () => void {
	const html = document.documentElement;
	if (!window.matchMedia(REVEAL_MEDIA).matches) return () => {};

	const timers = new Set<ReturnType<typeof setTimeout>>();
	const pending = new Set<HTMLElement>();

	const finish = (element: HTMLElement) => {
		element.dataset.revealState = 'done';
		element.style.removeProperty('--reveal-delay');
	};

	/**
	 * Shows an element at once: also ends a reveal that is still waiting or running, and the
	 * element's own opacity transition (e.g. a button's), which the state change would start
	 */
	const finishNow = (element: HTMLElement) => {
		finish(element);
		void getComputedStyle(element).opacity; // apply the new state, so its transitions exist
		for (const animation of element.getAnimations()) {
			if (
				animation instanceof CSSTransition &&
				(animation.transitionProperty === 'opacity' || animation.transitionProperty === 'translate')
			) {
				animation.cancel();
			}
		}
	};

	const show = (element: HTMLElement, role: RevealRole, delayMs: number) => {
		pending.delete(element);
		unwatch(element);
		if (delayMs > 0) element.style.setProperty('--reveal-delay', `${delayMs}ms`);
		element.dataset.revealState = 'in';
		const timer = setTimeout(
			() => {
				timers.delete(timer);
				finish(element);
			},
			delayMs + REVEAL_TIMING.durationMs[role] + 50
		);
		timers.add(timer);
	};

	/** At once, without animation (focus, or content the visitor has already passed) */
	const showNow = (element: HTMLElement) => {
		pending.delete(element);
		unwatch(element);
		finishNow(element);
	};

	const reveal = (elements: HTMLElement[]) => {
		const ordered = elements.sort((a, b) =>
			a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
		);
		for (const { item, role, delayMs } of planReveal(
			ordered.map((element) => ({ item: element, role: revealRole(element) }))
		)) {
			show(item, role, delayMs);
		}
	};

	const onEntries = (entries: IntersectionObserverEntry[]) => {
		const entering: HTMLElement[] = [];
		for (const entry of entries) {
			const element = entry.target as HTMLElement;
			if (!pending.has(element)) continue;
			if (entry.isIntersecting) entering.push(element);
			// Jumped past it (anchor link, reload further down): no animation out of sight
			else if (entry.boundingClientRect.bottom < 0) showNow(element);
		}
		if (entering.length) reveal(entering);
	};
	const observers = {
		text: new IntersectionObserver(onEntries, { rootMargin: REVEAL_TIMING.rootMargin.text }),
		media: new IntersectionObserver(onEntries, { rootMargin: REVEAL_TIMING.rootMargin.media })
	};
	const unwatch = (element: HTMLElement) => {
		observers.text.unobserve(element);
		observers.media.unobserve(element);
	};

	// At the very bottom of the page the last elements may never pass the -6 % margin
	const revealAtBottom = () => {
		if (!pending.size) return;
		const bottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
		if (!bottom) return;
		reveal(
			[...pending].filter((element) => {
				const box = element.getBoundingClientRect();
				return box.height > 0 && box.top < window.innerHeight;
			})
		);
	};

	const startedLate = performance.now() > REVEAL_TIMING.failsafeMs - 200;
	const register = (element: HTMLElement) => {
		if (element.dataset.revealState || pending.has(element)) return;
		// The failsafe has already shown what is on screen: keep it, don't hide it again
		if (startedLate && element.getBoundingClientRect().top < window.innerHeight) {
			finish(element);
			return;
		}
		const role = revealRole(element);
		element.dataset.revealRole = role;
		pending.add(element);
		observers[role === 'media' ? 'media' : 'text'].observe(element);
	};
	const scan = (node: ParentNode) => {
		if (node instanceof HTMLElement && node.matches(REVEAL_TARGETS)) register(node);
		node.querySelectorAll<HTMLElement>(REVEAL_TARGETS).forEach(register);
	};

	scan(root);
	html.dataset.revealReady = '';

	// Content of pages opened later (client-side navigation), slides added later, …
	const mutations = new MutationObserver((records) => {
		let removed = false;
		for (const record of records) {
			for (const node of record.addedNodes) if (node instanceof HTMLElement) scan(node);
			removed ||= record.removedNodes.length > 0;
		}
		// Forget elements of the page the visitor left
		if (removed) {
			for (const element of pending) {
				if (element.isConnected) continue;
				pending.delete(element);
				unwatch(element);
			}
		}
	});
	mutations.observe(root, { childList: true, subtree: true });

	// Keyboard focus never waits for an animation: reveal the focused element's block at once
	// (also when its animation is still running or waiting for its turn)
	const onFocus = (event: FocusEvent) => {
		for (let node = event.target as HTMLElement | null; node; node = node.parentElement) {
			if (pending.has(node)) showNow(node);
			else if (node.dataset.revealState === 'in') finishNow(node);
		}
	};
	document.addEventListener('focusin', onFocus);

	let frame = 0;
	const onScroll = () => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(revealAtBottom);
	};
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
	requestAnimationFrame(revealAtBottom);

	return () => {
		observers.text.disconnect();
		observers.media.disconnect();
		mutations.disconnect();
		document.removeEventListener('focusin', onFocus);
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('resize', onScroll);
		cancelAnimationFrame(frame);
		timers.forEach(clearTimeout);
		for (const element of pending) finish(element);
		delete html.dataset.revealReady;
	};
}
