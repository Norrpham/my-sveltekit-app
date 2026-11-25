// The shape of every product in src/lib/data/*.json.
// If you add a field to the JSON, add it here too, and TypeScript will
// point out every place in the code that needs to know about it.

export type Layout = '60%' | '65%' | '70%' | '75%';

export type Availability =
	| 'in_stock'
	| 'pre-order'
	| 'backordered'
	| 'sold_out'
	| 'varies'
	| 'unknown';

export type FeatureType = 'knob' | 'screen' | 'touchbar' | 'led-strip' | 'led-matrix';

export interface Feature {
	type: FeatureType;
	position: string;
	size?: string;
}

/** Colors of the separate case pieces, when a board has more than one. */
export interface CaseParts {
	top: string;
	middle?: string;
	bottom?: string;
	accent?: string;
	/** What the top piece is made of. Wood gets a grain texture. */
	topMaterial?: 'aluminum' | 'wood';
}

export interface Variant {
	name: string;
	caseColorHex: string;
	parts?: CaseParts;
	/**
	 * Surface finish. anodized = satin metal (default); coated = powder/e-coat
	 * with a fine texture; glitter = coat with sparkle; pearl = glossy clear coat.
	 */
	finish?: 'anodized' | 'coated' | 'glitter' | 'pearl';
}

/** Where an open design file or picture came from, and its license. */
export interface Credit {
	what: string; // e.g. "Plate CAD (exact key positions and size)"
	author: string;
	license: string; // e.g. "CERN-OHL-P-2.0"
	licenseUrl: string;
	sourceUrl: string;
}

export interface GalleryImage {
	src: string;
	caption: string;
	credit: string; // shown under the picture
	/** Camera angle that matches this picture ("Match the photo"). Degrees. */
	view?: { azimuth: number; elevation: number };
}

export interface Keyboard {
	id: string;
	name: string;
	brand: string;
	layout: Layout;
	dimensionsMm: { length: number; width: number; height: number };
	caseShape: 'standard' | 'tall-wedge' | 'low-profile';
	variants: Variant[];
	features: Feature[];
	wireless: boolean;
	priceUsd: number | null;
	availability: Availability;
	storeUrl: string;
	affiliateUrl: string;
	imageUrl: string | null;
	sourceUrl: string;
	checkedOn: string;
	colorsApprox: boolean;
	needsCheck: string[];
	notes?: string;
	/**
	 * 'detailed': built from the maker's open design files (see credits).
	 * Missing or 'basic': a simple model from public facts.
	 */
	detail?: 'detailed' | 'basic';
	credits?: Credit[];
	gallery?: GalleryImage[];
	/** Shown under the 3D view, e.g. "KeyCraze is not affiliated with Mode." */
	disclaimer?: string;
	/** Lights built into the board (from the store page). */
	lighting?: Lighting;
}

export interface Lighting {
	/** Light under each key: full RGB, one fixed color, or none. */
	perKey: 'rgb' | 'white' | 'warm-white' | 'none';
	/** Which side of each switch the LED sits on. South = toward the typist. */
	ledSide?: 'north' | 'south';
	/** Lights under the board that shine on the desk. */
	underglow?: 'rgb' | 'white' | 'none';
	/** Fixed LED color, e.g. "cool white" = #e8f0ff. */
	color?: string;
	source?: string;
}

export interface NoveltyKey {
	key: string;
	shape: string;
	color: string;
}

export interface Keycap {
	id: string;
	name: string;
	brand: string;
	theme: string;
	tags: string[];
	colors: { base: string; legend: string; accent: string };
	noveltyKeys: NoveltyKey[];
	profile: string;
	keyCount: number | null;
	fitsLayouts: Layout[];
	lowProfile: boolean;
	officiallyLicensed: boolean | null;
	priceUsd: number | null;
	availability: Availability;
	storeUrl: string;
	affiliateUrl: string;
	sourceUrl: string;
	checkedOn: string;
	colorsApprox: boolean;
	needsCheck: string[];
	/**
	 * Traditional pattern for the theme keys while we have no permission to
	 * show the real character art. These patterns are centuries old and free to use.
	 */
	pattern?: PatternName;
	patternColors?: [string, string];
	/** What the caps are made of and how the legends are made. Drives the look. */
	material?: 'PBT' | 'ABS' | 'PC';
	printing?: 'dye-sub' | 'double-shot' | 'laser' | 'pad-print';
	/** A color for each group of keys, read from the store page or photos. */
	colorMap?: Partial<Record<KeyGroup, string>>;
	/** Colors for single keys, by legend (e.g. "Esc"). Wins over colorMap. */
	keyColors?: Record<string, string>;
	legends?: LegendStyle;
	/** Keys covered by the character art on the real set (we show a pattern there). */
	artKeys?: string[];
	notes?: string;
}

export type KeyGroup =
	| 'alpha'
	| 'number'
	| 'frow'
	| 'mod'
	| 'esc'
	| 'enter'
	| 'space'
	| 'arrow'
	| 'nav';

export interface LegendStyle {
	/** Printed on the top, or on the front side (side-printed). */
	position: 'top' | 'front';
	/** Modifier keys show full words ("Backspace"), icons ("⟵"), or both. */
	mods: 'words' | 'icons' | 'icons+words';
	/** Legends let light through (shine-through / side-lit). */
	shine?: boolean;
	/** Japanese kana in the corner, for sets that have them. */
	kana?: boolean;
	/** Legend color, if different from colors.legend. */
	color?: string;
}

export type PatternName = 'asanoha' | 'ichimatsu' | 'uroko' | 'seigaiha' | 'kikko';
