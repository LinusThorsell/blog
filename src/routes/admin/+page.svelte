<script lang="ts">
	import { marked } from 'marked';
	import type { Post } from '$lib/pocketbase';

	let { data } = $props();

	let title = $state('');
	let slug = $state('');
	let excerpt = $state('');
	let content = $state('');
	let coverImage = $state('');
	let published = $state(false);

	let isSubmitting = $state(false);
	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let showPreview = $state(false);

	const previewHtml = $derived(marked(content));

	// Auto-generate slug from title
	function generateSlug() {
		slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		message = null;

		try {
			const response = await fetch('/api/posts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					slug,
					excerpt,
					content,
					cover_image: coverImage || undefined,
					published
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to create post');
			}

			const post: Post = await response.json();
			message = { type: 'success', text: `Post "${post.title}" created successfully!` };

			// Reset form
			title = '';
			slug = '';
			excerpt = '';
			content = '';
			coverImage = '';
			published = false;
		} catch (err: any) {
			message = { type: 'error', text: err.message || 'Failed to create post' };
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Write a Post - The Blog</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12">
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-3xl font-display font-bold">Write a New Post</h1>
		<button
			type="button"
			onclick={() => (showPreview = !showPreview)}
			class="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors cursor-pointer"
		>
			{showPreview ? 'Edit' : 'Preview'}
		</button>
	</div>

	{#if message}
		<div
			class="mb-6 p-4 rounded-lg border {message.type === 'success'
				? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]'
				: 'bg-[var(--color-error-bg)] text-[var(--color-error-text)] border-[var(--color-error-border)]'}"
		>
			{message.text}
		</div>
	{/if}

	{#if showPreview}
		<!-- Preview Mode -->
		<article class="border border-[var(--color-border)] rounded-xl p-8 bg-[var(--color-surface)]">
			<header class="mb-8">
				<h1 class="text-4xl font-display font-bold mb-4">{title || 'Untitled Post'}</h1>
				<p class="text-xl text-[var(--color-muted)]">{excerpt || 'No excerpt'}</p>
			</header>
			{#if coverImage}
				<img src={coverImage} alt={title} class="w-full aspect-[2/1] object-cover rounded-lg mb-8" />
			{/if}
			<div class="prose">
				{@html previewHtml}
			</div>
		</article>
	{:else}
		<!-- Edit Mode -->
		<form onsubmit={handleSubmit} class="space-y-6">
			<div>
				<label for="title" class="block text-sm font-medium mb-2">Title</label>
				<input
					type="text"
					id="title"
					bind:value={title}
					oninput={generateSlug}
					required
					class="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
					placeholder="Your post title"
				/>
			</div>

			<div>
				<label for="slug" class="block text-sm font-medium mb-2">Slug</label>
				<div class="flex items-center gap-2">
					<span class="text-[var(--color-muted)]">/blog/</span>
					<input
						type="text"
						id="slug"
						bind:value={slug}
						required
						class="flex-1 px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
						placeholder="your-post-slug"
					/>
				</div>
			</div>

			<div>
				<label for="excerpt" class="block text-sm font-medium mb-2">Excerpt</label>
				<textarea
					id="excerpt"
					bind:value={excerpt}
					rows="2"
					class="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none"
					placeholder="A brief summary of your post"
				></textarea>
			</div>

			<div>
				<label for="cover_image" class="block text-sm font-medium mb-2">Cover Image URL (optional)</label>
				<input
					type="url"
					id="cover_image"
					bind:value={coverImage}
					class="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
					placeholder="https://example.com/image.jpg"
				/>
			</div>

			<div>
				<label for="content" class="block text-sm font-medium mb-2">
					Content
					<span class="text-[var(--color-muted)] font-normal">(Markdown supported)</span>
				</label>
				<textarea
					id="content"
					bind:value={content}
					rows="20"
					required
					class="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent font-mono text-sm"
					placeholder="Write your post content in Markdown..."
				></textarea>
			</div>

			<div class="flex items-center gap-3">
				<input
					type="checkbox"
					id="published"
					bind:checked={published}
					class="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
				/>
				<label for="published" class="text-sm">Publish immediately</label>
			</div>

			<div class="flex items-center gap-4 pt-4">
				<button
					type="submit"
					disabled={isSubmitting}
					class="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:bg-[var(--color-accent-dark)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? 'Creating...' : 'Create Post'}
				</button>
				<a href="/" class="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
					Cancel
				</a>
			</div>
		</form>
	{/if}

	<!-- Existing Posts -->
	{#if data.posts.length > 0}
		<div class="mt-16 pt-8 border-t border-[var(--color-border)]">
			<h2 class="text-2xl font-display font-bold mb-6">Your Posts</h2>
			<div class="space-y-4">
				{#each data.posts as post (post.id)}
					<div class="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)]/30 transition-colors">
						<div class="flex-1 min-w-0">
							<h3 class="font-medium truncate">{post.title}</h3>
							<p class="text-sm text-[var(--color-muted)]">
								<span class={post.published ? 'text-green-600' : 'text-amber-600'}>
									{post.published ? '● Published' : '○ Draft'}
								</span>
								<span class="mx-2">·</span>
								<span class="truncate">/blog/{post.slug}</span>
							</p>
						</div>
						<div class="flex items-center gap-3 ml-4">
							<a
								href="/admin/edit/{post.id}"
								class="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors"
							>
								Edit
							</a>
							{#if post.published}
								<a
									href="/blog/{post.slug}"
									class="px-3 py-1.5 text-sm text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-lg hover:bg-[var(--color-accent)]/5 transition-colors"
								>
									View →
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

