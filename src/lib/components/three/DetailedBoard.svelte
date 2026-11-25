<script lang="ts">
	// A board built from its maker's open files (see src/lib/boards.ts).
	// Everything is in millimetres, with the desk at y = 0 and the front at +z.
	import { T } from '@threlte/core';
	import { onMount } from 'svelte';
	import type { BufferGeometry } from 'three';
	import { buildLayout, UNIT_MM as U } from '../../layouts';
	import type { BoardRecipe } from '../../boards';
	import type { Keyboard, Keycap, Variant } from '../../types';
	import Keys from './Keys.svelte';
	import { offset, sliceGeometry, slope, type ProfileFn } from './caseShapes';
	import { metalLook, polishedLook, woodLook } from './materials';

	let {
		keyboard,
		variant,
		keycap,
		recipe
	}: { keyboard: Keyboard; variant: Variant; keycap: Keycap; recipe: BoardRecipe } = $props();

	let layout = $derived(buildLayout(keyboard.layout, keyboard.features, keyboard.id));
	let keysD = $derived(layout.depthU * U);
	let parts = $derived(variant.parts ?? { top: variant.caseColorHex });
	const r = $derived(recipe);

	// ---- Sonnet and Encore: drawn from their side profile ----
	// Top surface: a straight slope from the front height to the back height.
	let top = $derived<ProfileFn>(
		r.caseKind === 'encore'
			? (z) => {
					// Encore: 12.5 mm at the front edge, rising along a chamfer to 19.7 mm.
					const chamfer = 7;
					const line = slope(r.depth, 19.7, r.backHeight)(Math.min(z, r.depth / 2 - chamfer));
					if (z <= r.depth / 2 - chamfer) return line;
					const t = (z - (r.depth / 2 - chamfer)) / chamfer;
					return line + (12.5 - line) * t;
				}
			: slope(r.depth, r.frontHeight, r.backHeight)
	);
	// Sonnet: the underside curves up toward the front (its "sculpted" side profile).
	let floor = $derived<ProfileFn>(
		r.caseKind === 'sonnet'
			? (z) => {
					const start = r.depth / 2 - 42;
					if (z < start) return 0;
					const t = (z - start) / 42;
					return r.frontHeight * 0.5 * t * t;
				}
			: () => 0
	);

	// Where the keys sit: the front edge of the keys is `frontBezel` from the case front.
	let keysCenterZ = $derived(r.depth / 2 - r.frontBezel - keysD / 2);
	// Angle of the top surface where the keys are.
	let slopeAngle = $derived(Math.atan2(top(keysCenterZ - 5) - top(keysCenterZ + 5), 10));
	let keysY = $derived(r.caseKind === 'glb' ? 0 : top(keysCenterZ) + r.keysAboveRim);

	let pieces = $derived.by(() => {
		if (r.caseKind === 'sonnet') {
			// Top case (8 mm thick along the top) over a bottom case in its own color.
			const topCase = offset(top, 8, floor);
			return [
				{ geo: sliceGeometry(r.depth, r.width, top, topCase, 1.2), look: metalLook(parts.top, variant.finish) },
				{ geo: sliceGeometry(r.depth - 1.6, r.width - 1.6, topCase, floor, 0.8), look: metalLook(parts.bottom ?? parts.top, variant.finish) }
			];
		}
		if (r.caseKind === 'encore') {
			// Wood top (7 mm), a thin aluminum middle band (3 mm), then the aluminum bottom.
			const woodBottom = offset(top, 7);
			const middleBottom = offset(top, 10);
			return [
				{ geo: sliceGeometry(r.depth, r.width, top, woodBottom, 1.4), look: parts.topMaterial === 'wood' ? woodLook(parts.top) : metalLook(parts.top) },
				{ geo: sliceGeometry(r.depth - 1, r.width - 1, woodBottom, middleBottom, 0.6), look: metalLook(parts.middle ?? parts.top) },
				{ geo: sliceGeometry(r.depth - 2, r.width - 2, middleBottom, floor, 0.8), look: metalLook(parts.bottom ?? parts.top) }
			];
		}
		return [];
	});

	// ---- Bakeneko65: the real 3D case file ----
	let glbGeo = $state<BufferGeometry | null>(null);
	let glbLift = $state(0);
	onMount(async () => {
		if (r.caseKind !== 'glb' || !r.glbUrl) return;
		const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
		const gltf = await new GLTFLoader().loadAsync(r.glbUrl);
		let geo: BufferGeometry | null = null;
		gltf.scene.traverse((o) => {
			if (!geo && 'geometry' in o) geo = (o as unknown as { geometry: BufferGeometry }).geometry;
		});
		if (!geo) return;
		// The file is drawn with a flat top; tilt it to its typing angle and set it on the desk.
		const a = ((r.glbTiltDeg ?? 0) * Math.PI) / 180;
		const pos = (geo as BufferGeometry).attributes.position;
		let min = Infinity;
		for (let i = 0; i < pos.count; i++) min = Math.min(min, pos.getY(i) * Math.cos(a) - pos.getZ(i) * Math.sin(a));
		glbLift = -min;
		glbGeo = geo;
	});
	let tilt = $derived(((r.glbTiltDeg ?? 0) * Math.PI) / 180);

	// Sonnet accent bar: a strip across the back of the top case.
	let accentZ = $derived(-r.depth / 2 + 6);
</script>

{#if r.caseKind === 'glb'}
	<T.Group position.y={glbLift} rotation.x={tilt}>
		{#if glbGeo}
			<T.Mesh geometry={glbGeo} receiveShadow>
				<T.MeshPhysicalMaterial {...metalLook(parts.top, variant.finish)} />
			</T.Mesh>
		{/if}
		<T.Group position={[0, r.keysAboveRim, keysCenterZ]}>
			<Keys {layout} {keycap} plateColor={r.plateColor} />
		</T.Group>
	</T.Group>
{:else}
	{#each pieces as p, i (i)}
		<T.Mesh geometry={p.geo} receiveShadow>
			<T.MeshPhysicalMaterial {...p.look} />
		</T.Mesh>
	{/each}

	{#if r.caseKind === 'sonnet' && parts.accent}
		<T.Mesh position={[0, top(accentZ) - 0.6, accentZ]} rotation.x={slopeAngle}>
			<T.BoxGeometry args={[r.width - 60, 1.6, 3.2]} />
			<T.MeshPhysicalMaterial {...polishedLook(parts.accent)} />
		</T.Mesh>
	{/if}

	{#if r.caseKind === 'encore'}
		<!-- The split in the wood top, by the arrow keys -->
		{@const seamX = -(layout.widthU * U) / 2 + 13 * U - 1}
		{#each [r.depth / 2 - 3, -r.depth / 2 + 6] as z (z)}
			<T.Mesh position={[seamX, top(z) + 0.05, z]} rotation.x={slopeAngle}>
				<T.BoxGeometry args={[0.8, 0.4, z > 0 ? 9 : 14]} />
				<T.MeshBasicMaterial color="#1b130c" />
			</T.Mesh>
		{/each}
	{/if}

	<T.Group position={[0, keysY, keysCenterZ]} rotation.x={slopeAngle}>
		<Keys {layout} {keycap} plateColor={r.plateColor} />
	</T.Group>
{/if}
