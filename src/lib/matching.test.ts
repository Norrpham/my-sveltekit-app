// Run with: npm test
import { describe, expect, it } from 'vitest';
import { familyOf, toFamily } from './colors';
import { findMatches, fits } from './matching';
import { keyboards, keycaps } from './products';

describe('colors', () => {
	it('names common colors', () => {
		expect(familyOf('#1f3a6b')).toBe('blue'); // navy
		expect(familyOf('#2b2b2b')).toBe('black');
		expect(familyOf('#f2f2f2')).toBe('white');
		expect(familyOf('#f3c1d0')).toBe('pink');
		expect(toFamily('Navy')).toBe('blue');
		expect(toFamily('rainbow')).toBeUndefined();
	});
});

describe('findMatches', () => {
	it('never pairs keycaps that do not fit the keyboard', () => {
		const specs = [{}, { layout: '70%' as const }, { theme: 'demon slayer' }, { layout: '60%' as const }];
		for (const spec of specs) {
			for (const m of findMatches(spec, keyboards, keycaps, 10)) {
				expect(fits(m.keyboard, m.keycap)).toBe(true);
			}
		}
	});

	it('returns three different base keyboards', () => {
		const ids = findMatches({}, keyboards, keycaps).map((m) => m.keyboard.id);
		expect(ids).toHaveLength(3);
		expect(new Set(ids).size).toBe(3);
	});

	it("handles Norman's example honestly: Demon Slayer + blue + 70%", () => {
		const [top] = findMatches(
			{ layout: '70%', caseColor: 'blue', theme: 'demon slayer' },
			keyboards,
			keycaps
		);
		// No Demon Slayer set fits a 70% board in our data, so the top result
		// must say what it gave up instead of pretending it's perfect.
		expect(top.differs.length).toBeGreaterThan(0);
		const gaveUpLayout = top.keyboard.layout !== '70%';
		const gaveUpTheme = !top.keycap.tags.includes('demon slayer');
		expect(gaveUpLayout || gaveUpTheme).toBe(true);
	});

	it('offers an alternative that keeps what the top match gave up', () => {
		const results = findMatches(
			{ layout: '70%', caseColor: 'blue', theme: 'demon slayer' },
			keyboards,
			keycaps
		);
		const [top, second] = results;
		expect(top.missed.length).toBeGreaterThan(0);
		for (const gaveUp of top.missed) expect(second.missed).not.toContain(gaveUp);
	});

	it('finds a blue 70% when only those are asked for', () => {
		const [top] = findMatches({ layout: '70%', caseColor: 'blue' }, keyboards, keycaps);
		expect(top.keyboard.layout).toBe('70%');
		expect(familyOf(top.variant.caseColorHex)).toBe('blue');
		expect(top.differs).toEqual([]);
	});

	it('finds Demon Slayer keycaps when the layout allows it', () => {
		const [top] = findMatches({ layout: '65%', theme: 'demon slayer' }, keyboards, keycaps);
		expect(top.keycap.tags).toContain('demon slayer');
		expect(top.keyboard.layout).toBe('65%');
	});

	it('respects requested features like a knob', () => {
		const [top] = findMatches({ features: ['knob'] }, keyboards, keycaps);
		expect(top.keyboard.features.map((f) => f.type)).toContain('knob');
	});

	it('prefers combos inside the budget', () => {
		const [top] = findMatches({ budgetUsd: 120 }, keyboards, keycaps);
		expect(top.totalUsd).not.toBeNull();
		expect(top.totalUsd!).toBeLessThanOrEqual(120);
	});
});
