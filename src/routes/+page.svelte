<script lang="ts">
	import Designer from '../lib/components/Designer.svelte';
	import { faqs } from '../lib/faq';
	import { photoBg, site } from '../lib/site';

	const strip = [
		'Customize Your Keyboard',
		'Explore Unique Designs',
		'Connect with Keyboard Community',
		'Personalize Your Typing Experience'
	];

	const reasons = [
		{
			icon: 'dial',
			title: 'Unique and Customizable Keyboards',
			text: 'Discover a world of endless customization options to personalize your keyboard and make it truly one-of-a-kind.'
		},
		{
			icon: 'cube',
			title: 'Premium Quality Materials',
			text: 'We use high-quality materials to ensure the durability, functionality, and aesthetic appeal of every custom keyboard.'
		},
		{
			icon: 'gear',
			title: 'Community Engagement',
			text: 'Join a community of keyboard enthusiasts, share ideas, and get inspired by unique keyboard designs from around the world.'
		},
		{
			icon: 'chat',
			title: 'Expert Guidance',
			text: 'Get personalized advice and guidance from our experienced team to bring your dream keyboard to life.'
		}
	];

	let faqSearch = $state('');
	let shownFaqs = $derived(
		faqs.filter((f) => {
			const s = faqSearch.trim().toLowerCase();
			if (!s) return true;
			const text = (f.q + ' ' + JSON.stringify(f.a)).toLowerCase();
			return s.split(/\s+/).every((w) => text.includes(w));
		})
	);
</script>

<svelte:head>
	<title>{site.name} · {site.tagline}</title>
	<meta
		name="description"
		content="Describe your dream keyboard and KeyCraze finds real keyboards and keycaps that match, in 3D."
	/>
</svelte:head>

<Designer heroBg={photoBg(site.photos.hero, 0.45)}>
	{#snippet intro()}
		<h1>Welcome to<br />{site.name}</h1>
		<p class="tagline">{site.tagline}</p>
		<p class="sub">
			Tell us the keyboard you imagine. Our AI finds real keyboards and keycaps that match, and shows
			them to you in 3D.
		</p>
	{/snippet}

	{#snippet between()}
		<div class="wrap">
			<ul class="strip">
				{#each strip as s (s)}<li>{s}</li>{/each}
			</ul>
		</div>
	{/snippet}
</Designer>

<section class="band" style:background={photoBg(site.photos.about, 0.55)}>
	<div class="wrap">
		<h2 class="tab">About {site.name}</h2>
		<p class="big">
			{site.name} is your ultimate destination for custom keyboards. We are dedicated to providing
			top-notch custom keyboard products and building a vibrant community around the passion for
			unique and personalized keyboards.
		</p>
	</div>
</section>

<section class="band" style:background={photoBg(site.photos.why, 0.6)}>
	<div class="wrap">
		<h2 class="tab big-tab">Why Choose {site.name}</h2>
		<div class="reasons">
			{#each reasons as r (r.title)}
				<div class="reason">
					<span class="icon" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6">
							{#if r.icon === 'dial'}
								<circle cx="12" cy="12" r="8" /><path d="M12 12l4-4M12 4v2M20 12h-2M12 20v-2M4 12h2" />
							{:else if r.icon === 'cube'}
								<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
							{:else if r.icon === 'gear'}
								<circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
							{:else}
								<rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4M7 9h10M7 12h6" />
							{/if}
						</svg>
					</span>
					<h3>{r.title}</h3>
					<p>{r.text}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="band faq" id="faq" style:background={photoBg(site.photos.faq, 0.7)}>
	<div class="wrap narrow">
		<h2 class="faq-title">FAQ</h2>
		<div class="faq-head">
			<p class="faq-sub">Frequently asked questions</p>
			<input type="search" bind:value={faqSearch} placeholder="Looking for something?" aria-label="Search the FAQ" />
		</div>

		{#each shownFaqs as f (f.q)}
			<details>
				<summary>{f.q}</summary>
				<div class="answer">
					{#each f.a as block, i (i)}
						{#if 'p' in block}
							<p>{block.p}</p>
						{:else}
							{#if block.title}<p class="list-title">{block.title}</p>{/if}
							{#if block.ordered}
								<ol>{#each block.list as item (item)}<li>{item}</li>{/each}</ol>
							{:else}
								<ul>{#each block.list as item (item)}<li>{item}</li>{/each}</ul>
							{/if}
						{/if}
					{/each}
				</div>
			</details>
		{:else}
			<p class="none">No questions match "{faqSearch}". <a href="#contact">Ask us directly.</a></p>
		{/each}
	</div>
</section>

<section class="collection">
	<div class="wrap">
		<h2 class="tab">Explore Our Collection</h2>
		<div class="tiles">
			{#each site.photos.collection as photo, i (i)}
				<a
					class="tile"
					href="/catalog"
					style:background={photo
						? photoBg(photo, 0.05)
						: `linear-gradient(135deg, ${['#2b3a63, #0e1630', '#4a2a55, #12162a', '#21524a, #0e1a22'][i]})`}
				>
					<span>{['Keyboards', 'Keycap sets', 'Themed builds'][i]}</span>
				</a>
			{/each}
		</div>
		<p class="center"><a class="btn" href="/catalog">Browse the full catalog</a></p>
	</div>
</section>

<style>
	h1 {
		font-size: clamp(2.6rem, 8vw, 5rem);
		margin: 0;
		letter-spacing: -0.01em;
	}
	.tagline {
		font-size: 1.15rem;
		margin: 0.75rem 0 0.4rem;
	}
	.sub {
		color: var(--muted);
		max-width: 38rem;
		margin: 0 0 2rem;
	}

	.strip {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		list-style: none;
		margin: 0;
		padding: 1.25rem;
		gap: 1rem;
		background: #1c2333;
		border-radius: 4px;
	}
	.strip li {
		border-left: 4px solid var(--blue);
		padding: 0.25rem 0 0.25rem 0.9rem;
		font-size: 0.95rem;
	}

	.band {
		padding: 5rem 0;
	}
	.big {
		font-size: clamp(1.3rem, 3vw, 1.9rem);
		font-weight: 300;
		max-width: 44rem;
		margin: 0;
	}
	.big-tab {
		font-size: 1.3rem;
	}
	.reasons {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2.5rem 3rem;
		max-width: 48rem;
	}
	.icon {
		display: inline-grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border: 1px solid #fff;
		border-radius: 6px;
	}
	.reason h3 {
		font-size: 1.35rem;
		margin: 0.9rem 0 0.6rem;
	}
	.reason p {
		color: #d5dbea;
		font-size: 0.92rem;
		margin: 0;
	}

	.narrow {
		max-width: 52rem;
	}
	.faq-title {
		font-size: 2.2rem;
		margin: 0 0 1rem;
	}
	.faq-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.25rem;
	}
	.faq-sub {
		font-size: 1.5rem;
		margin: 0;
	}
	.faq-head input {
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--muted);
		border-radius: 0;
		min-width: 16rem;
	}
	details {
		border-bottom: 1px solid rgba(255, 255, 255, 0.18);
	}
	summary {
		cursor: pointer;
		list-style: none;
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.2rem 0;
		font-weight: 600;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary::after {
		content: '⌄';
		color: var(--muted);
		transition: transform 0.2s;
	}
	details[open] summary::after {
		transform: rotate(180deg);
	}
	.answer {
		padding: 0 0 1.2rem;
		color: #d5dbea;
	}
	.answer p {
		margin: 0 0 0.75rem;
	}
	.answer ul,
	.answer ol {
		margin: 0 0 0.9rem;
		padding-left: 1.3rem;
	}
	.list-title {
		font-weight: 600;
		color: var(--text);
		margin-bottom: 0.3rem !important;
	}
	.none {
		color: var(--muted);
	}

	.collection {
		padding: 4rem 0 1rem;
		background: #10182b;
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}
	.tile {
		aspect-ratio: 4 / 3;
		border-radius: 4px;
		display: flex;
		align-items: flex-end;
		padding: 1rem;
		color: #fff;
		text-decoration: none;
		font-weight: 600;
		transition: transform 0.15s;
	}
	.tile:hover {
		transform: translateY(-3px);
	}
	.center {
		text-align: center;
		margin: 2rem 0 0;
	}

	@media (max-width: 760px) {
		.strip {
			grid-template-columns: repeat(2, 1fr);
		}
		.reasons {
			grid-template-columns: 1fr;
		}
		.tiles {
			grid-template-columns: 1fr;
		}
		.faq-head input {
			min-width: 0;
			width: 100%;
		}
	}
</style>
