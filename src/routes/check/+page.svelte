<script lang="ts">
	// Private check page: each Detailed 3D model next to its real pictures,
	// with a score checklist. Not linked from the site menu.
	import { onMount, type Component } from 'svelte';
	import SourceGallery from '../../lib/components/SourceGallery.svelte';
	import { keyboards, keycaps } from '../../lib/products';

	// Keycaps that look like each board's reference picture.
	const defaults: Record<string, string> = {
		bakeneko65: 'keychron-player',
		'mode-sonnet-2026': 'keychron-wob',
		'mode-encore-2026': 'keychron-camel'
	};
	// Step 1 first (we only move on when it scores 90%+).
	const order = ['bakeneko65', 'mode-sonnet-2026', 'mode-encore-2026'];
	const boards = keyboards
		.filter((k) => k.detail === 'detailed')
		.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

	const CHECKS = [
		{ id: 'shape', label: 'Case shape (outline, edges, side profile)' },
		{ id: 'size', label: 'Size and proportions' },
		{ id: 'case', label: 'Case color and material (shine, texture)' },
		{ id: 'keycolors', label: 'Keycap colors (every group of keys)' },
		{ id: 'legends', label: 'Legends (letters, symbols, where they sit)' },
		{ id: 'keyshape', label: 'Keycap shape and height' },
		{ id: 'lights', label: 'Lights (if the board has them)' }
	];

	type Score = { scores: Record<string, number | null>; notes: Record<string, string> };
	const blank = (): Score => ({
		scores: Object.fromEntries(CHECKS.map((c) => [c.id, null])),
		notes: Object.fromEntries(CHECKS.map((c) => [c.id, '']))
	});

	let choice = $state(
		Object.fromEntries(
			boards.map((b) => [b.id, { variant: 0, keycap: defaults[b.id] ?? keycaps[0].id, pic: 0, n: 0 }])
		)
	);
	let scores = $state<Record<string, Score>>(Object.fromEntries(boards.map((b) => [b.id, blank()])));
	let copied = $state('');

	let Viewer = $state<Component<any> | null>(null);
	onMount(async () => {
		// Scores are kept in this browser only.
		for (const b of boards) {
			try {
				const saved = localStorage.getItem(`keycraze-check-${b.id}`);
				if (saved) scores[b.id] = { ...blank(), ...JSON.parse(saved) };
			} catch {
				/* storage blocked: start empty */
			}
		}
		Viewer = (await import('../../lib/components/three/KeyboardViewer.svelte')).default;
	});

	function save(id: string) {
		try {
			localStorage.setItem(`keycraze-check-${id}`, JSON.stringify(scores[id]));
		} catch {
			/* ignore */
		}
	}

	const average = (s: Score) => {
		const vals = Object.values(s.scores).filter((v): v is number => typeof v === 'number');
		return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
	};

	async function copy(id: string) {
		const b = boards.find((x) => x.id === id)!;
		const c = choice[id];
		const s = scores[id];
		const lines = [
			`${b.brand} ${b.name} (${b.variants[c.variant].name}, ${keycaps.find((k) => k.id === c.keycap)?.name})`,
			`Overall: ${average(s) ?? '?'}%`,
			...CHECKS.map((ch) => `- ${ch.label}: ${s.scores[ch.id] ?? '?'}%${s.notes[ch.id] ? ` — ${s.notes[ch.id]}` : ''}`)
		];
		try {
			await navigator.clipboard.writeText(lines.join('\n'));
			copied = id;
			setTimeout(() => (copied = ''), 2000);
		} catch {
			copied = '';
		}
	}

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
		Turn the model to the photo's angle, then score each part from 0 to 100. Press <strong>Copy scores</strong>
		and paste them to Claude. We move to the next step when a board reaches <strong>90%</strong>.
	</p>

	{#each boards as b, bi (b.id)}
		{@const c = choice[b.id]}
		{@const keycap = keycaps.find((k) => k.id === c.keycap)!}
		{@const pic = b.gallery?.[c.pic]}
		{@const avg = average(scores[b.id])}
		<article class="board">
			<header>
				<div>
					<p class="step">{bi === 0 ? 'Step 1 · score this one first' : 'Step 2 · later'}</p>
					<h2>{b.brand} · {b.name}</h2>
				</div>
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
						<Viewer
							keyboard={b}
							variant={b.variants[c.variant]}
							{keycap}
							zoomable
							view={pic?.view && c.n ? { ...pic.view, n: c.n } : null}
						/>
					{:else}
						<div class="placeholder">Loading 3D…</div>
					{/if}
					{#if pic?.view}
						<button type="button" class="btn small match" onclick={() => (c.n += 1)}>
							Match the photo
						</button>
					{/if}
				</div>
				<div>
					<SourceGallery keyboard={b} bind:open={c.pic} />
					{#if keycap.notes}<p class="fine"><strong>Keycaps:</strong> {keycap.notes}</p>{/if}
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

			<div class="checklist">
				<h3>Score it <span class="avg">{avg === null ? '' : `Overall ${avg}%`}</span></h3>
				{#each CHECKS as ch (ch.id)}
					<div class="row">
						<span class="what">{ch.label}</span>
						<input
							type="number"
							min="0"
							max="100"
							placeholder="%"
							aria-label="{ch.label} score"
							bind:value={scores[b.id].scores[ch.id]}
							oninput={() => save(b.id)}
						/>
						<input
							type="text"
							placeholder="What looks wrong?"
							aria-label="{ch.label} note"
							bind:value={scores[b.id].notes[ch.id]}
							oninput={() => save(b.id)}
						/>
					</div>
				{/each}
				<button type="button" class="btn small" onclick={() => copy(b.id)}>
					{copied === b.id ? 'Copied!' : 'Copy scores'}
				</button>
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
		max-width: 62ch;
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
	.step {
		margin: 0 0 0.2rem;
		font-size: 0.72rem;
		color: #8ea2ff;
		text-transform: uppercase;
		letter-spacing: 0.05em;
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
	.match {
		margin-top: 0.5rem;
	}
	.fine {
		font-size: 0.8rem;
		color: var(--muted);
		line-height: 1.45;
	}
	.checklist {
		margin-top: 1rem;
		border-top: 1px solid var(--line);
		padding-top: 0.5rem;
	}
	.avg {
		float: right;
		color: #8ea2ff;
	}
	.row {
		display: grid;
		grid-template-columns: minmax(10rem, 1.2fr) 4.5rem 2fr;
		gap: 0.5rem;
		align-items: center;
		margin: 0.35rem 0;
		font-size: 0.85rem;
	}
	@media (max-width: 600px) {
		.row {
			grid-template-columns: 1fr 4.5rem;
		}
		.row input[type='text'] {
			grid-column: 1 / -1;
		}
	}
	.checklist .btn {
		margin-top: 0.5rem;
	}
</style>
