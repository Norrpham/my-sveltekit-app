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
	/** Coating look: plain, with glitter, or glossy pearl. */
	finish?: 'matte' | 'glitter' | 'pearl';
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
}

export type PatternName = 'asanoha' | 'ichimatsu' | 'uroko' | 'seigaiha' | 'kikko';
