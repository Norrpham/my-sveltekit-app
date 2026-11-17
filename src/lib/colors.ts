// Turns a hex color like "#1f3a6b" into a plain color name like "blue",
// so a user's word ("blue") can be compared with product colors.

export const colorFamilies = [
	'black',
	'white',
	'grey',
	'red',
	'orange',
	'yellow',
	'green',
	'teal',
	'blue',
	'purple',
	'pink',
	'brown'
] as const;

export type ColorFamily = (typeof colorFamilies)[number];

// Words people type that mean the same family.
const synonyms: Record<string, ColorFamily> = {
	gray: 'grey',
	silver: 'grey',
	navy: 'blue',
	cyan: 'teal',
	mint: 'green',
	lime: 'green',
	violet: 'purple',
	lavender: 'purple',
	beige: 'brown',
	cream: 'white',
	gold: 'yellow'
};

/** "Navy" → "blue", "gray" → "grey", "rainbow" → undefined. */
export function toFamily(word: string): ColorFamily | undefined {
	const w = word.trim().toLowerCase();
	if ((colorFamilies as readonly string[]).includes(w)) return w as ColorFamily;
	return synonyms[w];
}

/** "#1f3a6b" → "blue". Uses hue, saturation and lightness. */
export function familyOf(hex: string): ColorFamily {
	const n = parseInt(hex.replace('#', ''), 16);
	const r = ((n >> 16) & 255) / 255;
	const g = ((n >> 8) & 255) / 255;
	const b = (n & 255) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	const d = max - min;
	const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

	if (s < 0.15 || l < 0.12 || l > 0.94) {
		if (l < 0.3) return 'black';
		if (l > 0.82) return 'white';
		return 'grey';
	}

	let h = 0;
	if (max === r) h = ((g - b) / d) % 6;
	else if (max === g) h = (b - r) / d + 2;
	else h = (r - g) / d + 4;
	h = (h * 60 + 360) % 360;

	if (h < 15 || h >= 345) return l > 0.7 ? 'pink' : 'red';
	if (h < 40) return l < 0.45 ? 'brown' : 'orange';
	if (h < 65) return l < 0.35 ? 'brown' : 'yellow';
	if (h < 165) return 'green';
	if (h < 195) return 'teal';
	if (h < 255) return 'blue';
	if (h < 290) return 'purple';
	return 'pink';
}
