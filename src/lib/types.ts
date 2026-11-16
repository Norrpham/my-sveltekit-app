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

export interface Variant {
	name: string;
	caseColorHex: string;
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
}
