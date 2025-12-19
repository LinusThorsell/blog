<script lang="ts">
	import type { Post } from '$lib/pocketbase';

	let { post }: { post: Post } = $props();

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<article class="group border-b border-[var(--color-border)] pb-8 last:border-b-0">
	<a href="/blog/{post.slug}" class="block">
		{#if post.cover_image}
			<div class="aspect-[2/1] overflow-hidden rounded-lg mb-6 bg-gray-100">
				<img
					src={post.cover_image}
					alt={post.title}
					class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
				/>
			</div>
		{/if}

		<div class="flex items-center gap-3 text-sm text-[var(--color-muted)] mb-3">
			<time datetime={post.created}>{formatDate(post.created)}</time>
			<span class="w-1 h-1 rounded-full bg-[var(--color-muted)]"></span>
			<span>{Math.ceil(post.content.length / 1000)} min read</span>
		</div>

		<h2 class="text-2xl md:text-3xl font-display font-bold mb-3 group-hover:text-[var(--color-accent)] transition-colors">
			{post.title}
		</h2>

		<p class="text-[var(--color-muted)] leading-relaxed line-clamp-2">
			{post.excerpt}
		</p>

		<span class="inline-flex items-center gap-2 mt-4 text-[var(--color-accent)] font-medium group-hover:gap-3 transition-all">
			Read more
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
			</svg>
		</span>
	</a>
</article>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

