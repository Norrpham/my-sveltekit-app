// The matcher: takes a spec (what the user wants) and finds the best real
// base keyboard + keycap set combos. In Phase 4 the AI will fill in the spec
// from the user's words; this file never needs to know about the AI.

import { familyOf, toFamily } from './colors';
import type { Availability, FeatureType, Keyboard, Keycap, Layout, Variant } from './types';

/** What the user asked for. Every field is optional: blank means "don't care". */
export interface Spec {
	layout?: Layout;
	caseColor?: string; // a color word, e.g. "blue"
	theme?: string; // e.g. "demon slayer", "anime", "pink"
	keycapColor?: string; // a color word for the keycaps
	budgetUsd?: number; // for base + keycaps together
	wireless?: boolean;
	features?: FeatureType[]; // e.g. ["knob"]
}

export interface Match {
	keyboard: Keyboard;
	variant: Variant; // the case color we picked
	keycap: Keycap;
	totalUsd: number | null;
	score: number;
	matched: string[]; // what lined up with the spec
	differs: string[]; // what didn't, said plainly
	missed: Miss[]; // which parts of the spec this combo gave up
}

export type Miss = 'layout' | 'caseColor' | 'theme' | 'keycapColor' | 'wireless' | 'feature' | 'budget';

// How much each thing counts. Layout matters most (it decides the board's size).
export const WEIGHTS = {
	layoutExact: 40,
	layoutClose: 15, // one size away, e.g. 65% when 70% was asked
	caseColor: 25,
	theme: 40,
	keycapColor: 15,
	wireless: 10,
	feature: 10, // per requested feature
	budgetOk: 15,
	buyable: 10, // in stock / varies
	soldOut: -25
};

type Notes = Pick<Match, 'matched' | 'differs' | 'missed'>;

const layoutOrder: Layout[] = ['60%', '65%', '70%', '75%'];

/** Base + keycaps fit only if the keycap set covers the layout and the switch height matches. */
export function fits(keyboard: Keyboard, keycap: Keycap): boolean {
	const lowProfileBoard = keyboard.caseShape === 'low-profile';
	return keycap.fitsLayouts.includes(keyboard.layout) && keycap.lowProfile === lowProfileBoard;
}

function availabilityScore(a: Availability): number {
	if (a === 'in_stock' || a === 'varies') return WEIGHTS.buyable;
	if (a === 'sold_out') return WEIGHTS.soldOut;
	return 0; // unknown, pre-order, backordered: neutral
}

/** Does the theme text appear in the keycap's name, theme or tags? */
function themeMatches(keycap: Keycap, theme: string): boolean {
	const haystack = [keycap.name, keycap.theme, ...keycap.tags].join(' ').toLowerCase();
	return theme
		.toLowerCase()
		.split(/\s+/)
		.filter(Boolean)
		.every((word) => haystack.includes(word));
}

function keycapColorMatches(keycap: Keycap, word: string): boolean {
	const fam = toFamily(word);
	if (fam && [keycap.colors.base, keycap.colors.accent].some((hex) => familyOf(hex) === fam)) {
		return true;
	}
	return keycap.tags.some((t) => t.toLowerCase() === word.toLowerCase());
}

function scoreKeyboard(k: Keyboard, spec: Spec, out: Notes) {
	let score = availabilityScore(k.availability);
	if (k.availability === 'sold_out') out.differs.push(`${k.name} is sold out right now`);

	if (spec.layout) {
		const gap = Math.abs(layoutOrder.indexOf(k.layout) - layoutOrder.indexOf(spec.layout));
		if (gap === 0) {
			score += WEIGHTS.layoutExact;
			out.matched.push(`${k.layout} layout`);
		} else {
			if (gap === 1) score += WEIGHTS.layoutClose;
			out.differs.push(`It's ${k.layout}, not ${spec.layout}`);
			out.missed.push('layout');
		}
	}

	if (spec.wireless !== undefined) {
		if (k.wireless === spec.wireless) {
			score += WEIGHTS.wireless;
			out.matched.push(k.wireless ? 'wireless' : 'wired');
		} else {
			out.differs.push(k.wireless ? 'It is wireless (you asked for wired)' : 'It is wired only');
			out.missed.push('wireless');
		}
	}

	for (const f of spec.features ?? []) {
		if (k.features.some((kf) => kf.type === f)) {
			score += WEIGHTS.feature;
			out.matched.push(`has a ${f}`);
		} else {
			out.differs.push(`No ${f}`);
			out.missed.push('feature');
		}
	}
	return score;
}

/** Pick the case color closest to what was asked (or the first one). */
function pickVariant(k: Keyboard, spec: Spec, out: Notes) {
	if (!spec.caseColor) return { variant: k.variants[0], score: 0 };
	const fam = toFamily(spec.caseColor);
	const hit = k.variants.find(
		(v) =>
			(fam && familyOf(v.caseColorHex) === fam) ||
			v.name.toLowerCase().includes(spec.caseColor!.toLowerCase())
	);
	if (hit) {
		out.matched.push(`${hit.name} case`);
		return { variant: hit, score: WEIGHTS.caseColor };
	}
	out.differs.push(`No ${spec.caseColor} case; shown in ${k.variants[0].name}`);
	out.missed.push('caseColor');
	return { variant: k.variants[0], score: 0 };
}

function scoreKeycap(c: Keycap, spec: Spec, out: Notes) {
	let score = availabilityScore(c.availability);
	if (c.availability === 'sold_out') out.differs.push(`${c.name} keycaps are sold out`);

	if (spec.theme) {
		if (themeMatches(c, spec.theme)) {
			score += WEIGHTS.theme;
			out.matched.push(`${spec.theme} keycaps`);
		} else {
			out.differs.push(`Keycaps aren't ${spec.theme}`);
			out.missed.push('theme');
		}
	}
	if (spec.keycapColor) {
		if (keycapColorMatches(c, spec.keycapColor)) {
			score += WEIGHTS.keycapColor;
			out.matched.push(`${spec.keycapColor} keycaps`);
		} else {
			out.differs.push(`Keycaps aren't ${spec.keycapColor}`);
			out.missed.push('keycapColor');
		}
	}
	return score;
}

/**
 * Score every base + keycap pair that physically fits, then return the best
 * one plus alternatives. Each result uses a different base keyboard so the
 * user sees real choices, not the same board three times.
 */
export function findMatches(
	spec: Spec,
	keyboards: Keyboard[],
	keycaps: Keycap[],
	howMany = 3
): Match[] {
	const all: Match[] = [];

	for (const keyboard of keyboards) {
		for (const keycap of keycaps) {
			if (!fits(keyboard, keycap)) continue;

			const notes: Notes = { matched: [], differs: [], missed: [] };
			let score = scoreKeyboard(keyboard, spec, notes);
			const picked = pickVariant(keyboard, spec, notes);
			score += picked.score;
			score += scoreKeycap(keycap, spec, notes);

			const totalUsd =
				keyboard.priceUsd !== null && keycap.priceUsd !== null
					? Math.round((keyboard.priceUsd + keycap.priceUsd) * 100) / 100
					: null;
			if (spec.budgetUsd !== undefined && totalUsd !== null) {
				if (totalUsd <= spec.budgetUsd) {
					score += WEIGHTS.budgetOk;
					notes.matched.push(`within $${spec.budgetUsd}`);
				} else {
					// Lose points the further over budget it goes.
					score -= Math.min(40, Math.round(((totalUsd - spec.budgetUsd) / spec.budgetUsd) * 40));
					notes.differs.push(`$${(totalUsd - spec.budgetUsd).toFixed(0)} over your budget`);
					notes.missed.push('budget');
				}
			}

			all.push({ keyboard, variant: picked.variant, keycap, totalUsd, score, ...notes });
		}
	}

	all.sort((a, b) => b.score - a.score || (a.totalUsd ?? Infinity) - (b.totalUsd ?? Infinity));

	const results: Match[] = [];
	const usedBases = new Set<string>();
	const add = (m: Match | undefined) => {
		if (!m || usedBases.has(m.keyboard.id) || results.length >= howMany) return;
		usedBases.add(m.keyboard.id);
		results.push(m);
	};

	const top = all[0];
	add(top);
	// If the top match had to give something up, show the best combo that
	// keeps exactly that thing, so the user sees both ways to compromise.
	if (top && top.missed.length > 0) {
		add(all.find((m) => !usedBases.has(m.keyboard.id) && !m.missed.some((x) => top.missed.includes(x))));
	}
	for (const m of all) add(m);
	return results;
}
