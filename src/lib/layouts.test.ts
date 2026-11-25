import { describe, expect, it } from 'vitest';
import { buildLayout } from './layouts';
import { keyboards } from './products';
import type { Layout } from './types';

const sizes: [Layout, number, number][] = [
	// layout, expected width in u, expected key count
	['60%', 15, 61],
	['65%', 16, 68],
	['70%', 17, 70],
	['75%', 16, 84]
];

describe('buildLayout', () => {
	it.each(sizes)('%s has the right width and key count', (layout, width, count) => {
		const { keys, widthU } = buildLayout(layout);
		expect(widthU).toBe(width);
		expect(keys).toHaveLength(count);
	});

	it('never overlaps two keys in the same row', () => {
		for (const [layout] of sizes) {
			const { keys } = buildLayout(layout);
			for (const a of keys)
				for (const b of keys) {
					if (a === b || a.y !== b.y) continue;
					expect(a.x + a.w <= b.x || b.x + b.w <= a.x).toBe(true);
				}
		}
	});

	it('puts a knob where the top-right key was', () => {
		const plain = buildLayout('65%');
		const withKnob = buildLayout('65%', [{ type: 'knob', position: 'top-right' }]);
		expect(withKnob.keys).toHaveLength(plain.keys.length - 1);
		expect(withKnob.spots).toEqual([{ type: 'knob', x: 15, y: 0, w: 1 }]);
	});

	it('swaps the arrow keys for a touch bar', () => {
		const { keys, spots } = buildLayout('65%', [{ type: 'touchbar', position: 'front edge' }]);
		expect(keys.some((k) => k.label === '←')).toBe(false);
		expect(spots[0]).toMatchObject({ type: 'touchbar', w: 3 });
	});

	it('works for every keyboard in the catalog', () => {
		for (const k of keyboards) {
			const built = buildLayout(k.layout, k.features);
			expect(built.keys.length).toBeGreaterThan(50);
		}
	});
});

describe('exact key maps from the open plate files', () => {
	it('Mode Sonnet 2026 has 82 keys, 16u wide, with the F-row gap', () => {
		const l = buildLayout('75%', [], 'mode-sonnet-2026');
		expect(l.keys.length).toBe(82);
		expect(l.widthU).toBe(16);
		expect(l.depthU).toBe(6.25);
		// F1 starts after Esc and a half-key gap.
		expect(l.keys.find((k) => k.label === 'F1')!.x).toBe(1.5);
		expect(l.keys.find((k) => k.label === 'Del')!.x).toBe(15);
	});
	it('Mode Encore 2026 has 68 keys, 16u wide', () => {
		const l = buildLayout('65%', [], 'mode-encore-2026');
		expect(l.keys.length).toBe(68);
		expect(l.widthU).toBe(16);
	});
	it('Bakeneko65 has 67 keys with a gap before the arrows', () => {
		const l = buildLayout('65%', [], 'bakeneko65');
		expect(l.keys.length).toBe(67);
		expect(l.widthU).toBe(16);
		expect(l.keys.find((k) => k.label === '←')!.x).toBe(13);
	});
	it('every row of every exact map is 16u wide', () => {
		for (const id of ['mode-sonnet-2026', 'mode-encore-2026', 'bakeneko65']) {
			const l = buildLayout('65%', [], id);
			const rows = new Map<number, number>();
			for (const k of l.keys) rows.set(k.y, Math.max(rows.get(k.y) ?? 0, k.x + k.w));
			for (const w of rows.values()) expect(w).toBe(16);
		}
	});
});
