<script lang="ts">
	import { marked } from 'marked';

	let { data } = $props();

	const htmlContent = $derived(marked(data.post.content));

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{data.post.title} - The Blog</title>
	<meta name="description" content={data.post.excerpt} />
</svelte:head>

<article class="max-w-3xl mx-auto px-6 py-16">
	<!-- Back link -->
	<a
		href="/"
		class="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors mb-8"
	>
		<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
		</svg>
		Back to all posts
	</a>

	<!-- Header -->
	<header class="mb-12">
		<div class="flex items-center gap-3 text-sm text-[var(--color-muted)] mb-4">
			<time datetime={data.post.created}>{formatDate(data.post.created)}</time>
			<span class="w-1 h-1 rounded-full bg-[var(--color-muted)]"></span>
			<span>{Math.ceil(data.post.content.length / 1000)} min read</span>
		</div>

		<h1 class="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
			{data.post.title}
		</h1>

		<p class="text-xl text-[var(--color-muted)] leading-relaxed">
			{data.post.excerpt}
		</p>
	</header>

	<!-- Cover image -->
	{#if data.post.cover_image}
		<div class="aspect-[2/1] overflow-hidden rounded-xl mb-12">
			<img
				src={data.post.cover_image}
				alt={data.post.title}
				class="w-full h-full object-cover"
			/>
		</div>
	{/if}

	<!-- Content -->
	<div class="prose">
		{@html htmlContent}
	</div>

	<!-- Footer -->
	<footer class="mt-16 pt-8 border-t border-[var(--color-border)]">
		<div class="flex items-center justify-between">
			<p class="text-[var(--color-muted)] text-sm">
				Last updated: {formatDate(data.post.updated)}
			</p>
			<a
				href="/"
				class="text-[var(--color-accent)] font-medium hover:text-[var(--color-accent-dark)] transition-colors"
			>
				← Read more posts
			</a>
		</div>
	</footer>
</article>

