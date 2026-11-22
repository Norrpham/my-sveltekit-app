// The bridge between the AI and the matcher.
// 1. SPEC_JSON_SCHEMA tells the AI exactly what shape to answer in.
// 2. parseSpec() cleans whatever comes back, so a bad AI answer can never
//    put strange values into the matcher.

import { colorFamilies, toFamily } from './colors';
import type { Spec } from './matching';
import type { FeatureType, Layout } from './types';

export const LAYOUTS: Layout[] = ['60%', '65%', '70%', '75%'];
export const FEATURES: FeatureType[] = ['knob', 'screen', 'touchbar', 'led-strip', 'led-matrix'];

// Strict mode needs every field listed as required; "null" means "not mentioned".
export const SPEC_JSON_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	required: ['layout', 'caseColor', 'theme', 'keycapColor', 'budgetUsd', 'wireless', 'features'],
	properties: {
		layout: {
			type: ['string', 'null'],
			enum: [...LAYOUTS, null],
			description: 'Keyboard size. null if not mentioned or not one of these.'
		},
		caseColor: {
			type: ['string', 'null'],
			enum: [...colorFamilies, null],
			description: 'Color of the keyboard case/base. null if not mentioned.'
		},
		theme: {
			type: ['string', 'null'],
			description:
				'Keycap theme in lowercase: a franchise, character or style, e.g. "demon slayer", "one piece", "retro". null if none.'
		},
		keycapColor: {
			type: ['string', 'null'],
			enum: [...colorFamilies, null],
			description: 'Main keycap color if the user names one. null otherwise.'
		},
		budgetUsd: {
			type: ['number', 'null'],
			description: 'Total budget in US dollars for keyboard + keycaps. null if not mentioned.'
		},
		wireless: {
			type: ['boolean', 'null'],
			description: 'true if they want wireless, false if they want wired, null if not mentioned.'
		},
		features: {
			type: 'array',
			items: { type: 'string', enum: FEATURES },
			description: 'Physical extras they ask for. Empty array if none.'
		}
	}
} as const;

/** Clean an untrusted object (from the AI) into a valid Spec. Unknown values are dropped. */
export function parseSpec(raw: unknown): Spec {
	const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
	const spec: Spec = {};

	if (typeof r.layout === 'string' && (LAYOUTS as string[]).includes(r.layout)) {
		spec.layout = r.layout as Layout;
	}
	if (typeof r.caseColor === 'string') spec.caseColor = toFamily(r.caseColor);
	if (typeof r.keycapColor === 'string') spec.keycapColor = toFamily(r.keycapColor);
	if (typeof r.theme === 'string') {
		const theme = r.theme.trim().toLowerCase().slice(0, 60);
		if (theme) spec.theme = theme;
	}
	if (typeof r.budgetUsd === 'number' && Number.isFinite(r.budgetUsd) && r.budgetUsd > 0) {
		spec.budgetUsd = Math.round(r.budgetUsd);
	}
	if (typeof r.wireless === 'boolean') spec.wireless = r.wireless;
	if (Array.isArray(r.features)) {
		const features = r.features.filter((f): f is FeatureType => FEATURES.includes(f));
		if (features.length) spec.features = [...new Set(features)];
	}

	// Drop keys that ended up undefined so the spec stays tidy.
	for (const key of Object.keys(spec) as (keyof Spec)[]) {
		if (spec[key] === undefined) delete spec[key];
	}
	return spec;
}
