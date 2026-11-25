<script lang="ts">
	// The AI keyboard designer: describe → AI fills the spec → matcher picks
	// real products → 3D preview. Used on the Home page and on /match.
	import { onMount, type Component, type Snippet } from 'svelte';
	import MatchCard from './MatchCard.svelte';
	import SourceGallery from './SourceGallery.svelte';
	import { buyLink } from '../products';
	import { colorFamilies } from '../colors';
	import { findMatches, type Spec } from '../matching';
	import { keyboards, keycaps } from '../products';
	import type { FeatureType, Layout } from '../types';

	let {
		intro,
		between,
		heroBg = 'transparent'
	}: { intro?: Snippet; between?: Snippet; heroBg?: string } = $props();

	// The spec fields. The AI fills them in; the user can still change them.
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

	let results = $derived(findMatches(spec, keyboards, keycaps));

	// Which result is shown in 3D. Falls back to the best match when results change.
	const idOf = (m: (typeof results)[number]) => m.keyboard.id + '+' + m.keycap.id;
	let previewId = $state('');
	let previewed = $derived(results.find((m) => idOf(m) === previewId) ?? results[0]);

	// The 3D viewer (three.js) is big, so load it only in the browser, after the page shows.
	let Viewer = $state<Component<any> | null>(null);
	let viewerFailed = $state(false);
	onMount(async () => {
		try {
			Viewer = (await import('./three/KeyboardViewer.svelte')).default;
		} catch {
			viewerFailed = true;
		}
	});

	const examples = [
		'Demon Slayer keycaps on a blue 70% board',
		'Pink wireless 65% with anime keycaps, under $150',
		'White 75% with a knob and a screen'
	];

	let wish = $state('');
	let asking = $state(false);
	let aiError = $state('');
	let resultsEl: HTMLElement | undefined = $state();

	async function askAi(e?: SubmitEvent) {
		e?.preventDefault();
		if (!wish.trim()) return;
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
			previewId = '';
			resultsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} catch {
			aiError = "Couldn't reach the server. Check your connection.";
		} finally {
			asking = false;
		}
	}
</script>

<section class="hero" id="design" style:background={heroBg}>
	<div class="wrap">
		{@render intro?.()}

		<form class="wish" onsubmit={askAi}>
			<label for="wish">Describe your dream keyboard</label>
			<div class="wish-box">
				<textarea
					id="wish"
					bind:value={wish}
					rows="2"
					maxlength="500"
					placeholder="e.g. I want Demon Slayer keycaps on a blue 70% keyboard"
					onkeydown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							askAi();
						}
					}}
				></textarea>
				<button class="btn" type="submit" disabled={asking || !wish.trim()}>
					{asking ? 'Thinking…' : 'Design it'}
				</button>
			</div>
			<div class="examples">
				<span>Try:</span>
				{#each examples as ex (ex)}
					<button type="button" class="chip" onclick={() => (wish = ex)}>{ex}</button>
				{/each}
			</div>
			{#if aiError}<p class="error" role="alert">{aiError}</p>{/if}
		</form>
	</div>
</section>

{@render between?.()}

<section class="results-area" bind:this={resultsEl}>
	<div class="wrap">
		<details class="fine-tune">
			<summary>Fine-tune the search</summary>
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
		</details>

		{#if previewed}
			<div class="preview3d" aria-label="3D preview">
				{#if Viewer}
					<Viewer keyboard={previewed.keyboard} variant={previewed.variant} keycap={previewed.keycap} />
				{:else}
					<div class="placeholder">
						{viewerFailed ? "The 3D preview couldn't load on this device." : 'Loading 3D preview…'}
					</div>
				{/if}
				<p class="caption">
					{previewed.keyboard.name} ({previewed.variant.name}) with {previewed.keycap.name} keycaps
				</p>
				{#if previewed.keycap.pattern}
					<p class="art-note">
						✦ Character keys: the real set has character art on these keys. We show the set's colors
						and a traditional Japanese pattern instead, because we don't have permission to copy the
						art.
						<a href={buyLink(previewed.keycap)} target="_blank" rel="noopener sponsored">See the real art</a>
					</p>
				{/if}
				<SourceGallery keyboard={previewed.keyboard} />
			</div>
		{/if}

		<div class="results">
			{#each results as match, i (idOf(match))}
				<MatchCard
					{match}
					rank={i + 1}
					selected={previewed !== undefined && idOf(previewed) === idOf(match)}
					onpreview={() => (previewId = idOf(match))}
				/>
			{:else}
				<p>No combos found. Try fewer must-haves.</p>
			{/each}
		</div>
	</div>
</section>

<style>
	.art-note {
		font-size: 0.78rem;
		color: var(--muted);
		margin: 0.2rem 0 0.6rem;
	}
	.art-note a {
		color: #8ea2ff;
	}
	.hero {
		padding: 4.5rem 0 3rem;
		scroll-margin-top: 64px;
	}
	.wish {
		max-width: 46rem;
	}
	.wish label {
		display: block;
		font-size: 0.95rem;
		color: var(--muted);
		margin-bottom: 0.5rem;
	}
	.wish-box {
		display: flex;
		gap: 0.6rem;
		align-items: stretch;
		background: rgba(6, 10, 20, 0.75);
		border: 1px solid var(--line);
		border-radius: 16px;
		padding: 0.5rem;
	}
	.wish-box textarea {
		flex: 1;
		resize: none;
		border: none;
		background: transparent;
		font-size: 1.05rem;
		padding: 0.5rem 0.6rem;
	}
	.wish-box textarea:focus-visible {
		outline: none;
	}
	.wish-box:focus-within {
		border-color: #8ea2ff;
	}
	.wish-box .btn {
		align-self: center;
		white-space: nowrap;
	}
	.examples {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
		margin-top: 0.75rem;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.chip {
		font: inherit;
		font-size: 0.78rem;
		color: var(--text);
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 0.25rem 0.7rem;
		cursor: pointer;
	}
	.chip:hover {
		border-color: #8ea2ff;
	}
	.error {
		color: var(--bad);
		margin: 0.6rem 0 0;
	}

	.results-area {
		padding: 2.5rem 0 1rem;
		scroll-margin-top: 72px;
	}
	.fine-tune {
		margin-bottom: 1.25rem;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		padding: 0.75rem 1rem;
	}
	.fine-tune summary {
		cursor: pointer;
		font-size: 0.9rem;
		color: var(--muted);
	}
	.spec {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
		padding-top: 1rem;
	}
	.spec label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
		color: var(--muted);
	}
	.spec .check {
		flex-direction: row;
		align-items: center;
		gap: 0.4rem;
		color: var(--text);
	}
	.preview3d {
		margin-bottom: 1.25rem;
	}
	.placeholder {
		height: 420px;
		display: grid;
		place-items: center;
		border-radius: var(--radius);
		background: var(--panel);
		color: var(--muted);
	}
	.caption {
		margin: 0.5rem 0 0;
		font-size: 0.85rem;
		color: var(--muted);
	}
	.results {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
		gap: 1rem;
	}
	@media (max-width: 600px) {
		.wish-box {
			flex-direction: column;
		}
		.wish-box .btn {
			align-self: stretch;
		}
	}
</style>
