// What is printed on each key. Our layouts name keys with short labels
// ("Back", "Caps", "1"); this turns them into real legends.

import type { LegendStyle } from './types';

export interface Legend {
	/** Big legend (the letter, or the word/icon on a modifier). */
	main: string;
	/** Small legend above it (the shifted symbol, e.g. "!" over "1"). */
	shift?: string;
	/** Japanese kana (only for sets that print kana). */
	kana?: string;
}

// Shifted symbols on a US (ANSI) layout.
const SHIFTED: Record<string, string> = {
	'`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*',
	'9': '(', '0': ')', '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"',
	',': '<', '.': '>', '/': '?'
};

// Japanese kana printed on US-layout kana sets (the JIS kana positions).
const KANA: Record<string, string> = {
	'1': 'ぬ', '2': 'ふ', '3': 'あ', '4': 'う', '5': 'え', '6': 'お', '7': 'や', '8': 'ゆ', '9': 'よ',
	'0': 'わ', '-': 'ほ', '=': 'へ', Q: 'た', W: 'て', E: 'い', R: 'す', T: 'か', Y: 'ん', U: 'な',
	I: 'に', O: 'ら', P: 'せ', '[': '「', ']': '」', '\\': 'む', A: 'ち', S: 'と', D: 'し', F: 'は',
	G: 'き', H: 'く', J: 'ま', K: 'の', L: 'り', ';': 'れ', "'": 'け', Z: 'つ', X: 'さ', C: 'そ',
	V: 'ひ', B: 'こ', N: 'み', M: 'も', ',': 'ね', '.': 'る', '/': 'め'
};

const WORDS: Record<string, string> = {
	Back: 'Backspace', Caps: 'Caps Lock', Win: 'Win', Ctrl: 'Ctrl', Alt: 'Alt', Fn: 'Fn',
	Tab: 'Tab', Shift: 'Shift', Enter: 'Enter', Esc: 'Esc', Del: 'Del', Ins: 'Ins', Home: 'Home',
	End: 'End', PgUp: 'PgUp', PgDn: 'PgDn', PrtSc: 'PrtSc', Menu: 'Menu'
};

const ICONS: Record<string, string> = {
	Back: '⟵', Tab: '⇥', Caps: '⇪', Shift: '⇧', Enter: '↵'
};

export function legendFor(label: string, style?: LegendStyle): Legend {
	if (!label) return { main: '' };
	const kana = style?.kana ? KANA[label] : undefined;
	if (SHIFTED[label]) return { main: label, shift: SHIFTED[label], kana };
	const word = WORDS[label];
	if (word) {
		const icon = ICONS[label];
		const mods = style?.mods ?? 'words';
		if (icon && mods === 'icons') return { main: icon };
		if (icon && mods === 'icons+words') return { main: `${icon} ${word}` };
		return { main: word };
	}
	return { main: label, kana };
}
