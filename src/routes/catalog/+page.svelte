<script lang="ts">
	import KeyboardCard from '../../lib/components/KeyboardCard.svelte';
	import KeycapCard from '../../lib/components/KeycapCard.svelte';
	import { keyboards, keycaps } from '../../lib/products';
	import type { Layout } from '../../lib/types';

	const layouts: Layout[] = ['60%', '65%', '70%', '75%'];

	// Filters. $state makes them reactive: change one and the lists update.
	let layout = $state<Layout | 'all'>('all');
	let theme = $state<'all' | 'general' | 'anime'>('all');
	let buyableOnly = $state(false);

	const notBuyable = ['sold_out'];

	// $derived recalculates whenever a filter it reads changes.
	let shownKeyboards = $derived(
		keyboards.filter(
			(k) =>
				(layout === 'all' || k.layout === layout) &&
				(!buyableOnly || !notBuyable.includes(k.availability))
		)
	);
	let shownKeycaps = $derived(
		keycaps.filter(
			(c) =>
				(layout === 'all' || c.fitsLayouts.includes(layout)) &&
				(theme === 'all' || c.theme === theme) &&
				(!buyableOnly || !notBuyable.includes(c.availability))
		)
	);
</script>

<svelte:head>
	<title>Catalog · Keyboard AI</title>
</svelte:head>

<main>
	<p><a href="/">← Home</a></p>
	<h1>Catalog</h1>
	<p class="lead">
		Every keyboard and keycap set the matcher can pick from. Colors are approximate; check the store
		for exact details.
	</p>

	<form class="filters" onsubmit={(e) => e.preventDefault()}>
		<label>
			Layout
			<select bind:value={layout}>
				<option value="all">All</option>
				{#each layouts as l (l)}<option value={l}>{l}</option>{/each}
			</select>
		</label>
		<label>
			Keycap theme
			<select bind:value={theme}>
				<option value="all">All</option>
				<option value="general">General</option>
				<option value="anime">Anime</option>
			</select>
		</label>
		<label class="check">
			<input type="checkbox" bind:checked={buyableOnly} />
			Hide sold out
		</label>
	</form>

	<section>
		<h2>Keyboards ({shownKeyboards.length})</h2>
		{#if shownKeyboards.length}
			<div class="grid">
				{#each shownKeyboards as k (k.id)}<KeyboardCard keyboard={k} />{/each}
			</div>
		{:else}
			<p>No keyboards match these filters.</p>
		{/if}
	</section>

	<section>
		<h2>Keycap sets ({shownKeycaps.length})</h2>
		{#if shownKeycaps.length}
			<div class="grid">
				{#each shownKeycaps as c (c.id)}<KeycapCard keycap={c} />{/each}
			</div>
		{:else}
			<p>No keycap sets match these filters.</p>
		{/if}
	</section>

	<p class="disclosure">
		Some links may be affiliate links: we may earn a commission if you buy, at no extra cost to you.
	</p>
</main>

<style>
	main {
		max-width: 72rem;
		margin: 2rem auto;
		padding: 0 1rem;
		font-family: system-ui, sans-serif;
	}
	.lead {
		color: #555;
	}
	.filters {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		align-items: end;
		padding: 1rem;
		background: #f7f7f7;
		border-radius: 12px;
	}
	.filters label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
	}
	.filters .check {
		flex-direction: row;
		align-items: center;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1rem;
	}
	section {
		margin-top: 2rem;
	}
	.disclosure {
		margin-top: 3rem;
		font-size: 0.8rem;
		color: #777;
	}
</style>
