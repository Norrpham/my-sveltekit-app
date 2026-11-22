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
		background: #2a3350;
		color: #c9d1e4;
		white-space: nowrap;
	}
	.in_stock {
		background: #14392a;
		color: #6ee7a0;
	}
	.pre-order,
	.backordered {
		background: #3d2e10;
		color: #f6c560;
	}
	.sold_out {
		background: #43191c;
		color: #fb9a9a;
	}
</style>
