<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { site } from '../lib/site';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	let menuOpen = $state(false);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/#design', label: 'Design' },
		{ href: '/catalog', label: 'Catalog' },
		{ href: '/#faq', label: 'FAQ' },
		{ href: '/#contact', label: 'Contact' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="top">
	<div class="wrap bar">
		<a class="logo" href="/">Key<span>Craze</span></a>

		<button
			class="menu-btn"
			aria-label="Menu"
			aria-expanded={menuOpen}
			onclick={() => (menuOpen = !menuOpen)}>☰</button
		>

		<nav class:open={menuOpen}>
			<ul class="pill">
				{#each links as l (l.href)}
					<li><a href={l.href} onclick={() => (menuOpen = false)}>{l.label}</a></li>
				{/each}
			</ul>
			<a class="btn" href="/#design" onclick={() => (menuOpen = false)}>Design yours</a>
		</nav>
	</div>
</header>

{@render children()}

<footer id="contact">
	<div class="wrap cols">
		<div>
			<h2>Contact</h2>
			<p><a href="mailto:{site.email}">{site.email}</a></p>
			<a class="btn" href="mailto:{site.email}?subject=KeyCraze%20quote">Get a Quote</a>
		</div>
		{#if site.instagram || site.discord}
			<div>
				<h2>Follow us on</h2>
				{#if site.instagram}<p><a href={site.instagram} target="_blank" rel="noopener">Instagram</a></p>{/if}
				{#if site.discord}<p><a href={site.discord} target="_blank" rel="noopener">Discord</a></p>{/if}
			</div>
		{/if}
	</div>
	<p class="wrap fine">
		© {new Date().getFullYear()} {site.name}. Some links are affiliate links: we may earn a commission
		if you buy, at no extra cost to you. 3D previews are approximate.
	</p>
</footer>

<style>
	.top {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgba(11, 17, 32, 0.85);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--line);
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		height: 64px;
	}
	.logo {
		color: #fff;
		text-decoration: none;
		font-size: 1.35rem;
		letter-spacing: 0.02em;
	}
	.logo span {
		color: var(--blue);
		font-weight: 600;
	}
	nav {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.pill {
		display: flex;
		gap: 0.25rem;
		list-style: none;
		margin: 0;
		padding: 0.3rem 0.6rem;
		background: #060a14;
		border-radius: 999px;
	}
	.pill a {
		display: block;
		color: var(--text);
		text-decoration: none;
		font-size: 0.85rem;
		padding: 0.3rem 0.7rem;
		border-radius: 999px;
	}
	.pill a:hover {
		color: #8ea2ff;
	}
	.menu-btn {
		display: none;
		font-size: 1.4rem;
		background: none;
		border: none;
		color: var(--text);
		cursor: pointer;
	}

	@media (max-width: 760px) {
		.menu-btn {
			display: block;
		}
		nav {
			display: none;
			position: absolute;
			top: 64px;
			left: 0;
			right: 0;
			flex-direction: column;
			align-items: stretch;
			padding: 1rem 1.25rem 1.25rem;
			background: var(--bg);
			border-bottom: 1px solid var(--line);
		}
		nav.open {
			display: flex;
		}
		.pill {
			flex-direction: column;
			border-radius: var(--radius);
		}
	}

	footer {
		background: #1b2234;
		margin-top: 4rem;
		padding: 3rem 0 1.5rem;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 2rem;
	}
	footer h2 {
		font-weight: 600;
		font-size: 1.6rem;
		margin: 0 0 1rem;
	}
	footer a:not(.btn) {
		color: var(--text);
	}
	.fine {
		margin-top: 2.5rem;
		font-size: 0.78rem;
		color: var(--muted);
	}
</style>
