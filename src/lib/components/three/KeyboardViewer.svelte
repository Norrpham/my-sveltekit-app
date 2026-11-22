<script lang="ts">
	// The 3D window: camera, lights, and drag-to-rotate with a slow 360° spin.
	import { Canvas, T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import KeyboardModel from './KeyboardModel.svelte';
	import type { Keyboard, Keycap, Variant } from '../../types';

	let { keyboard, variant, keycap }: { keyboard: Keyboard; variant: Variant; keycap: Keycap } =
		$props();

	let spinning = $state(true);
</script>

<div class="viewer">
	<Canvas>
		<T.PerspectiveCamera makeDefault position={[0, 3.4, 4.6]} fov={32}>
			<OrbitControls
				autoRotate={spinning}
				autoRotateSpeed={1.6}
				enableDamping
				enablePan={false}
				minDistance={2.6}
				maxDistance={8}
				maxPolarAngle={Math.PI * 0.85}
				onstart={() => (spinning = false)}
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
		<span>Drag to rotate · scroll to zoom</span>
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
