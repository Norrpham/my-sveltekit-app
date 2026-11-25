// Case pieces made by drawing the side profile (seen from the right side)
// and pushing it out across the board's width, like an extrusion.
// Units: mm. z = front-to-back (front is +z), y = up (desk is y = 0).

import { ExtrudeGeometry, Shape, type BufferGeometry } from 'three';

export type ProfileFn = (z: number) => number;

/** A slice between two height lines, e.g. the top case between top() and top() - 8. */
export function sliceGeometry(
	depth: number,
	width: number,
	upper: ProfileFn,
	lower: ProfileFn,
	bevel = 0.9,
	steps = 48
): BufferGeometry {
	const shape = new Shape();
	const zs = Array.from({ length: steps + 1 }, (_, i) => depth / 2 - (i * depth) / steps); // front to back
	// Shape x = -z so the extrusion faces the right way after the rotation below.
	zs.forEach((z, i) => (i === 0 ? shape.moveTo(-z, upper(z)) : shape.lineTo(-z, upper(z))));
	[...zs].reverse().forEach((z) => shape.lineTo(-z, Math.min(lower(z), upper(z) - 0.01)));
	shape.closePath();

	const geo = new ExtrudeGeometry(shape, {
		depth: width - bevel * 2,
		bevelEnabled: bevel > 0,
		bevelSize: bevel,
		bevelThickness: bevel,
		bevelSegments: 2,
		curveSegments: 4
	});
	geo.rotateY(Math.PI / 2);
	geo.translate(-(width - bevel * 2) / 2, 0, 0);
	geo.computeVertexNormals();
	return geo;
}

/** Straight line from the front height to the back height. */
export const slope =
	(depth: number, front: number, back: number): ProfileFn =>
	(z) =>
		front + ((back - front) * (depth / 2 - z)) / depth;

export const offset =
	(f: ProfileFn, by: number, floor: ProfileFn = () => 0): ProfileFn =>
	(z) =>
		Math.max(floor(z), f(z) - by);
