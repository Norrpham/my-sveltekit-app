// Keycap shapes. Real keycaps are narrower at the top than at the bottom, and
// "sculpted" profiles (Cherry, OEM, SA) change height and angle row by row.
// Sizes are in millimetres. Shapes are cached so 80 keys don't build 80 meshes.

import { BufferGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type ProfileName = 'cherry' | 'oem' | 'sa' | 'uniform' | 'low';

export interface Profile {
	/** Height of each sculpt row, back (number/F-row) to front (spacebar row). */
	heights: [number, number, number, number, number];
	/** Tilt of the key top in degrees, same rows. Positive leans toward the typist. */
	tilts: [number, number, number, number, number];
	/** How much smaller the top is than the bottom, on each side. */
	topInset: number;
	radius: number;
}

// Rough measurements of each family (Cherry R1..R4 plus the spacebar row).
const PROFILES: Record<ProfileName, Profile> = {
	cherry: { heights: [9.4, 7.6, 7.1, 7.7, 7.7], tilts: [7, 3, 0, -4, -6], topInset: 2.9, radius: 1.3 },
	oem: { heights: [11.9, 10.2, 9.4, 10.1, 10.1], tilts: [8, 4, 1, -4, -6], topInset: 3.1, radius: 1.4 },
	sa: { heights: [13.6, 11.6, 11.6, 13.4, 13.4], tilts: [9, 4, 0, -6, -8], topInset: 2.6, radius: 2.2 },
	uniform: { heights: [9.1, 9.1, 9.1, 9.1, 9.1], tilts: [0, 0, 0, 0, 0], topInset: 2.4, radius: 1.8 },
	low: { heights: [4, 4, 4, 4, 4], tilts: [0, 0, 0, 0, 0], topInset: 1, radius: 1 }
};

/** Map the profile names in keycaps.json to a shape family. */
export function profileOf(name: string, lowProfile = false): Profile {
	if (lowProfile) return PROFILES.low;
	const p = name.toLowerCase();
	if (p.includes('oem')) return PROFILES.oem;
	if (p === 'sa' || p.includes('sa ')) return PROFILES.sa;
	// XDA, DSA, MOA, ASA, JDA and friends: same height on every row.
	if (/^(x|d|m|a|j)\w?a$/.test(p) || p.includes('xda') || p.includes('dsa')) return PROFILES.uniform;
	return PROFILES.cherry; // Cherry, KSA-like and "unknown"
}

/**
 * Which sculpt row a key uses. `row` counts from the back; `rows` is how many
 * rows the board has (a 75% has an extra F-row that reuses the number-row shape).
 */
export function sculptRow(row: number, rows: number): number {
	const fromFront = rows - 1 - row; // 0 = spacebar row
	return Math.max(0, 4 - fromFront);
}

const U = 19.05;
const GAP = 0.9; // space around each cap
const cache = new Map<string, BufferGeometry>();

/** A tapered keycap, sitting on y = 0, centred on x/z. */
export function keycapGeometry(widthU: number, depthU: number, height: number, p: Profile): BufferGeometry {
	const key = `${widthU}|${depthU}|${height}|${p.topInset}|${p.radius}`;
	const hit = cache.get(key);
	if (hit) return hit;

	const w = widthU * U - GAP * 2;
	const d = depthU * U - GAP * 2;
	const geo = new RoundedBoxGeometry(w, height, d, 2, p.radius);
	const pos = geo.attributes.position;
	for (let i = 0; i < pos.count; i++) {
		const y = pos.getY(i);
		const t = (y + height / 2) / height; // 0 at the bottom, 1 at the top
		const sx = 1 - (2 * p.topInset * t) / w;
		const sz = 1 - (2 * p.topInset * t) / d;
		pos.setX(i, pos.getX(i) * sx);
		pos.setZ(i, pos.getZ(i) * sz);
		pos.setY(i, y + height / 2);
	}
	geo.computeVertexNormals();
	cache.set(key, geo);
	return geo;
}

export const topSize = (widthU: number, depthU: number, p: Profile) => ({
	w: widthU * U - GAP * 2 - p.topInset * 2 - p.radius,
	d: depthU * U - GAP * 2 - p.topInset * 2 - p.radius
});
