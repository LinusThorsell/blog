<script lang="ts">
	import '../app.css';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<header class="border-b border-[var(--color-border)] bg-[var(--color-paper)]/80 backdrop-blur-sm sticky top-0 z-50">
		<nav class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
			<a href="/" class="font-display text-2xl font-bold tracking-tight hover:text-[var(--color-accent)] transition-colors">
				Linus Blog
			</a>
			<div class="flex items-center gap-4">
				<a href="/" class="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
					Home
				</a>
				<a href="/about" class="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
					About
				</a>
				{#if data.user}
					<a
						href="/admin"
						class="bg-[var(--color-ink)] text-[var(--color-paper)] px-4 py-2 rounded-full text-sm font-medium hover:bg-[var(--color-accent)] transition-colors"
					>
						Write
					</a>
					<form action="/logout" method="POST" class="inline">
						<button
							type="submit"
							class="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors text-sm cursor-pointer"
						>
							Logout
						</button>
					</form>
				{/if}
				<ThemeToggle />
			</div>
		</nav>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-[var(--color-border)] mt-20">
		<div class="max-w-4xl mx-auto px-6 py-8 text-center text-[var(--color-muted)] text-sm">
			<p>Made by <a href="/login" class="hover:text-[var(--color-ink)] transition-colors">Linus</a> with &hearts; and a lot of coffee</p>
		</div>
	</footer>
</div>

<style>
	:global(.font-display) {
		font-family: var(--font-display);
	}
</style>

