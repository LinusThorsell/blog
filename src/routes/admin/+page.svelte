<script lang="ts">
	import { marked } from '$lib/markdown';
	import type { Post } from '$lib/pocketbase';

	let { data } = $props();

	let title = $state('');
	let slug = $state('');
	let excerpt = $state('');
	let content = $state('');
	let coverImage = $state('');
	let coverImageFile = $state<File | null>(null);
	let useImageUpload = $state(false);
	let savedCoverImageUrl = $state(''); // Backup URL when switching to upload mode
	let published = $state(false);

	let isSubmitting = $state(false);
	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let showPreview = $state(false);

	let blobUrl = $state<string | null>(null);

	// Manage blob URL lifecycle
	$effect(() => {
		let currentBlobUrl: string | null = null;

		// Create new blob URL if file exists
		if (coverImageFile) {
			currentBlobUrl = URL.createObjectURL(coverImageFile);
			blobUrl = currentBlobUrl;
		} else {
			blobUrl = null;
		}

		// Cleanup when file changes or component unmounts
		return () => {
			if (currentBlobUrl) {
				URL.revokeObjectURL(currentBlobUrl);
			}
		};
	});

	const previewImageUrl = $derived(blobUrl || coverImage);

	const previewHtml = $derived(marked(content));

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			coverImageFile = input.files[0];
		}
	}

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
			let response: Response;

			if (useImageUpload && coverImageFile) {
				// Use FormData for file upload
				const formData = new FormData();
				formData.append('title', title);
				formData.append('slug', slug);
				formData.append('excerpt', excerpt);
				formData.append('content', content);
				formData.append('published', String(published));
				formData.append('cover_image', coverImageFile);

				response = await fetch('/api/posts', {
					method: 'POST',
					body: formData
				});
			} else {
				// Use JSON for URL-based images
				response = await fetch('/api/posts', {
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
			}

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
			coverImageFile = null;
			savedCoverImageUrl = '';
			useImageUpload = false;
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
			{#if previewImageUrl}
				<img src={previewImageUrl} alt={title} class="w-full aspect-[2/1] object-cover rounded-lg mb-8" />
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
				<div class="flex items-center justify-between mb-2">
					<span class="block text-sm font-medium">Cover Image (optional)</span>
					<div class="flex items-center gap-2 text-sm">
						<button
							type="button"
							onclick={() => {
								useImageUpload = false;
								coverImageFile = null;
								// Restore the saved URL
								if (savedCoverImageUrl) {
									coverImage = savedCoverImageUrl;
								}
							}}
							class="px-3 py-1 rounded-md transition-colors {!useImageUpload
								? 'bg-[var(--color-accent)] text-white'
								: 'text-[var(--color-muted)] hover:bg-[var(--color-hover)]'}"
						>
							URL
						</button>
						<button
							type="button"
							onclick={() => {
								useImageUpload = true;
								// Save current URL before clearing
								savedCoverImageUrl = coverImage;
								coverImage = '';
							}}
							class="px-3 py-1 rounded-md transition-colors {useImageUpload
								? 'bg-[var(--color-accent)] text-white'
								: 'text-[var(--color-muted)] hover:bg-[var(--color-hover)]'}"
						>
							Upload
						</button>
					</div>
				</div>

				{#if useImageUpload}
					<div class="relative">
						<input
							type="file"
							id="cover_image_file"
							accept="image/*"
							onchange={handleFileChange}
							class="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--color-accent)] file:text-white hover:file:bg-[var(--color-accent-dark)] file:cursor-pointer"
						/>
						{#if coverImageFile}
							<p class="mt-2 text-sm text-[var(--color-muted)]">
								Selected: {coverImageFile.name} ({(coverImageFile.size / 1024 / 1024).toFixed(2)} MB)
							</p>
						{/if}
					</div>
				{:else}
					<input
						type="url"
						id="cover_image"
						bind:value={coverImage}
						class="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
						placeholder="https://example.com/image.jpg"
					/>
				{/if}
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

