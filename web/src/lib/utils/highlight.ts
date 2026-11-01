export interface TextPart {
	text: string;
	accent: boolean;
}

export function splitHighlight(text: string, highlight?: string | null): TextPart[] {
	if (!highlight) return [{ text, accent: false }];
	const index = text.indexOf(highlight);
	if (index < 0) return [{ text, accent: false }];
	return [
		{ text: text.slice(0, index), accent: false },
		{ text: highlight, accent: true },
		{ text: text.slice(index + highlight.length), accent: false }
	].filter((part) => part.text.length > 0);
}
