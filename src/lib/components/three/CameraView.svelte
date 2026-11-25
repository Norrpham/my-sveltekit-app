<script lang="ts">
	// Moves the camera to a given angle (used by "Match the photo").
	// Lives inside the <Canvas> so it can reach the camera directly.
	import { useThrelte } from '@threlte/core';

	let {
		view,
		distance,
		onapply
	}: {
		view: { azimuth: number; elevation: number; n: number } | null;
		distance: number;
		onapply?: () => void;
	} = $props();

	const { camera, invalidate } = useThrelte();
	let lastN = 0;

	$effect(() => {
		if (!view || view.n === lastN) return;
		lastN = view.n;
		const az = (view.azimuth * Math.PI) / 180;
		const el = (Math.min(view.elevation, 89.5) * Math.PI) / 180;
		const r = distance * 0.95;
		camera.current.position.set(r * Math.cos(el) * Math.sin(az), r * Math.sin(el), r * Math.cos(el) * Math.cos(az));
		camera.current.lookAt(0, 0, 0);
		onapply?.();
		invalidate();
	});
</script>
