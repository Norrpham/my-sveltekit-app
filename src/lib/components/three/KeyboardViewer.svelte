<script lang="ts">
	// The 3D window: camera, lights, and drag-to-rotate with a slow 360° spin.
	import { Canvas, T } from '@threlte/core';
	import { ContactShadows, OrbitControls } from '@threlte/extras';
	import KeyboardModel from './KeyboardModel.svelte';
	import Studio from './Studio.svelte';
	import type { Keyboard, Keycap, Variant } from '../../types';

	let {
		keyboard,
		variant,
		keycap,
		zoomable = false
	}: { keyboard: Keyboard; variant: Variant; keycap: Keycap; zoomable?: boolean } = $props();

	let spinning = $state(true);

	// Fit the camera to the window: wide screens can get closer than phones.
	const FOV = 32;
	let width = $state(800);
	// Shorter window on phones, taller on desktop.
	let height = $derived(width < 600 ? 300 : 420);
	let distance = $derived.by(() => {
		const aspect = Math.max(width, 1) / height;
		const halfV = ((FOV / 2) * Math.PI) / 180;
		const halfH = Math.atan(Math.tan(halfV) * aspect);
		// A 75% board is ~3.4 units wide. Wide screens leave extra room so the board
		// stays in frame while it spins; narrow (phone) screens fit it more tightly.
		const fitWidth = aspect < 1.4 ? 3.9 : 5.6;
		return Math.max(3, fitWidth / 2 / Math.tan(halfH));
	});
	// Look from in front and a bit above.
	let camPos = $derived<[number, number, number]>([0, distance * 0.55, distance * 0.83]);
</script>

<!-- Stop the auto-spin as soon as someone grabs the model (not when they click the button). -->
<div
	class="viewer"
	style:height="{height}px"
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
				enableZoom={zoomable}
					minDistance={1.2}
					maxDistance={12}
				maxPolarAngle={Math.PI * 0.85}
			/>
		</T.PerspectiveCamera>

		<Studio />
		<T.AmbientLight intensity={0.25} />
		<T.DirectionalLight position={[3, 6, 4]} intensity={1.3} />
		<T.DirectionalLight position={[-4, 3, -3]} intensity={0.4} />

		<!-- Model is built in millimetres; 0.01 turns 300 mm into 3 scene units. -->
		<T.Group scale={0.01}>
			<KeyboardModel {keyboard} {variant} {keycap} />
		</T.Group>

		<!-- Soft shadow on the "desk". Re-drawn when the board or colors change. -->
		{#key keyboard.id + variant.name + keycap.id}
			<ContactShadows position.y={-0.125} scale={5} opacity={0.55} blur={2.4} far={1} resolution={512} frames={8} />
		{/key}
	</Canvas>

	<div class="controls">
		<button type="button" onclick={() => (spinning = !spinning)}>
			{spinning ? 'Pause spin' : 'Spin'}
		</button>
		<span>Drag to rotate{zoomable ? ', scroll to zoom' : ''}</span>
	</div>
</div>
{#if keyboard.detail === 'detailed'}
	<p class="note">
		<strong>Detailed 3D.</strong> Built from the maker's open design files. Colors are approximate.
		{#if keyboard.disclaimer}{keyboard.disclaimer}{/if}
		<a href="/credits">Credits</a>
	</p>
{:else}
	<p class="note">
		<strong>Basic preview.</strong> Built from public facts (size, layout, colors). Shape and colors are
		approximate, so check the store photos.
	</p>
{/if}

<style>
	.viewer {
		position: relative;
		width: 100%;
		border-radius: 12px;
		overflow: hidden;
		background: radial-gradient(circle at 50% 35%, #2a3658, #0d1426 75%);
	}
	.controls {
		position: absolute;
		left: 0.75rem;
		bottom: 0.75rem;
		display: flex;
		gap: 0.75rem;
		align-items: center;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.controls button {
		font: inherit;
		padding: 0.3rem 0.7rem;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--panel-2);
		color: var(--text);
		cursor: pointer;
	}
	.note {
		margin: 0.4rem 0 0;
		font-size: 0.72rem;
		color: var(--muted);
	}
	.note strong {
		color: var(--text);
	}
	.note a {
		color: var(--blue-2, #8ea2ff);
	}
</style>
