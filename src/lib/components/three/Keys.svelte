<script lang="ts">
	// All the keycaps of one board. The parent puts this group where the keys
	// sit; y = 0 is the bottom of the keycaps, and the key block is centred.
	import { T } from '@threlte/core';
	import { Text } from '@threlte/extras';
	import { Color } from 'three';
	import { UNIT_MM as U, type BuiltLayout, type Key } from '../../layouts';
	import { legendFor } from '../../legends';
	import type { KeyGroup, Keycap } from '../../types';
	import { keycapGeometry, profileOf, sculptRow, topSize } from './keycaps';
	import { keycapLook } from './surfaces';
	import { patternTexture } from './textures';

	let {
		layout,
		keycap,
		plateColor = '#1a1a1a',
		lit = false,
		ledColor = null
	}: {
		layout: BuiltLayout;
		keycap: Keycap;
		plateColor?: string;
		/** Board lights switched on. */
		lit?: boolean;
		/** LED color; 'rgb' makes a rainbow across the board; null = no LEDs. */
		ledColor?: string | null;
	} = $props();

	let profile = $derived(profileOf(keycap.profile, keycap.lowProfile));
	let look = $derived(keycapLook(keycap));
	let keysW = $derived(layout.widthU * U);
	let keysD = $derived(layout.depthU * U);
	let rowOrder = $derived([...new Set(layout.keys.map((k) => k.y))].sort((a, b) => a - b));

	const cx = (k: Key) => -keysW / 2 + (k.x + k.w / 2) * U;
	const cz = (k: Key) => -keysD / 2 + (k.y + 0.5) * U;
	const deg = (d: number) => (d * Math.PI) / 180;

	// ---- Colors ----
	const NAV = new Set(['Del', 'Ins', 'Home', 'End', 'PgUp', 'PgDn', 'PrtSc']);
	const ARROWS = new Set(['←', '↑', '↓', '→']);
	const NUMBERS = new Set('` 1 2 3 4 5 6 7 8 9 0 - ='.split(' '));
	const MODS = new Set(['Tab', 'Caps', 'Shift', 'Ctrl', 'Win', 'Alt', 'Fn', 'Menu', 'Back']);

	function groupOf(k: Key): KeyGroup {
		if (k.label === 'Esc') return 'esc';
		if (k.label === 'Enter') return 'enter';
		if (k.kind === 'space') return 'space';
		if (ARROWS.has(k.label)) return 'arrow';
		if (NAV.has(k.label)) return 'nav';
		if (/^F\d+$/.test(k.label)) return 'frow';
		if (NUMBERS.has(k.label)) return 'number';
		if (MODS.has(k.label)) return 'mod';
		return 'alpha';
	}

	// Mix two hex colors the way they look on screen (sRGB), not in linear light.
	function mixHex(a: string, b: string, t: number): string {
		const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
		const [x, y] = [p(a), p(b)];
		return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
	}

	function capColor(k: Key): string {
		const own = keycap.keyColors?.[k.label];
		if (own) return own;
		const novelty = keycap.noveltyKeys.find((n) => n.key === k.label);
		if (novelty) return novelty.color;
		const g = groupOf(k);
		const map = keycap.colorMap ?? {};
		if (map[g]) return map[g]!;
		// Fallbacks when a set only has base / legend / accent colors.
		const modColor = map.mod ?? mixHex(keycap.colors.base, keycap.colors.legend, 0.06);
		if (g === 'esc' || g === 'enter') return keycap.colors.accent;
		if (g === 'number' || g === 'space') return map.alpha ?? keycap.colors.base;
		if (g === 'mod' || g === 'frow' || g === 'nav' || g === 'arrow') return modColor;
		return keycap.colors.base;
	}

	function brightness(hex: string) {
		const c = new Color(hex);
		return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
	}

	function legendColor(bg: string): string {
		if (keycap.legends?.color) return keycap.legends.color;
		const { legend, base } = keycap.colors;
		const gap = (c: string) => Math.abs(brightness(c) - brightness(bg));
		return gap(legend) >= gap(base) ? legend : base;
	}

	// ---- Theme keys: where the real set has character art ----
	const THEME_KEYS = new Set(['Esc', 'Enter', 'Back']);
	let artKeys = $derived(new Set(keycap.artKeys ?? []));
	function isThemeKey(k: Key) {
		if (!keycap.pattern) return false;
		if (keycap.artKeys) return artKeys.has(k.kind === 'space' ? 'space' : k.label);
		return THEME_KEYS.has(k.label) || k.kind === 'space' || keycap.noveltyKeys.some((n) => n.key === k.label);
	}
	// One ✦ mark on the spacebar (and Esc for sets without an art map).
	function markKey(k: Key) {
		return !!keycap.pattern && (k.kind === 'space' || (!keycap.artKeys && k.label === 'Esc'));
	}
	let patternColors = $derived<[string, string]>(
		keycap.patternColors ?? [keycap.colors.base, keycap.colors.accent]
	);

	// ---- Lights ----
	function ledAt(k: Key): string {
		if (ledColor !== 'rgb') return ledColor ?? '#ffffff';
		const c = new Color().setHSL((k.x / layout.widthU) * 0.85, 0.9, 0.55);
		return '#' + c.getHexString();
	}
	let shine = $derived(!!keycap.legends?.shine);

	// ---- Legends ----
	let front = $derived(keycap.legends?.position === 'front');
	const size = (s: string, w: number) =>
		s.length <= 1 ? 3.4 : s.length <= 3 ? 2.5 : w >= 1.5 ? 2.1 : 1.7;
</script>

<!-- Plate seen between the keys -->
<T.Mesh position={[0, -0.6, 0]} rotation.x={-Math.PI / 2}>
	<T.PlaneGeometry args={[keysW + 1, keysD + 1]} />
	<T.MeshStandardMaterial color={plateColor} roughness={0.8} metalness={0.2} />
</T.Mesh>

{#each layout.keys as k (k.label + k.x + '-' + k.y)}
	{@const row = sculptRow(rowOrder.indexOf(k.y), rowOrder.length)}
	{@const h = profile.heights[row]}
	{@const color = capColor(k)}
	{@const top = topSize(k.w, 1, profile)}
	{@const lg = legendFor(k.label, keycap.legends)}
	{@const ink = lit && shine && ledColor ? ledAt(k) : legendColor(color)}
	{@const theme = isThemeKey(k)}

	<!-- LED glow on the plate, seen through the gaps around the key -->
	{#if lit && ledColor}
		<T.Mesh position={[cx(k), -0.5, cz(k)]} rotation.x={-Math.PI / 2}>
			<T.PlaneGeometry args={[k.w * U + 0.6, U + 0.6]} />
			<T.MeshBasicMaterial color={ledAt(k)} transparent opacity={0.85} toneMapped={false} />
		</T.Mesh>
	{/if}

	<T.Group position={[cx(k), 0, cz(k)]} rotation.x={deg(profile.tilts[row])}>
		<T.Mesh geometry={keycapGeometry(k.w, 1, h, profile)} castShadow>
			<T.MeshStandardMaterial
				{color}
				{...look}
				emissive={lit && ledColor ? ledAt(k) : '#000000'}
				emissiveIntensity={lit && ledColor ? 0.06 : 0}
			/>
		</T.Mesh>

		{#if theme}
			{@const tex = patternTexture(keycap.pattern!, patternColors[0], patternColors[1], Math.max(1, Math.round(k.w)))}
			<T.Mesh position={[0, h + 0.06, 0]} rotation.x={-Math.PI / 2}>
				<T.PlaneGeometry args={[top.w, top.d]} />
				<T.MeshStandardMaterial map={tex} roughness={0.8} polygonOffset polygonOffsetFactor={-2} />
			</T.Mesh>
		{/if}

		{#if markKey(k)}
			<!-- "Character art goes here on the real set" -->
			<T.Mesh position={[top.w / 2 - 2.4, h + 0.12, -top.d / 2 + 2.4]} rotation.x={-Math.PI / 2}>
				<T.CircleGeometry args={[1.7, 24]} />
				<T.MeshBasicMaterial color="#ffffff" />
			</T.Mesh>
			<Text
				text="✦"
				fontSize={2.4}
				color={keycap.colors.accent}
				anchorX="center"
				anchorY="middle"
				position={[top.w / 2 - 2.4, h + 0.18, -top.d / 2 + 2.4]}
				rotation.x={-Math.PI / 2}
			/>
		{/if}

		{#if lg.main && k.kind !== 'space' && !(theme && !front)}
			{#if front}
				<!-- Side-printed legend on the front face (it leans back with the taper) -->
				<Text
					text={lg.shift ? `${lg.shift} ${lg.main}` : lg.main}
					fontSize={size(lg.main, k.w) * 0.62}
					color={ink}
					outlineWidth={lit && shine ? '18%' : 0}
					outlineBlur={lit && shine ? '60%' : 0}
					outlineColor={ink}
					outlineOpacity={0.45}
					anchorX="center"
					anchorY="middle"
					position={[0, h * 0.42, (U - 1.8) / 2 - profile.topInset * 0.42 + 0.08]}
					rotation.x={-Math.atan2(profile.topInset, h)}
				/>
			{:else}
				{@const x0 = -top.w / 2 + 1.3}
				{#if lg.shift}
					<Text text={lg.shift} fontSize={2.4} color={ink} anchorX="left" anchorY="middle"
						position={[x0, h + 0.05, -top.d / 4]} rotation.x={-Math.PI / 2} />
					<Text text={lg.main} fontSize={2.6} color={ink} anchorX="left" anchorY="middle"
						position={[x0, h + 0.05, top.d / 4]} rotation.x={-Math.PI / 2} />
				{:else}
					<Text text={lg.main} fontSize={size(lg.main, k.w)} color={ink} anchorX="left" anchorY="middle"
						position={[x0, h + 0.05, -top.d / 4]} rotation.x={-Math.PI / 2} />
				{/if}
				{#if lg.kana}
					<Text text={lg.kana} fontSize={2.3} color={ink} anchorX="right" anchorY="middle"
						position={[top.w / 2 - 1.2, h + 0.05, top.d / 4]} rotation.x={-Math.PI / 2} />
				{/if}
			{/if}
		{/if}
	</T.Group>
{/each}
