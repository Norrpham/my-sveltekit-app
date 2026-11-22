<script lang="ts">
	// The designer on its own page (the Home page has the same designer).
	import Designer from '../../lib/components/Designer.svelte';
	import { site } from '../../lib/site';
</script>

<svelte:head>
	<title>Design your keyboard · {site.name}</title>
</svelte:head>

<Designer>
	{#snippet intro()}
		<h1>Design your keyboard</h1>
		<p class="lead">
			Describe it in your own words. The AI finds real keyboards and keycaps that match, and shows
			them in 3D.
		</p>
	{/snippet}
</Designer>

<style>
	h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		margin: 0 0 0.5rem;
	}
	.lead {
		color: var(--muted);
		margin: 0 0 1.75rem;
		max-width: 40rem;
	}
</style>
