<script lang="ts">
	// "Detailed 3D" for boards built from open design files, "Basic preview" for the rest.
	import type { Keyboard } from '../types';
	let { keyboard }: { keyboard: Keyboard } = $props();
	let detailed = $derived(keyboard.detail === 'detailed');
</script>

<span
	class="badge"
	class:detailed
	title={detailed
		? "3D model built from the maker's open design files"
		: '3D model built from public facts; shape and colors are approximate'}
>
	{detailed ? 'Detailed 3D' : 'Basic preview'}
</span>

<style>
	.badge {
		display: inline-block;
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		padding: 0.12rem 0.5rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		color: var(--muted);
		white-space: nowrap;
		width: fit-content;
		margin-top: 0.2rem;
	}
	.detailed {
		border-color: #3b5bfd;
		background: rgba(59, 91, 253, 0.18);
		color: #c7d2ff;
	}
</style>
