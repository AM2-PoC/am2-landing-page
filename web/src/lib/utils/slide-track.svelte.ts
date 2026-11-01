import { tick } from 'svelte';
import { clampSlide, nearestSlide } from './slideshow.ts';

/**
 * State of a horizontal scroll-snap track that shows one slide (or one page) at a time:
 * which slide is in view and how to move to another one. Shared by the slideshow and the
 * paged feature list. Bind `element` to the scrolling list and call `update` on scroll.
 */
export class SlideTrack {
	element = $state<HTMLElement>();
	active = $state(0);
	#count: () => number;
	/** Slide an arrow is scrolling to: scroll events in between must not move `active` back */
	#pending: number | null = null;
	#pendingTimer: ReturnType<typeof setTimeout> | undefined;

	constructor(count: () => number) {
		this.#count = count;
	}

	get count() {
		return this.#count();
	}
	get atStart() {
		return this.active === 0;
	}
	get atEnd() {
		return this.active >= this.count - 1;
	}

	#offsets(): number[] {
		const slides = Array.from(this.element?.children ?? []) as HTMLElement[];
		const origin = slides[0]?.offsetLeft ?? 0;
		return slides.map((slide) => slide.offsetLeft - origin);
	}

	update = () => {
		if (!this.element) return;
		const nearest = nearestSlide(this.#offsets(), this.element.scrollLeft);
		if (this.#pending !== null) {
			if (nearest !== this.#pending) return;
			this.#pending = null;
		}
		this.active = nearest;
	};

	goTo(index: number) {
		const left = this.#offsets()[index];
		if (!this.element || left === undefined) return;
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		this.element.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
	}

	/**
	 * One step back or forward. The pressed arrow disappears on the first/last slide,
	 * so keyboard focus moves to the arrow of the other direction.
	 */
	async move(direction: 1 | -1, prevButton?: HTMLElement, nextButton?: HTMLElement) {
		const target = clampSlide(this.active + direction, this.count);
		this.goTo(target);
		// Update right away, so the other arrow is enabled before it receives focus.
		// Until the smooth scroll arrives (or after 1 s, e.g. when a swipe interrupts it),
		// scroll events don't change `active`.
		this.active = target;
		this.#pending = target;
		clearTimeout(this.#pendingTimer);
		this.#pendingTimer = setTimeout(() => {
			this.#pending = null;
			this.update();
		}, 1000);
		await tick();
		if (direction === 1 && target === this.count - 1) prevButton?.focus();
		if (direction === -1 && target === 0) nextButton?.focus();
	}
}

/** Plain chevron beside the content, desktop only (Figma: 48 px, no background) */
export const sideArrowClass =
	'hidden size-12 shrink-0 items-center justify-center rounded-full text-strong transition-colors duration-150 hover:bg-control-hover disabled:invisible lg:inline-flex';
