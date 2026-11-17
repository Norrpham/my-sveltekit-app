<script lang="ts">
	import AvailabilityBadge from './AvailabilityBadge.svelte';
	import { buyLink, formatPrice } from '../products';
	import type { Match } from '../matching';

	let { match, rank }: { match: Match; rank: number } = $props();
</script>

<article class="card" class:top={rank === 1}>
	<p class="rank">{rank === 1 ? 'Best match' : `Alternative ${rank - 1}`}</p>

	<div class="combo">
		<div class="part">
			<span class="swatch" style:background={match.variant.caseColorHex}></span>
			<div>
				<strong>{match.keyboard.name}</strong>
				<span class="sub">{match.keyboard.brand} · {match.keyboard.layout} · {match.variant.name}</span>
				<span class="row">
					{formatPrice(match.keyboard.priceUsd)}
					<AvailabilityBadge value={match.keyboard.availability} />
					<a href={buyLink(match.keyboard)} target="_blank" rel="noopener sponsored">Store</a>
				</span>
			</div>
		</div>

		<div class="part">
			<span class="swatch keys">
				<i style:background={match.keycap.colors.accent}></i>
				<i style:background={match.keycap.colors.base}></i>
				<i style:background={match.keycap.colors.legend}></i>
			</span>
			<div>
				<strong>{match.keycap.name}</strong>
				<span class="sub">{match.keycap.brand} · {match.keycap.profile} profile</span>
				<span class="row">
					{formatPrice(match.keycap.priceUsd)}
					<AvailabilityBadge value={match.keycap.availability} />
					<a href={buyLink(match.keycap)} target="_blank" rel="noopener sponsored">Store</a>
				</span>
			</div>
		</div>
	</div>

	<p class="total">Together: <strong>{formatPrice(match.totalUsd)}</strong></p>

	{#if match.matched.length}
		<ul class="notes good">
			{#each match.matched as note (note)}<li>✓ {note}</li>{/each}
		</ul>
	{/if}
	{#if match.differs.length}
		<ul class="notes bad">
			{#each match.differs as note (note)}<li>✗ {note}</li>{/each}
		</ul>
	{/if}
</article>

<style>
	.card {
		border: 1px solid #ddd;
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.card.top {
		border: 2px solid #333;
	}
	.rank {
		margin: 0;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #666;
	}
	.combo {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.part {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}
	.part > div {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.swatch {
		flex: none;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		border: 1px solid #0002;
	}
	.swatch.keys {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		overflow: hidden;
	}
	.sub {
		font-size: 0.8rem;
		color: #666;
	}
	.row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.85rem;
	}
	.total {
		margin: 0;
	}
	.notes {
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 0.85rem;
	}
	.good {
		color: #1d6b34;
	}
	.bad {
		color: #9b1c1c;
	}
</style>
