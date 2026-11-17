<script lang="ts">
	import AvailabilityBadge from './AvailabilityBadge.svelte';
	import { buyLink, formatPrice } from '../products';
	import type { Keycap } from '../types';

	let { keycap }: { keycap: Keycap } = $props();

	// A tiny row of keys drawn in the set's colors (no copied artwork).
	const sampleKeys = ['Esc', 'Q', 'W', 'E', 'R', 'T'];

	// How bright a #rrggbb color looks (0 = black, 1 = white).
	function brightness(hex: string): number {
		const n = parseInt(hex.slice(1), 16);
		return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
	}

	// Pick the set color (legend or base) that stands out most on this key,
	// so letters never disappear when a key's color matches the legend color.
	function readableOn(bg: string): string {
		const { legend, base } = keycap.colors;
		const gap = (c: string) => Math.abs(brightness(c) - brightness(bg));
		return gap(legend) >= gap(base) ? legend : base;
	}
</script>

<article class="card">
	<div class="keys" style:background={keycap.colors.base}>
		{#each sampleKeys as label, i (label)}
			{@const novelty = keycap.noveltyKeys.find((n) => n.key === label)}
			{@const bg = novelty?.color ?? (i === 0 ? keycap.colors.accent : keycap.colors.base)}
			<span
				class="key"
				style:background={bg}
				style:color={readableOn(bg)}
				title={novelty ? `${label}: ${novelty.shape}` : label}>{label}</span
			>
		{/each}
	</div>

	<header>
		<h3>{keycap.name}</h3>
		<p class="brand">{keycap.brand}</p>
	</header>

	<ul class="facts">
		<li>{keycap.theme}</li>
		<li>{keycap.profile}</li>
		<li>Fits {keycap.fitsLayouts.join(', ')}</li>
		{#if keycap.officiallyLicensed}<li>Licensed</li>{/if}
	</ul>

	<footer>
		<span class="price">{formatPrice(keycap.priceUsd)}</span>
		<AvailabilityBadge value={keycap.availability} />
		<a class="buy" href={buyLink(keycap)} target="_blank" rel="noopener sponsored">View at store</a>
	</footer>
</article>

<style>
	.card {
		border: 1px solid #ddd;
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.keys {
		display: flex;
		gap: 4px;
		padding: 8px;
		border-radius: 8px;
		border: 1px solid #0001;
	}
	.key {
		flex: 1;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		font-size: 0.7rem;
		font-weight: 600;
		border-radius: 5px;
		box-shadow: inset 0 -3px 0 #0002;
	}
	h3 {
		margin: 0;
		font-size: 1.05rem;
	}
	.brand {
		margin: 0;
		color: #666;
		font-size: 0.85rem;
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.facts li {
		font-size: 0.75rem;
		background: #f3f3f3;
		border-radius: 6px;
		padding: 0.1rem 0.45rem;
	}
	footer {
		margin-top: auto;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.price {
		font-weight: 600;
	}
	.buy {
		margin-left: auto;
		font-size: 0.85rem;
	}
</style>
