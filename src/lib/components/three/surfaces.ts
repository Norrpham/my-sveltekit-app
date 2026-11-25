// Surface looks for keycaps and coated cases. PBT is matte and slightly
// grainy; ABS is smoother with a soft shine; powder coat has a fine texture.
import { CanvasTexture, RepeatWrapping, type Texture } from 'three';
import type { Keycap } from '../../types';

const cache = new Map<string, Texture>();

/** Grey noise used as a bump map (tiny bumps on the surface). */
export function grainTexture(size = 128, contrast = 60, repeat = 2): Texture {
	const id = `${size}|${contrast}|${repeat}`;
	const hit = cache.get(id);
	if (hit) return hit;
	const c = document.createElement('canvas');
	c.width = c.height = size;
	const g = c.getContext('2d')!;
	const img = g.createImageData(size, size);
	let seed = 11;
	const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
	for (let i = 0; i < size * size; i++) {
		const v = 128 + (rnd() - 0.5) * contrast;
		img.data.set([v, v, v, 255], i * 4);
	}
	g.putImageData(img, 0, 0);
	const t = new CanvasTexture(c);
	t.wrapS = t.wrapT = RepeatWrapping;
	t.repeat.set(repeat, repeat);
	cache.set(id, t);
	return t;
}

/** Material settings for a keycap, from what the set is made of. */
export function keycapLook(keycap: Keycap) {
	if (keycap.material === 'ABS')
		return { roughness: 0.38, metalness: 0, bumpScale: 0 };
	if (keycap.material === 'PC')
		return { roughness: 0.3, metalness: 0, bumpScale: 0, transparent: true, opacity: 0.88 };
	// PBT (and unknown): matte, fine grain.
	return { roughness: 0.82, metalness: 0, bumpMap: grainTexture(128, 70, 3), bumpScale: 0.6 };
}
