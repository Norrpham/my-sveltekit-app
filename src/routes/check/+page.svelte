<script lang="ts">
	// Private check page: each Detailed 3D model next to its real pictures,
	// so Norman can score how close it looks. Not linked from the site menu.
	import { onMount, type Component } from 'svelte';
	import SourceGallery from '../../lib/components/SourceGallery.svelte';
	import { keyboards, keycaps } from '../../lib/products';

	// Plain keycaps that look like each board's photos/drawings, plus the anime test.
	const defaults: Record<string, string> = {
		'mode-sonnet-2026': 'keychron-wob',
		'mode-encore-2026': 'keychron-camel',
		bakeneko65: 'keychron-player'
	};
	const boards = keyboards.filter((k) => k.detail === 'detailed');
	let choice = $state(
		Object.fromEntries(boards.map((b) => [b.id, { variant: 0, keycap: defaults[b.id] ?? keycaps[0].id }]))
	);

	let Viewer = $state<Component<any> | null>(null);
	onMount(async () => {
		Viewer = (await import('../../lib/components/three/KeyboardViewer.svelte')).default;
	});
	const fits = (layout: string) => keycaps.filter((c) => c.fitsLayouts.includes(layout as never));
</script>

<svelte:head>
	<title>Model check · KeyCraze</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="wrap page">
	<span class="tab">Model check</span>
	<h1>Does the 3D look like the real board?</h1>
	<p class="lead">
		Compare each model with the real pictures. Give it a score (for example "65%") and tell Claude what
		looks wrong, like "the front edge is too tall".
	</p>

	{#each boards as b (b.id)}
		{@const c = choice[b.id]}
		{@const keycap = keycaps.find((k) => k.id === c.keycap)!}
		<article class="board">
			<header>
				<h2>{b.brand} · {b.name}</h2>
				<div class="pickers">
					<label>
						Color
						<select bind:value={c.variant}>
							{#each b.variants as v, i (v.name)}<option value={i}>{v.name}</option>{/each}
						</select>
					</label>
					<label>
						Keycaps
						<select bind:value={c.keycap}>
							{#each fits(b.layout) as k (k.id)}<option value={k.id}>{k.name}</option>{/each}
						</select>
					</label>
				</div>
			</header>
			<div class="cols">
				<div>
					{#if Viewer}
						<Viewer keyboard={b} variant={b.variants[c.variant]} {keycap} />
					{:else}
						<div class="placeholder">Loading 3D…</div>
					{/if}
				</div>
				<div>
					<SourceGallery keyboard={b} />
					<h3>Facts used</h3>
					<p class="fine">{b.notes}</p>
					{#if b.needsCheck.length}
						<h3>Not sure yet</h3>
						<ul class="fine">
							{#each b.needsCheck as n (n)}<li>{n}</li>{/each}
						</ul>
					{/if}
				</div>
			</div>
		</article>
	{/each}
</section>

<style>
	.page {
		padding: 2.5rem 1.25rem 3rem;
	}
	h1 {
		margin: 0.6rem 0 0.4rem;
	}
	.lead {
		color: var(--muted);
		max-width: 60ch;
	}
	.board {
		border: 1px solid var(--line);
		background: var(--panel);
		border-radius: 12px;
		padding: 1rem;
		margin-top: 1.25rem;
	}
	header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.75rem;
		align-items: center;
		margin-bottom: 0.75rem;
	}
	h2 {
		margin: 0;
		font-size: 1.15rem;
	}
	h3 {
		font-size: 0.9rem;
		margin: 0.9rem 0 0.3rem;
	}
	.pickers {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	label {
		display: flex;
		flex-direction: column;
		font-size: 0.75rem;
		color: var(--muted);
		gap: 0.2rem;
	}
	.cols {
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: 1rem;
	}
	@media (max-width: 860px) {
		.cols {
			grid-template-columns: 1fr;
		}
	}
	.placeholder {
		height: 420px;
		display: grid;
		place-items: center;
		color: var(--muted);
		border-radius: 12px;
		background: #0d1426;
	}
	.fine {
		font-size: 0.8rem;
		color: var(--muted);
		line-height: 1.45;
	}
</style>
