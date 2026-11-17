<script lang="ts">
	import MatchCard from '../../lib/components/MatchCard.svelte';
	import { colorFamilies } from '../../lib/colors';
	import { findMatches, type Spec } from '../../lib/matching';
	import { keyboards, keycaps } from '../../lib/products';
	import type { FeatureType, Layout } from '../../lib/types';

	// Phase 3: you fill in the spec by hand. In Phase 4 the AI fills it in
	// from the user's words, and this same matcher does the rest.
	let layout = $state<Layout | ''>('70%');
	let caseColor = $state('blue');
	let theme = $state('demon slayer');
	let keycapColor = $state('');
	let budget = $state<number | null>(null);
	let wireless = $state<'any' | 'yes' | 'no'>('any');
	let knob = $state(false);
	let screen = $state(false);

	let spec = $derived<Spec>({
		layout: layout || undefined,
		caseColor: caseColor || undefined,
		theme: theme.trim() || undefined,
		keycapColor: keycapColor || undefined,
		budgetUsd: budget ?? undefined,
		wireless: wireless === 'any' ? undefined : wireless === 'yes',
		features: [...(knob ? ['knob' as FeatureType] : []), ...(screen ? ['screen' as FeatureType] : [])]
	});

	// Re-runs automatically whenever any field above changes.
	let results = $derived(findMatches(spec, keyboards, keycaps));
</script>

<svelte:head>
	<title>Match tester · Keyboard AI</title>
</svelte:head>

<main>
	<p><a href="/">← Home</a> · <a href="/catalog">Catalog</a></p>
	<h1>Match tester</h1>
	<p class="lead">
		Fill in what someone wants and see which real keyboard + keycap combo the matcher picks. Blank
		fields mean "don't care". Later, the AI will fill these in from plain words.
	</p>

	<form class="spec" onsubmit={(e) => e.preventDefault()}>
		<label>
			Layout
			<select bind:value={layout}>
				<option value="">Any</option>
				<option>60%</option>
				<option>65%</option>
				<option>70%</option>
				<option>75%</option>
			</select>
		</label>
		<label>
			Case color
			<select bind:value={caseColor}>
				<option value="">Any</option>
				{#each colorFamilies as c (c)}<option>{c}</option>{/each}
			</select>
		</label>
		<label>
			Keycap theme
			<input bind:value={theme} placeholder="e.g. demon slayer, anime" />
		</label>
		<label>
			Keycap color
			<select bind:value={keycapColor}>
				<option value="">Any</option>
				{#each colorFamilies as c (c)}<option>{c}</option>{/each}
			</select>
		</label>
		<label>
			Budget (USD, total)
			<input type="number" min="0" step="10" bind:value={budget} placeholder="No limit" />
		</label>
		<label>
			Wireless
			<select bind:value={wireless}>
				<option value="any">Don't care</option>
				<option value="yes">Yes</option>
				<option value="no">No</option>
			</select>
		</label>
		<label class="check"><input type="checkbox" bind:checked={knob} /> Must have a knob</label>
		<label class="check"><input type="checkbox" bind:checked={screen} /> Must have a screen</label>
	</form>

	<details>
		<summary>Spec sent to the matcher</summary>
		<pre>{JSON.stringify(spec, null, 2)}</pre>
	</details>

	<section class="results">
		{#each results as match, i (match.keyboard.id + match.keycap.id)}
			<MatchCard {match} rank={i + 1} />
		{:else}
			<p>No combos found.</p>
		{/each}
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
	.spec {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
		padding: 1rem;
		background: #f7f7f7;
		border-radius: 12px;
	}
	.spec label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
	}
	.spec .check {
		flex-direction: row;
		align-items: center;
	}
	details {
		margin: 1rem 0;
		font-size: 0.85rem;
	}
	pre {
		background: #f3f3f3;
		padding: 0.75rem;
		border-radius: 8px;
		overflow-x: auto;
	}
	.results {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}
	.disclosure {
		margin-top: 3rem;
		font-size: 0.8rem;
		color: #777;
	}
</style>
