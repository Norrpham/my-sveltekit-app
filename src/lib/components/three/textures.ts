// Textures drawn in code (no image files): traditional Japanese patterns for
// theme keys, and wood grain for wooden case tops.
// The patterns (asanoha, ichimatsu, uroko, seigaiha, kikko) are centuries old
// and free for anyone to use.

import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';
import type { PatternName } from '../../types';

const cache = new Map<string, Texture>();

function canvas(size = 256) {
	const c = document.createElement('canvas');
	c.width = c.height = size;
	return { c, g: c.getContext('2d')! };
}

function finish(c: HTMLCanvasElement, repeat = 1): Texture {
	const t = new CanvasTexture(c);
	t.colorSpace = SRGBColorSpace;
	t.wrapS = t.wrapT = RepeatWrapping;
	t.repeat.set(repeat, repeat);
	t.anisotropy = 4;
	return t;
}

/** One tile of a pattern, in two colors. */
export function patternTexture(name: PatternName, bg: string, fg: string, repeatX = 1): Texture {
	const id = `${name}|${bg}|${fg}|${repeatX}`;
	const hit = cache.get(id);
	if (hit) return hit;
	const S = 256;
	const { c, g } = canvas(S);
	g.fillStyle = bg;
	g.fillRect(0, 0, S, S);
	g.strokeStyle = fg;
	g.fillStyle = fg;
	g.lineWidth = 3;

	if (name === 'ichimatsu') {
		// Checkerboard.
		const n = 4;
		const s = S / n;
		for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 2) g.fillRect(i * s, j * s, s, s);
	} else if (name === 'uroko') {
		// Rows of triangles ("fish scales").
		const n = 4;
		const s = S / n;
		for (let r = 0; r < n; r++)
			for (let i = -1; i < n; i++) {
				const x = i * s + (r % 2 ? s / 2 : 0);
				g.beginPath();
				g.moveTo(x, (r + 1) * s);
				g.lineTo(x + s / 2, r * s);
				g.lineTo(x + s, (r + 1) * s);
				g.closePath();
				g.fill();
			}
	} else if (name === 'seigaiha') {
		// Overlapping waves.
		const R = S / 4;
		for (let row = -1; row < 9; row++)
			for (let i = -1; i < 5; i++) {
				const cx = i * 2 * R + (row % 2 ? R : 0);
				const cy = row * (R / 2);
				for (let k = 4; k > 0; k--) {
					g.beginPath();
					g.arc(cx, cy, (R * k) / 4, Math.PI, 0);
					g.fillStyle = k % 2 ? fg : bg;
					g.fill();
				}
			}
	} else if (name === 'kikko') {
		// Hexagons ("tortoise shell").
		const r = S / 6;
		const h = Math.sqrt(3) * r;
		for (let row = -1; row < 5; row++)
			for (let col = -1; col < 5; col++) {
				const cx = col * 1.5 * r * 2;
				const cy = row * h + (col % 2 ? h / 2 : 0);
				g.beginPath();
				for (let k = 0; k < 6; k++) {
					const a = (Math.PI / 3) * k;
					g.lineTo(cx + r * Math.cos(a) * 1.7, cy + r * Math.sin(a) * 1.7);
				}
				g.closePath();
				g.stroke();
			}
	} else {
		// Asanoha (hemp leaf): a triangle grid with lines from each corner to the centre.
		const n = 2;
		const s = S / n; // triangle side
		const h = (Math.sqrt(3) / 2) * s;
		g.lineWidth = 2.5;
		for (let row = -1; row <= Math.ceil(S / h); row++)
			for (let col = -2; col <= n * 2 + 1; col++) {
				const up = (row + col) % 2 === 0;
				const x0 = (col * s) / 2;
				const y0 = row * h;
				const pts = up
					? [[x0, y0 + h], [x0 + s / 2, y0], [x0 + s, y0 + h]]
					: [[x0, y0], [x0 + s, y0], [x0 + s / 2, y0 + h]];
				const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
				const cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
				g.beginPath();
				g.moveTo(pts[0][0], pts[0][1]);
				g.lineTo(pts[1][0], pts[1][1]);
				g.lineTo(pts[2][0], pts[2][1]);
				g.closePath();
				for (const [px, py] of pts) {
					g.moveTo(px, py);
					g.lineTo(cx, cy);
				}
				g.stroke();
			}
	}
	const t = finish(c);
	t.repeat.set(repeatX, 1);
	cache.set(id, t);
	return t;
}

/** Simple wood grain: wavy darker lines on the base color. */
export function woodTexture(base: string): Texture {
	const id = `wood|${base}`;
	const hit = cache.get(id);
	if (hit) return hit;
	const S = 512;
	const { c, g } = canvas(S);
	g.fillStyle = base;
	g.fillRect(0, 0, S, S);
	let seed = 7;
	const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
	for (let i = 0; i < 70; i++) {
		const y = rnd() * S;
		const amp = 2 + rnd() * 6;
		const freq = 0.004 + rnd() * 0.01;
		g.strokeStyle = `rgba(40, 22, 10, ${0.06 + rnd() * 0.16})`;
		g.lineWidth = 0.6 + rnd() * 2.2;
		g.beginPath();
		for (let x = 0; x <= S; x += 8) g.lineTo(x, y + Math.sin(x * freq + i) * amp);
		g.stroke();
	}
	// Case UVs are in millimetres, so one tile covers about 120 mm.
	const t = finish(c, 1 / 120);
	cache.set(id, t);
	return t;
}
