<script lang="ts">
	// One keyboard. Boards with open design files get the detailed model;
	// the rest are built from their "recipe": layout + size + colors + special parts.
	// Everything here is measured in millimetres; the viewer scales it down.
	import { T } from '@threlte/core';
	import { RoundedBoxGeometry } from '@threlte/extras';
	import { Color } from 'three';
	import { buildLayout, UNIT_MM as U } from '../../layouts';
	import { boardRecipes } from '../../boards';
	import type { Keyboard, Keycap, Variant } from '../../types';
	import DetailedBoard from './DetailedBoard.svelte';
	import Keys from './Keys.svelte';
	import { metalLook } from './materials';

	let { keyboard, variant, keycap }: { keyboard: Keyboard; variant: Variant; keycap: Keycap } =
		$props();

	let recipe = $derived(keyboard.detail === 'detailed' ? boardRecipes[keyboard.id] : undefined);
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

	const keyBottom = $derived(caseH - 3);

	// Positions of the knob/screen/touch bar, from layout units.
	const cx = (x: number, w: number) => -keysW / 2 + (x + w / 2) * U;
	const cz = (y: number) => keysBack + (y + 0.5) * U;

	// The knob and other metal parts use a darker version of the case color.
	let metal = $derived('#' + new Color(variant.caseColorHex).multiplyScalar(0.75).getHexString());

	// LED matrix dots: a fixed pattern so it looks the same every time.
	const dotCols = 24;
	const dotRows = 4;
	const dotOn = (c: number, r: number) => (c * 7 + r * 13) % 5 !== 0;
</script>

{#if recipe}
	<T.Group position.y={-12}>
		<DetailedBoard {keyboard} {variant} {keycap} {recipe} />
	</T.Group>
{:else}
<T.Group rotation.x={tilt} position.y={-caseH / 2}>
	<!-- Case -->
	<T.Mesh position={[0, caseH / 2, 0]} receiveShadow>
		<RoundedBoxGeometry args={[caseL, caseH, caseD]} radius={lowProfile ? 3 : 5} />
		<T.MeshPhysicalMaterial {...metalLook(variant.caseColorHex, variant.finish)} />
	</T.Mesh>

	<!-- Keycaps -->
	<T.Group position={[0, keyBottom, (keysFront + keysBack) / 2]}>
		<Keys {layout} {keycap} />
	</T.Group>
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
{/if}
