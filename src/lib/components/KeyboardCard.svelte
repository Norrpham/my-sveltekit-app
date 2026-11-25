<script lang="ts">
	import AvailabilityBadge from './AvailabilityBadge.svelte';
	import DetailBadge from './DetailBadge.svelte';
	import { buyLink, formatPrice } from '../products';
	import type { Keyboard } from '../types';

	let { keyboard }: { keyboard: Keyboard } = $props();

	// Which color the swatch row has selected. Starts on the first variant.
	let selected = $state(0);
	let variant = $derived(keyboard.variants[selected]);
</script>

<article class="card">
	<div class="preview" style:background={variant?.caseColorHex}></div>

	<header>
		<h3>{keyboard.name}</h3>
		<p class="brand">{keyboard.brand}</p>
		<DetailBadge {keyboard} />
	</header>

	<div class="swatches" aria-label="Case colors">
		{#each keyboard.variants as v, i (v.name)}
			<button
				class="swatch"
				class:active={i === selected}
				style:background={v.caseColorHex}
				title={v.name}
				aria-label={v.name}
				onclick={() => (selected = i)}
			></button>
		{/each}
	</div>
	<p class="variant-name">{variant?.name}</p>

	<ul class="facts">
		<li>{keyboard.layout}</li>
		<li>{keyboard.wireless ? 'Wireless' : 'Wired'}</li>
		{#each keyboard.features as f (f.type)}
			<li>{f.type}</li>
		{/each}
	</ul>

	<footer>
		<span class="price">{formatPrice(keyboard.priceUsd)}</span>
		<AvailabilityBadge value={keyboard.availability} />
		<a class="buy" href={buyLink(keyboard)} target="_blank" rel="noopener sponsored">View at store</a>
	</footer>
</article>

<style>
	.card {
		border: 1px solid var(--line);
		background: var(--panel);
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.preview {
		height: 72px;
		border-radius: 8px;
		border: 1px solid #fff2;
	}
	h3 {
		margin: 0;
		font-size: 1.05rem;
	}
	.brand,
	.variant-name {
		margin: 0;
		color: var(--muted);
		font-size: 0.85rem;
	}
	.swatches {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.swatch {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 1px solid #fff4;
		cursor: pointer;
		padding: 0;
	}
	.swatch.active {
		outline: 2px solid #fff;
		outline-offset: 2px;
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
		background: var(--panel-2);
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
