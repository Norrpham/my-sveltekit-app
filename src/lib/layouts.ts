// Where every key sits on a 60/65/70/75% keyboard, in "units" (u).
// 1u = one normal key = 19.05 mm. A 2u key (Backspace) is twice as wide.
// These are standard US (ANSI) layouts; real boards can differ a little.

import type { Feature, Layout } from './types';

export const UNIT_MM = 19.05;

export type KeyKind = 'alpha' | 'mod' | 'accent' | 'space';

export interface Key {
	label: string;
	x: number; // left edge, in u
	y: number; // row (0 = back row), in u
	w: number; // width, in u
	kind: KeyKind;
}

export interface FeatureSpot {
	type: Feature['type'];
	x: number; // left edge, in u
	y: number;
	w: number;
}

export interface BuiltLayout {
	keys: Key[];
	spots: FeatureSpot[]; // places where a knob/screen/touch bar replaced keys
	widthU: number;
	depthU: number;
}

// A row is a list of [label, width]. A label of '' is an empty gap.
type Row = [string, number][];

const n = (labels: string) => labels.split(' ').map((l): [string, number] => [l, 1]);

const numberRow = n('Esc 1 2 3 4 5 6 7 8 9 0 - =');
const qRow = n('Q W E R T Y U I O P [ ]');
const aRow = n("A S D F G H J K L ; '");
const zRow = n('Z X C V B N M , . /');

const rows: Record<Layout, { rows: Row[]; gapAfterFirst?: number }> = {
	'60%': {
		rows: [
			[...numberRow, ['Back', 2]],
			[['Tab', 1.5], ...qRow, ['\\', 1.5]],
			[['Caps', 1.75], ...aRow, ['Enter', 2.25]],
			[['Shift', 2.25], ...zRow, ['Shift', 2.75]],
			[['Ctrl', 1.25], ['Win', 1.25], ['Alt', 1.25], ['', 6.25], ['Alt', 1.25], ['Fn', 1.25], ['Menu', 1.25], ['Ctrl', 1.25]]
		]
	},
	'65%': {
		rows: [
			[...numberRow, ['Back', 2], ['Del', 1]],
			[['Tab', 1.5], ...qRow, ['\\', 1.5], ['PgUp', 1]],
			[['Caps', 1.75], ...aRow, ['Enter', 2.25], ['PgDn', 1]],
			[['Shift', 2.25], ...zRow, ['Shift', 1.75], ['↑', 1], ['End', 1]],
			[['Ctrl', 1.25], ['Win', 1.25], ['Alt', 1.25], ['', 6.25], ['Alt', 1], ['Fn', 1], ['Ctrl', 1], ['←', 1], ['↓', 1], ['→', 1]]
		]
	},
	'70%': {
		rows: [
			[...numberRow, ['Back', 2], ['Ins', 1], ['Home', 1]],
			[['Tab', 1.5], ...qRow, ['\\', 1.5], ['Del', 1], ['PgUp', 1]],
			[['Caps', 1.75], ...aRow, ['Enter', 2.25], ['_gap', 1], ['PgDn', 1]],
			[['Shift', 2.25], ...zRow, ['Shift', 1.75], ['_gap', 1], ['↑', 1], ['End', 1]],
			[['Ctrl', 1.25], ['Win', 1.25], ['Alt', 1.25], ['', 6.25], ['Alt', 1], ['Fn', 1], ['Ctrl', 1], ['_gap', 1], ['←', 1], ['↓', 1], ['→', 1]]
		]
	},
	'75%': {
		gapAfterFirst: 0.25, // the small space below the F-key row
		rows: [
			[['Esc', 1], ...n('F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12'), ['PrtSc', 1], ['Ins', 1], ['Del', 1]],
			[...n('` 1 2 3 4 5 6 7 8 9 0 - ='), ['Back', 2], ['PgUp', 1]],
			[['Tab', 1.5], ...qRow, ['\\', 1.5], ['PgDn', 1]],
			[['Caps', 1.75], ...aRow, ['Enter', 2.25], ['Home', 1]],
			[['Shift', 2.25], ...zRow, ['Shift', 1.75], ['↑', 1], ['End', 1]],
			[['Ctrl', 1.25], ['Win', 1.25], ['Alt', 1.25], ['', 6.25], ['Alt', 1], ['Fn', 1], ['Ctrl', 1], ['←', 1], ['↓', 1], ['→', 1]]
		]
	}
};

const MODS = new Set([
	'Tab', 'Caps', 'Shift', 'Ctrl', 'Win', 'Alt', 'Fn', 'Menu', 'Back', '\\',
	'Del', 'Ins', 'Home', 'End', 'PgUp', 'PgDn', 'PrtSc', '↑', '↓', '←', '→'
]);

function kindOf(label: string, w: number): KeyKind {
	if (label === 'Esc' || label === 'Enter') return 'accent';
	if (label === '' && w > 3) return 'space';
	if (MODS.has(label) || /^F\d+$/.test(label)) return 'mod';
	return 'alpha';
}

/** Lay out every key, then swap keys out for the board's knob, screen or touch bar. */
export function buildLayout(layout: Layout, features: Feature[] = []): BuiltLayout {
	const def = rows[layout];
	let keys: Key[] = [];
	let y = 0;
	def.rows.forEach((row, r) => {
		let x = 0;
		for (const [label, w] of row) {
			if (label !== '_gap') keys.push({ label, x, y, w, kind: kindOf(label, w) });
			x += w;
		}
		y += 1 + (r === 0 && def.gapAfterFirst ? def.gapAfterFirst : 0);
	});

	const widthU = Math.max(...keys.map((k) => k.x + k.w));
	const depthU = y;
	const spots: FeatureSpot[] = [];
	const topRow = () => keys.filter((k) => k.y === 0).sort((a, b) => a.x - b.x);
	const types = new Set(features.map((f) => f.type));

	// Knob: takes the place of the top-right key.
	if (types.has('knob')) {
		const last = topRow().at(-1)!;
		keys = keys.filter((k) => k !== last);
		spots.push({ type: 'knob', x: last.x, y: last.y, w: last.w });
	}
	// Screen: takes the two top-row keys at the right (left of the knob).
	if (types.has('screen')) {
		const two = topRow().slice(-2);
		keys = keys.filter((k) => !two.includes(k));
		spots.push({ type: 'screen', x: two[0].x, y: 0, w: two.reduce((s, k) => s + k.w, 0) });
	}
	// Touch bar: replaces the arrow keys (as on the AM Compact Touch).
	if (types.has('touchbar')) {
		const arrows = keys.filter((k) => ['←', '↓', '→', '↑'].includes(k.label));
		if (arrows.length) {
			const bottom = arrows.filter((k) => k.label !== '↑');
			keys = keys.filter((k) => !arrows.includes(k));
			const x = Math.min(...bottom.map((k) => k.x));
			spots.push({ type: 'touchbar', x, y: bottom[0].y, w: Math.max(...bottom.map((k) => k.x + k.w)) - x });
		}
	}
	return { keys, spots, widthU, depthU };
}
