<script lang="ts">
	// Every open file or picture the site uses, who made it, and its license.
	import { keyboards } from '../../lib/products';
	let boards = $derived(keyboards.filter((k) => k.credits?.length));
</script>

<svelte:head>
	<title>Credits · KeyCraze</title>
</svelte:head>

<section class="wrap page">
	<span class="tab">Credits</span>
	<h1>Credits and licenses</h1>
	<p>
		Our <strong>Detailed 3D</strong> models are built from design files and pictures that their makers
		share under open licenses. Thank you to these makers. Using their files does not mean they made,
		endorse, or work with KeyCraze.
	</p>

	{#each boards as k (k.id)}
		<article class="board">
			<h2>{k.brand} {k.name}</h2>
			<ul>
				{#each k.credits ?? [] as c (c.what)}
					<li>
						<strong>{c.what}</strong><br />
						By {c.author}. License:
						<a href={c.licenseUrl} target="_blank" rel="noopener">{c.license}</a>.
						Source: <a href={c.sourceUrl} target="_blank" rel="noopener">{c.sourceUrl}</a>
					</li>
				{/each}
			</ul>
			{#if k.disclaimer}<p class="fine">{k.disclaimer}</p>{/if}
		</article>
	{/each}

	<article class="board">
		<h2>Other things we use</h2>
		<ul>
			<li>
				<strong>Keycap patterns</strong> (asanoha, ichimatsu, uroko, seigaiha, kikko) are traditional
				Japanese patterns, hundreds of years old and free to use. We draw them in code. We do not copy
				character art from anime keycap sets; use the "See the real art" link to see the real set.
			</li>
			<li>
				<strong>Basic preview</strong> models are built only from public facts (size, layout, colors).
				They do not use any company's design files or photos.
			</li>
			<li>
				<strong>3D engine:</strong> <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a>
				and <a href="https://threlte.xyz" target="_blank" rel="noopener">Threlte</a> (MIT License).
			</li>
		</ul>
	</article>
</section>

<style>
	.page {
		padding: 2.5rem 1.25rem 3rem;
		max-width: 860px;
	}
	h1 {
		margin: 0.6rem 0 0.8rem;
	}
	.board {
		border: 1px solid var(--line);
		background: var(--panel);
		border-radius: 12px;
		padding: 1rem 1.2rem;
		margin-top: 1rem;
	}
	.board h2 {
		margin: 0 0 0.5rem;
		font-size: 1.1rem;
	}
	ul {
		margin: 0;
		padding-left: 1.1rem;
		display: grid;
		gap: 0.6rem;
	}
	li {
		line-height: 1.45;
		word-break: break-word;
	}
	a {
		color: #8ea2ff;
	}
	.fine {
		font-size: 0.8rem;
		color: var(--muted);
		margin: 0.6rem 0 0;
	}
</style>
