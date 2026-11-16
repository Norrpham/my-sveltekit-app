<script lang="ts">
	type Todo = { id: number; text: string; done: boolean };

	let count = $state(0);
	let doubled = $derived(count * 2);

	let todos = $state<Todo[]>([]);
	let draft = $state('');
	let remaining = $derived(todos.filter((t) => !t.done).length);

	function addTodo(event: SubmitEvent) {
		event.preventDefault();
		const text = draft.trim();
		if (!text) return;
		todos.push({ id: Date.now(), text, done: false });
		draft = '';
	}
</script>

<svelte:head>
	<title>My SvelteKit App</title>
</svelte:head>

<main>
	<h1>Hello this is my new journey</h1>
	<p><a href="/catalog">Browse the keyboard catalog →</a></p>

	<section>
		<h2>Counter</h2>
		<button onclick={() => count++}>Clicked {count} {count === 1 ? 'time' : 'times'}</button>
		<p>Doubled: {doubled}</p>
	</section>

	<section>
		<h2>To-do ({remaining} left)</h2>
		<form onsubmit={addTodo}>
			<input bind:value={draft} placeholder="Add a task" />
			<button type="submit">Add</button>
		</form>
		<ul>
			{#each todos as todo (todo.id)}
				<li>
					<label class:done={todo.done}>
						<input type="checkbox" bind:checked={todo.done} />
						{todo.text}
					</label>
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	main {
		max-width: 32rem;
		margin: 3rem auto;
		padding: 0 1rem;
		font-family: system-ui, sans-serif;
	}
	section {
		margin-top: 2rem;
	}
	ul {
		list-style: none;
		padding: 0;
	}
	.done {
		text-decoration: line-through;
		opacity: 0.6;
	}
</style>
