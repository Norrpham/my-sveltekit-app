<script lang="ts">
	// All the keycaps of one board. The parent puts this group where the keys
	// start (front-left corner is worked out here from the layout size).
	// y = 0 is the bottom of the keycaps.
	import { T } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import { Color } from 'three';
	import { UNIT_MM as U, type BuiltLayout, type Key } from '../../layouts';
	import type { Keycap } from '../../types';
	import { keycapGeometry, profileOf, sculptRow, topSize } from './keycaps';
	import { patternTexture } from './textures';

	let {
		layout,
		keycap,
		plateColor = '#1a1a1a'
	}: { layout: BuiltLayout; keycap: Keycap; plateColor?: string } = $props();

	let profile = $derived(profileOf(keycap.profile, keycap.lowProfile));
	let keysW = $derived(layout.widthU * U);
	let keysD = $derived(layout.depthU * U);
	let rowCount = $derived(new Set(layout.keys.map((k) => k.y)).size);
	let rowOrder = $derived([...new Set(layout.keys.map((k) => k.y))].sort((a, b) => a - b));

	const cx = (k: Key) => -keysW / 2 + (k.x + k.w / 2) * U;
	const cz = (k: Key) => -keysD / 2 + (k.y + 0.5) * U;

	// Mix two hex colors the way they look on screen (sRGB), not in linear light.
	function mixHex(a: string, b: string, t: number): string {
		const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
		const [x, y] = [p(a), p(b)];
		return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
	}

	function brightness(hex: string) {
		const c = new Color(hex);
		return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
	}

	const isSpace = (k: Key) => k.kind === 'space';
	let noveltyFor = $derived((k: Key) => keycap.noveltyKeys.find((n) => n.key === k.label));

	function capColor(k: Key): string {
		const novelty = noveltyFor(k);
		if (novelty) return novelty.color;
		if (k.kind === 'accent') return keycap.colors.accent;
		if (k.kind === 'mod') return mixHex(keycap.colors.base, keycap.colors.legend, 0.1);
		return keycap.colors.base;
	}

	function legendOn(bg: string): string {
		const { legend, base } = keycap.colors;
		const gap = (c: string) => Math.abs(brightness(c) - brightness(bg));
		return gap(legend) >= gap(base) ? legend : base;
	}

	// Theme keys get the set's pattern: Esc, Enter, Backspace, the spacebar and
	// any novelty keys. They also get a small mark so people know a character
	// design goes there on the real set.
	const THEME_KEYS = new Set(['Esc', 'Enter', 'Back']);
	let isThemeKey = $derived(
		(k: Key) => !!keycap.pattern && (THEME_KEYS.has(k.label) || isSpace(k) || !!noveltyFor(k))
	);
	let isCharacterKey = $derived((k: Key) => !!keycap.pattern && (isSpace(k) || !!noveltyFor(k) || k.label === 'Esc'));

	let patternColors = $derived<[string, string]>(
		keycap.patternColors ?? [keycap.colors.base, keycap.colors.accent]
	);

	const fontSize = (label: string) => (label.length > 3 ? 2.3 : label.length > 1 ? 2.8 : 3.8);
	const deg = (d: number) => (d * Math.PI) / 180;
</script>

<!-- Plate seen between the keys -->
<T.Mesh position={[0, -0.6, 0]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[keysW + 1, keysD + 1]} />
	<T.MeshStandardMaterial color={plateColor} roughness={0.8} metalness={0.2} />
</T.Mesh>

{#each layout.keys as k (k.label + k.x + '-' + k.y)}
	{@const row = sculptRow(rowOrder.indexOf(k.y), rowCount)}
	{@const h = profile.heights[row]}
	{@const color = capColor(k)}
	{@const top = topSize(k.w, 1, profile)}
	<T.Group position={[cx(k), 0, cz(k)]} rotation.x={deg(profile.tilts[row])}>
		<T.Mesh geometry={keycapGeometry(k.w, 1, h, profile)} castShadow>
			<T.MeshStandardMaterial {color} roughness={0.55} metalness={0} />
		</T.Mesh>

		{#if isThemeKey(k)}
			{@const tex = patternTexture(keycap.pattern!, patternColors[0], patternColors[1], Math.max(1, Math.round(k.w)))}
			<T.Mesh position={[0, h + 0.06, 0]} rotation.x={-Math.PI / 2}>
				<T.PlaneGeometry args={[top.w, top.d]} />
				<T.MeshStandardMaterial
					map={tex}
					roughness={0.55}
					polygonOffset
					polygonOffsetFactor={-2}
				/>
			</T.Mesh>
		{/if}

		{#if isCharacterKey(k)}
			<!-- Small "character key" mark: the real set has character art here. -->
			<T.Mesh position={[top.w / 2 - 2.2, h + 0.12, -top.d / 2 + 2.2]} rotation.x={-Math.PI / 2}>
				<T.CircleGeometry args={[1.5, 20]} />
				<T.MeshBasicMaterial color="#ffffff" />
			</T.Mesh>
			<Text
				text="✦"
				fontSize={2.2}
				color={keycap.colors.accent}
				anchorX="center"
				anchorY="middle"
				position={[top.w / 2 - 2.2, h + 0.18, -top.d / 2 + 2.2]}
				rotation.x={-Math.PI / 2}
			/>
		{/if}

		{#if k.label && !isSpace(k) && !isThemeKey(k)}
			<Text
				text={k.label}
				fontSize={fontSize(k.label)}
				color={legendOn(color)}
				anchorX={k.w > 1.3 ? 'left' : 'center'}
				anchorY="middle"
				position={[k.w > 1.3 ? -top.w / 2 + 1.2 : 0, h + 0.05, 0]}
				rotation.x={-Math.PI / 2}
			/>
		{/if}
	</T.Group>
{/each}
