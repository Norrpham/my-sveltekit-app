<script lang="ts">
	import AvailabilityBadge from './AvailabilityBadge.svelte';
	import DetailBadge from './DetailBadge.svelte';
	import { buyLink, formatPrice } from '../products';
	import type { Match } from '../matching';

	let {
		match,
		rank,
		selected = false,
		onpreview
	}: { match: Match; rank: number; selected?: boolean; onpreview?: () => void } = $props();
</script>

<article class="card" class:top={rank === 1} class:selected>
	<div class="head">
		<p class="rank">{rank === 1 ? 'Best match' : `Alternative ${rank - 1}`}</p>
		{#if onpreview}
			<button type="button" class="preview" onclick={onpreview} disabled={selected}>
				{selected ? 'Showing in 3D' : 'View in 3D'}
			</button>
		{/if}
	</div>

	<div class="combo">
		<div class="part">
			<span class="swatch" style:background={match.variant.caseColorHex}></span>
			<div>
				<strong>{match.keyboard.name}</strong>
				<span class="sub">{match.keyboard.brand} · {match.keyboard.layout} · {match.variant.name}</span>
				<DetailBadge keyboard={match.keyboard} />
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
		border: 1px solid var(--line);
		background: var(--panel);
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.card.top {
		border: 2px solid #8ea2ff;
	}
	.card.selected {
		box-shadow: 0 0 0 3px var(--blue);
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.preview {
		font: inherit;
		font-size: 0.75rem;
		padding: 0.25rem 0.6rem;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--panel-2);
		color: var(--text);
		cursor: pointer;
	}
	.preview:disabled {
		background: var(--blue);
		border-color: var(--blue);
		color: #fff;
		cursor: default;
	}
	.rank {
		margin: 0;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
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
		border: 1px solid #fff3;
	}
	.swatch.keys {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		overflow: hidden;
	}
	.sub {
		font-size: 0.8rem;
		color: var(--muted);
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
		color: var(--good);
	}
	.bad {
		color: var(--bad);
	}
</style>
