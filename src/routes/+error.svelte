<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} - The Blog</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-6 py-24 text-center">
	<div class="text-8xl mb-6 font-display font-bold text-[var(--color-muted)]">
		{page.status}
	</div>

	<h1 class="text-3xl font-display font-bold mb-4">
		{#if page.status === 404}
			Page Not Found
		{:else}
			Something Went Wrong
		{/if}
	</h1>

	<p class="text-[var(--color-muted)] text-lg mb-8">
		{#if page.status === 404}
			The page you're looking for doesn't exist or has been moved.
		{:else}
			{page.error?.message || 'An unexpected error occurred.'}
		{/if}
	</p>

	<a
		href="/"
		class="inline-block bg-[var(--color-ink)] text-[var(--color-paper)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-accent)] transition-colors"
	>
		← Back to Home
	</a>
</div>

