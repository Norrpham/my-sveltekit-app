<script lang="ts">
	import { availabilityLabel } from '../products';
	import type { Availability } from '../types';

	let { value }: { value: Availability } = $props();
</script>

<span class="badge {value}">{availabilityLabel[value]}</span>

<style>
	.badge {
		font-size: 0.75rem;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		background: #eee;
		color: #444;
		white-space: nowrap;
	}
	.in_stock {
		background: #dff3e4;
		color: #1d6b34;
	}
	.pre-order,
	.backordered {
		background: #fff1d6;
		color: #8a5a00;
	}
	.sold_out {
		background: #fde2e2;
		color: #9b1c1c;
	}
</style>
