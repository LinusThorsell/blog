<script lang="ts">
	import { renderMarkdown } from '$lib/markdown';
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';
	import type { Post } from '$lib/pocketbase';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import { readErrorMessage, readJsonResponse } from '$lib/http';

	let { data } = $props();

	// Capture initial post values for form editing (intentionally non-reactive)
	const initialPost = untrack(() => data.post);
	let title = $state(initialPost.title);
	let slug = $state(initialPost.slug);
	let excerpt = $state(initialPost.excerpt);
	let content = $state(initialPost.content);
	let coverImage = $state(initialPost.cover_image || '');
	let coverImageFile = $state<File | null>(null);
	let useImageUpload = $state(false);
	let savedCoverImageUrl = $state(''); // Backup URL when switching to upload mode
	let published = $state(initialPost.published);

	let isSubmitting = $state(false);
	let isDeleting = $state(false);
	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let showPreview = $state(false);
	let showDeleteConfirm = $state(false);
	let panoramaImageUrls = $state(untrack(() => data.panoramaImageUrls));

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

	const previewHtml = $derived(renderMarkdown(content, panoramaImageUrls));
	const hasChanges = $derived(
		title !== data.post.title ||
		slug !== data.post.slug ||
		excerpt !== data.post.excerpt ||
		content !== data.post.content ||
		coverImage !== (data.post.cover_image || '') ||
		coverImageFile !== null ||
		published !== data.post.published
	);

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			coverImageFile = input.files[0];
		}
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

				response = await fetch(`/api/posts/${data.post.id}`, {
					method: 'PATCH',
					body: formData
				});
			} else {
				// Use JSON for URL-based images
				response = await fetch(`/api/posts/${data.post.id}`, {
					method: 'PATCH',
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
				throw new Error(await readErrorMessage(response, 'Failed to update post'));
			}

			const post = await readJsonResponse<Post>(response);
			message = { type: 'success', text: 'Post updated successfully!' };
			
			// Update the original data to reset hasChanges
			data.post = post;
			coverImageFile = null;
			coverImage = post.cover_image || '';
			savedCoverImageUrl = '';
			useImageUpload = false;
		} catch (err: any) {
			message = { type: 'error', text: err.message || 'Failed to update post' };
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDelete() {
		isDeleting = true;
		message = null;

		try {
			const response = await fetch(`/api/posts/${data.post.id}`, {
				method: 'DELETE'
			});

			if (!response.ok && response.status !== 204) {
				throw new Error(await readErrorMessage(response, 'Failed to delete post'));
			}

			goto('/admin');
		} catch (err: any) {
			message = { type: 'error', text: err.message || 'Failed to delete post' };
			showDeleteConfirm = false;
		} finally {
			isDeleting = false;
		}
	}
</script>

<svelte:head>
	<title>Edit: {data.post.title} - The Blog</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12">
	<div class="flex items-center justify-between mb-8">
		<div>
			<a href="/admin" class="text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors text-sm mb-2 inline-block">
				← Back to Admin
			</a>
			<h1 class="text-3xl font-display font-bold">Edit Post</h1>
		</div>
		<div class="flex items-center gap-3">
			<button
				type="button"
				onclick={() => (showPreview = !showPreview)}
				class="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors cursor-pointer"
			>
				{showPreview ? 'Edit' : 'Preview'}
			</button>
			{#if published}
				<a
					href="/blog/{slug}"
					target="_blank"
					class="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors"
				>
					View Live →
				</a>
			{/if}
		</div>
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
				<MarkdownEditor
					id="content"
					bind:value={content}
					bind:panoramaImageUrls
				/>
			</div>

			<div class="flex items-center gap-3">
				<input
					type="checkbox"
					id="published"
					bind:checked={published}
					class="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
				/>
				<label for="published" class="text-sm">Published</label>
			</div>

			<div class="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
				<div class="flex items-center gap-4">
					<button
						type="submit"
						disabled={isSubmitting || !hasChanges}
						class="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:bg-[var(--color-accent-dark)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? 'Saving...' : 'Save Changes'}
					</button>
					{#if hasChanges}
						<span class="text-sm text-[var(--color-muted)]">Unsaved changes</span>
					{/if}
				</div>

				<button
					type="button"
					onclick={() => (showDeleteConfirm = true)}
					class="px-4 py-2 text-[var(--color-error-text)] hover:bg-[var(--color-error-bg)] rounded-lg transition-colors cursor-pointer"
				>
					Delete Post
				</button>
			</div>
		</form>
	{/if}

	<!-- Delete Confirmation Modal -->
	{#if showDeleteConfirm}
		<div
			class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			role="button"
			tabindex="0"
			onclick={() => (showDeleteConfirm = false)}
			onkeydown={(e) => e.key === 'Escape' && (showDeleteConfirm = false)}
		>
			<div
				class="bg-[var(--color-surface)] rounded-xl p-6 max-w-md mx-4 shadow-xl"
				role="dialog"
				aria-labelledby="delete-modal-title"
				aria-modal="true"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<h2 id="delete-modal-title" class="text-xl font-display font-bold mb-2">Delete Post?</h2>
				<p class="text-[var(--color-muted)] mb-6">
					Are you sure you want to delete "<strong>{data.post.title}</strong>"? This action cannot be undone.
				</p>
				<div class="flex items-center justify-end gap-3">
					<button
						type="button"
						onclick={() => (showDeleteConfirm = false)}
						class="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleDelete}
						disabled={isDeleting}
						class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isDeleting ? 'Deleting...' : 'Delete'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
