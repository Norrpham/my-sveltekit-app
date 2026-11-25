<script lang="ts">
	// Real pictures for boards whose maker shares them under an open license,
	// each with its credit. Boards without one get a link to the store's photos.
	import { buyLink } from '../products';
	import type { Keyboard } from '../types';

	let { keyboard, open = $bindable(0) }: { keyboard: Keyboard; open?: number } = $props();
	let pics = $derived(keyboard.gallery ?? []);
</script>

{#if pics.length}
	<section class="gallery" aria-label="Pictures of the real {keyboard.name}">
		<figure>
			<img src={pics[open].src} alt={pics[open].caption} loading="lazy" width="1000" height="750" />
			<figcaption>
				{pics[open].caption} · <span class="credit">{pics[open].credit}</span>
			</figcaption>
		</figure>
		{#if pics.length > 1}
			<div class="thumbs">
				{#each pics as p, i (p.src)}
					<button type="button" class:active={i === open} onclick={() => (open = i)} aria-label={p.caption}>
						<img src={p.src} alt="" loading="lazy" width="96" height="72" />
					</button>
				{/each}
			</div>
		{/if}
	</section>
{:else}
	<a class="btn small ghost" href={buyLink(keyboard)} target="_blank" rel="noopener sponsored">See real photos</a>
{/if}

<style>
	.gallery {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	figure {
		margin: 0;
	}
	figure img {
		width: 100%;
		height: auto;
		border-radius: 10px;
		background: #000;
		display: block;
	}
	figcaption {
		font-size: 0.75rem;
		color: var(--muted);
		margin-top: 0.3rem;
	}
	.credit {
		opacity: 0.85;
	}
	.thumbs {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.thumbs button {
		padding: 0;
		border: 2px solid transparent;
		border-radius: 6px;
		overflow: hidden;
		cursor: pointer;
		background: none;
		line-height: 0;
	}
	.thumbs button.active {
		border-color: var(--blue);
	}
	.thumbs img {
		width: 72px;
		height: 54px;
		object-fit: cover;
	}
	.ghost {
		align-self: flex-start;
	}
</style>
