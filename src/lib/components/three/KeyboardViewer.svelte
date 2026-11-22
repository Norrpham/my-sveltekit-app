<script lang="ts">
	// The 3D window: camera, lights, and drag-to-rotate with a slow 360° spin.
	import { Canvas, T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import KeyboardModel from './KeyboardModel.svelte';
	import type { Keyboard, Keycap, Variant } from '../../types';

	let { keyboard, variant, keycap }: { keyboard: Keyboard; variant: Variant; keycap: Keycap } =
		$props();

	let spinning = $state(true);

	// Fit the camera to the window: wide screens can get closer than phones.
	const FOV = 32;
	const HEIGHT = 380;
	let width = $state(800);
	let distance = $derived.by(() => {
		const aspect = Math.max(width, 1) / HEIGHT;
		const halfV = ((FOV / 2) * Math.PI) / 180;
		const halfH = Math.atan(Math.tan(halfV) * aspect);
		const fitWidth = 5.4; // a 75% board is ~3.4 units wide; extra room so corners stay in view while it spins
		return Math.max(3, fitWidth / 2 / Math.tan(halfH));
	});
	// Look from in front and a bit above.
	let camPos = $derived<[number, number, number]>([0, distance * 0.55, distance * 0.83]);
</script>

<!-- Stop the auto-spin as soon as someone grabs the model (not when they click the button). -->
<div
	class="viewer"
	role="presentation"
	bind:clientWidth={width}
	onpointerdown={(e) => {
		if (!(e.target as HTMLElement).closest('button')) spinning = false;
	}}
>
	<Canvas>
		<T.PerspectiveCamera makeDefault position={camPos} fov={FOV}>
			<OrbitControls
				autoRotate={spinning}
				autoRotateSpeed={1.6}
				enableDamping
				enablePan={false}
				enableZoom={false}
				maxPolarAngle={Math.PI * 0.85}
			/>
		</T.PerspectiveCamera>

		<T.AmbientLight intensity={0.9} />
		<T.DirectionalLight position={[3, 6, 4]} intensity={2} />
		<T.DirectionalLight position={[-4, 3, -3]} intensity={0.7} />

		<!-- Model is built in millimetres; 0.01 turns 300 mm into 3 scene units. -->
		<T.Group scale={0.01}>
			<KeyboardModel {keyboard} {variant} {keycap} />
		</T.Group>
	</Canvas>

	<div class="controls">
		<button type="button" onclick={() => (spinning = !spinning)}>
			{spinning ? 'Pause spin' : 'Spin'}
		</button>
		<span>Drag to rotate</span>
	</div>
	<p class="note">Preview only: shape, size and colors are approximate. Check the store photos.</p>
</div>

<style>
	.viewer {
		position: relative;
		width: 100%;
		height: 380px;
		border-radius: 12px;
		overflow: hidden;
		background: radial-gradient(circle at 50% 40%, #fafafa, #e6e6e6);
	}
	.controls {
		position: absolute;
		left: 0.75rem;
		bottom: 2rem;
		display: flex;
		gap: 0.75rem;
		align-items: center;
		font-size: 0.8rem;
		color: #555;
	}
	.controls button {
		font: inherit;
		padding: 0.3rem 0.7rem;
		border-radius: 6px;
		border: 1px solid #ccc;
		background: #fff;
		cursor: pointer;
	}
	.note {
		position: absolute;
		left: 0.75rem;
		bottom: 0.4rem;
		margin: 0;
		font-size: 0.72rem;
		color: #777;
	}
</style>
