<script lang="ts">
	// Soft "photo studio" reflections so metal and plastic look real.
	// Built in code (three's RoomEnvironment), so there is no image file to download.
	import { useThrelte } from '@threlte/core';
	import { onDestroy } from 'svelte';
	import { PMREMGenerator } from 'three';
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

	const { renderer, scene } = useThrelte();
	const pmrem = new PMREMGenerator(renderer);
	const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	scene.environment = env;
	scene.environmentIntensity = 0.75;

	onDestroy(() => {
		scene.environment = null;
		env.dispose();
		pmrem.dispose();
	});
</script>
