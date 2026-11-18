<script lang="ts">
	import MatchCard from '../../lib/components/MatchCard.svelte';
	import { colorFamilies } from '../../lib/colors';
	import { findMatches, type Spec } from '../../lib/matching';
	import { keyboards, keycaps } from '../../lib/products';
	import type { FeatureType, Layout } from '../../lib/types';

	// The spec fields. The AI fills them in from the user's words (askAi
	// below), and you can still change them by hand.
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

	// Phase 4: plain words → AI → spec → the form above.
	let wish = $state('I want a demon slayer keycap keyboard with the base is blue 70%');
	let asking = $state(false);
	let aiError = $state('');

	async function askAi(e: SubmitEvent) {
		e.preventDefault();
		asking = true;
		aiError = '';
		try {
			const res = await fetch('/api/spec', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: wish })
			});
			const body = await res.json();
			if (!res.ok) {
				aiError = body.error ?? 'Something went wrong.';
				return;
			}
			const s: Spec = body.spec;
			layout = s.layout ?? '';
			caseColor = s.caseColor ?? '';
			theme = s.theme ?? '';
			keycapColor = s.keycapColor ?? '';
			budget = s.budgetUsd ?? null;
			wireless = s.wireless === undefined ? 'any' : s.wireless ? 'yes' : 'no';
			knob = s.features?.includes('knob') ?? false;
			screen = s.features?.includes('screen') ?? false;
		} catch {
			aiError = "Couldn't reach the server. Check your connection.";
		} finally {
			asking = false;
		}
	}
</script>

<svelte:head>
	<title>Match tester · Keyboard AI</title>
</svelte:head>

<main>
	<p><a href="/">← Home</a> · <a href="/catalog">Catalog</a></p>
	<h1>Match tester</h1>
	<p class="lead">
		Describe a keyboard in your own words and let the AI fill in the fields, or set them by hand.
		Blank fields mean "don't care". The matcher then picks real keyboard + keycap combos.
	</p>

	<form class="wish" onsubmit={askAi}>
		<label for="wish">Describe your dream keyboard</label>
		<textarea id="wish" bind:value={wish} rows="2" maxlength="500"></textarea>
		<div class="wish-row">
			<button type="submit" disabled={asking || !wish.trim()}>
				{asking ? 'Thinking…' : 'Ask AI'}
			</button>
			<span class="hint">The AI fills in the fields below. You can still change them.</span>
		</div>
		{#if aiError}<p class="error" role="alert">{aiError}</p>{/if}
	</form>

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
	.wish {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	.wish label {
		font-weight: 600;
	}
	.wish textarea {
		font: inherit;
		padding: 0.6rem;
		border-radius: 8px;
		border: 1px solid #ccc;
	}
	.wish-row {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
	}
	.wish button {
		font: inherit;
		padding: 0.5rem 1.1rem;
		border-radius: 8px;
		border: none;
		background: #222;
		color: #fff;
		cursor: pointer;
	}
	.wish button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.hint {
		font-size: 0.85rem;
		color: #666;
	}
	.error {
		margin: 0;
		color: #9b1c1c;
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
