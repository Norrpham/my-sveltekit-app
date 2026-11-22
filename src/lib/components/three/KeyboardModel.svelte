<script lang="ts">
	// One keyboard built from its "recipe": layout + size + colors + special parts.
	// Everything here is measured in millimetres; the viewer scales it down.
	import { T } from '@threlte/core';
	import { RoundedBoxGeometry, Text } from '@threlte/extras';
	import { Color } from 'three';
	import { buildLayout, UNIT_MM as U, type Key } from '../../layouts';
	import type { Keyboard, Keycap, Variant } from '../../types';

	let { keyboard, variant, keycap }: { keyboard: Keyboard; variant: Variant; keycap: Keycap } =
		$props();

	let layout = $derived(buildLayout(keyboard.layout, keyboard.features));
	let lowProfile = $derived(keyboard.caseShape === 'low-profile');

	// Case size: the real measurements, but never smaller than the keys need.
	let keysW = $derived(layout.widthU * U);
	let keysD = $derived(layout.depthU * U);
	let caseL = $derived(Math.max(keyboard.dimensionsMm.length, keysW + 14));
	let caseD = $derived(Math.max(keyboard.dimensionsMm.width, keysD + 14));
	let caseH = $derived(
		lowProfile ? 9 : Math.min(22, Math.max(10, keyboard.dimensionsMm.height * 0.55))
	);
	let tilt = $derived(
		keyboard.caseShape === 'tall-wedge' ? 0.12 : lowProfile ? 0.03 : 0.07
	);

	// Keys sit against the front, with any extra case space at the back
	// (that's where the Cyberboard's LED panel goes).
	let frontMargin = $derived(Math.min((caseL - keysW) / 2, 14));
	let keysFront = $derived(caseD / 2 - frontMargin);
	let keysBack = $derived(keysFront - keysD);
	let backSpace = $derived(keysBack + caseD / 2);

	const capH = $derived(lowProfile ? 4 : 8);
	const keyBottom = $derived(caseH - 3);

	// Key positions in mm, from layout units.
	const cx = (x: number, w: number) => -keysW / 2 + (x + w / 2) * U;
	const cz = (y: number) => keysBack + (y + 0.5) * U;

	function brightness(hex: string) {
		const c = new Color(hex);
		return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
	}

	function capColor(k: Key): string {
		const novelty = keycap.noveltyKeys.find((n) => n.key === k.label);
		if (novelty) return novelty.color;
		if (k.kind === 'accent') return keycap.colors.accent;
		if (k.kind === 'mod') {
			// Modifiers: the base color, nudged a little toward the legend color.
			return '#' + new Color(keycap.colors.base).lerp(new Color(keycap.colors.legend), 0.12).getHexString();
		}
		return keycap.colors.base;
	}

	// Pick legend or base color, whichever stands out more on this key.
	function legendOn(bg: string): string {
		const { legend, base } = keycap.colors;
		const gap = (c: string) => Math.abs(brightness(c) - brightness(bg));
		return gap(legend) >= gap(base) ? legend : base;
	}

	// The knob and other metal parts use a darker version of the case color.
	let metal = $derived('#' + new Color(variant.caseColorHex).multiplyScalar(0.75).getHexString());

	// LED matrix dots: a fixed pattern so it looks the same every time.
	const dotCols = 24;
	const dotRows = 4;
	const dotOn = (c: number, r: number) => (c * 7 + r * 13) % 5 !== 0;
</script>

<T.Group rotation.x={tilt} position.y={-caseH / 2}>
	<!-- Case -->
	<T.Mesh position={[0, caseH / 2, 0]}>
		<RoundedBoxGeometry args={[caseL, caseH, caseD]} radius={lowProfile ? 3 : 5} />
		<T.MeshStandardMaterial color={variant.caseColorHex} roughness={0.45} metalness={0.25} />
	</T.Mesh>

	<!-- Dark plate under the keys -->
	<T.Mesh position={[0, caseH + 0.05, (keysFront + keysBack) / 2]} rotation.x={-Math.PI / 2}>
		<T.PlaneGeometry args={[keysW + 2, keysD + 2]} />
		<T.MeshStandardMaterial color="#1a1a1a" roughness={0.9} />
	</T.Mesh>

	<!-- Keycaps -->
	{#each layout.keys as k (k.label + k.x + '-' + k.y)}
		{@const color = capColor(k)}
		<T.Mesh position={[cx(k.x, k.w), keyBottom + capH / 2, cz(k.y)]}>
			<RoundedBoxGeometry args={[k.w * U - 1.6, capH, U - 1.6]} radius={1.6} smoothness={2} />
			<T.MeshStandardMaterial {color} roughness={0.6} />
		</T.Mesh>
		{#if k.label && k.kind !== 'space'}
			<Text
				text={k.label}
				fontSize={k.label.length > 2 ? 2.6 : 3.6}
				color={legendOn(color)}
				anchorX="center"
				anchorY="middle"
				position={[cx(k.x, k.w), keyBottom + capH + 0.05, cz(k.y)]}
				rotation.x={-Math.PI / 2}
			/>
		{/if}
	{/each}

	<!-- Special parts -->
	{#each layout.spots as s (s.type)}
		{#if s.type === 'knob'}
			<T.Mesh position={[cx(s.x, s.w), caseH + 7, cz(s.y)]}>
				<T.CylinderGeometry args={[8, 8.5, 14, 40]} />
				<T.MeshStandardMaterial color={metal} roughness={0.3} metalness={0.8} />
			</T.Mesh>
		{:else if s.type === 'screen'}
			<T.Mesh position={[cx(s.x, s.w), caseH + 1, cz(s.y)]}>
				<T.BoxGeometry args={[s.w * U - 4, 2, U - 4]} />
				<T.MeshStandardMaterial color="#0b1a2a" emissive="#3fb7ff" emissiveIntensity={0.6} />
			</T.Mesh>
		{:else if s.type === 'touchbar'}
			<T.Mesh position={[cx(s.x, s.w), caseH + 1.5, cz(s.y)]}>
				<RoundedBoxGeometry args={[s.w * U - 4, 3, 9]} radius={1.4} />
				<T.MeshStandardMaterial color="#222" emissive="#ffffff" emissiveIntensity={0.35} />
			</T.Mesh>
		{/if}
	{/each}

	{#each keyboard.features as f (f.type)}
		{#if f.type === 'led-strip'}
			{#each [-1, 1] as side (side)}
				<T.Mesh position={[(side * caseL) / 2, caseH / 2, 0]}>
					<T.BoxGeometry args={[0.8, 3, caseD - 16]} />
					<T.MeshStandardMaterial color="#fff" emissive={keycap.colors.accent} emissiveIntensity={1.2} />
				</T.Mesh>
			{/each}
		{:else if f.type === 'led-matrix' && backSpace > 20}
			{@const areaW = keysW}
			{@const areaD = backSpace - 12}
			{#each Array.from({ length: dotCols }, (_, c) => c) as c (c)}
				{#each Array.from({ length: dotRows }, (_, r) => r) as r (r)}
					<T.Mesh
						position={[
							-areaW / 2 + ((c + 0.5) * areaW) / dotCols,
							caseH + 0.4,
							-caseD / 2 + 6 + ((r + 0.5) * areaD) / dotRows
						]}
					>
						<T.BoxGeometry args={[areaW / dotCols - 2.5, 0.8, areaD / dotRows - 2.5]} />
						<T.MeshStandardMaterial
							color="#111"
							emissive={dotOn(c, r) ? keycap.colors.accent : '#000'}
							emissiveIntensity={dotOn(c, r) ? 1 : 0}
						/>
					</T.Mesh>
				{/each}
			{/each}
		{/if}
	{/each}
</T.Group>
