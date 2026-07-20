<script lang="ts">
	import '@milkdown/theme-nord/style.css';
	import '@milkdown/kit/prose/view/style/prosemirror.css';
	import { readErrorMessage, readJsonResponse } from '$lib/http';
	import { onDestroy, onMount } from 'svelte';

	const PANORAMA_MIN_ASPECT_RATIO = 2.4;

	type UploadedImage = {
		url: string;
		alt: string;
		isPanorama: boolean;
	};

	type PanoramaPrompt = {
		file: File;
		resolve: (isPanorama: boolean) => void;
	};

	let {
		value = $bindable(''),
		id = 'markdown-editor',
		panoramaImageUrls = $bindable([] as string[])
	} = $props<{
		value: string;
		id?: string;
		panoramaImageUrls?: string[];
	}>();

	let root: HTMLDivElement;
	let fileInput: HTMLInputElement;
	let editor: any;
	let commandsCtxRef: any;
	let insertImageCommandRef: any;
	let isReady = $state(false);
	let isUploading = $state(false);
	let uploadError = $state('');
	let panoramaPrompt = $state<PanoramaPrompt | null>(null);

	async function isWideImage(file: File): Promise<boolean> {
		const url = URL.createObjectURL(file);

		try {
			const image = new Image();
			image.src = url;
			await image.decode();

			return image.naturalWidth / image.naturalHeight >= PANORAMA_MIN_ASPECT_RATIO;
		} catch {
			return false;
		} finally {
			URL.revokeObjectURL(url);
		}
	}

	function confirmPanorama(file: File): Promise<boolean> {
		return new Promise((resolve) => {
			panoramaPrompt = { file, resolve };
		});
	}

	function resolvePanorama(isPanorama: boolean) {
		const prompt = panoramaPrompt;
		panoramaPrompt = null;
		prompt?.resolve(isPanorama);
	}

	async function uploadImages(files: File[]): Promise<UploadedImage[]> {
		const images = files.filter((file) => file.type.startsWith('image/'));
		if (images.length === 0) return [];

		const formData = new FormData();
		for (const image of images) {
			const isPanorama = (await isWideImage(image)) && (await confirmPanorama(image));
			formData.append('images', image);
			formData.append('is_panorama', String(isPanorama));
		}

		const response = await fetch('/api/images', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error(await readErrorMessage(response, 'Failed to upload images'));
		}

		const result = await readJsonResponse<{ images: UploadedImage[] }>(response);
		panoramaImageUrls = [
			...panoramaImageUrls,
			...result.images.filter((image) => image.isPanorama).map((image) => image.url)
		];
		return result.images;
	}

	async function handleManualUpload() {
		const files = Array.from(fileInput.files ?? []);
		fileInput.value = '';
		if (files.length === 0 || !editor) return;

		isUploading = true;
		uploadError = '';

		try {
			const images = await uploadImages(files);

			editor.action((ctx: any) => {
				const commands = ctx.get(commandsCtxRef);
				for (const image of images) {
					commands.call(insertImageCommandRef.key, {
						src: image.url,
						alt: image.alt
					});
				}
			});
		} catch (err: any) {
			uploadError = err.message || 'Failed to upload images';
		} finally {
			isUploading = false;
		}
	}

	onMount(async () => {
		const [
			{ Editor, rootCtx, defaultValueCtx, commandsCtx },
			{ commonmark, insertImageCommand },
			{ gfm },
			{ history },
			{ listener, listenerCtx },
			{ upload, uploadConfig },
			{ nord }
		] = await Promise.all([
			import('@milkdown/kit/core'),
			import('@milkdown/kit/preset/commonmark'),
			import('@milkdown/kit/preset/gfm'),
			import('@milkdown/kit/plugin/history'),
			import('@milkdown/kit/plugin/listener'),
			import('@milkdown/kit/plugin/upload'),
			import('@milkdown/theme-nord')
		]);

		commandsCtxRef = commandsCtx;
		insertImageCommandRef = insertImageCommand;

		editor = await Editor.make()
			.config((ctx: any) => {
				ctx.set(rootCtx, root);
				ctx.set(defaultValueCtx, value);
				ctx.update(uploadConfig.key, (prev: any) => ({
					...prev,
					uploader: async (files: FileList, schema: any) => {
						const images = await uploadImages(Array.from(files));
						const imageNode = schema.nodes.image;

						return images.map((image) =>
							imageNode.createAndFill({
								src: image.url,
								alt: image.alt
							})
						);
					},
					enableHtmlFileUploader: true
				}));
				ctx.get(listenerCtx).markdownUpdated((_ctx: any, markdown: string) => {
					value = markdown;
				});
				nord(ctx);
			})
			.use(commonmark)
			.use(gfm)
			.use(history)
			.use(listener)
			.use(upload)
			.create();

		isReady = true;
	});

	onDestroy(() => {
		panoramaPrompt?.resolve(false);
		editor?.destroy();
	});
</script>

<div class="space-y-2">
	<div class="flex flex-wrap items-center gap-2">
		<button
			type="button"
			onclick={() => fileInput.click()}
			disabled={!isReady || isUploading}
			class="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isUploading ? 'Uploading...' : 'Upload image'}
		</button>
		{#if uploadError}
			<p class="text-sm text-[var(--color-error-text)]">{uploadError}</p>
		{/if}
	</div>

	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		multiple
		class="sr-only"
		onchange={handleManualUpload}
	/>

	{#if panoramaPrompt}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<dialog
				open
				class="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-[var(--color-ink)] shadow-xl"
				aria-labelledby="panorama-dialog-title"
			>
				<h2 id="panorama-dialog-title" class="text-xl font-display font-bold">Use as a panorama?</h2>
				<p class="mt-2 text-[var(--color-muted)]">{panoramaPrompt.file.name}</p>
				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onclick={() => resolvePanorama(false)}
						class="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors cursor-pointer"
					>
						Regular image
					</button>
					<button
						type="button"
						onclick={() => resolvePanorama(true)}
						class="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-dark)] transition-colors cursor-pointer"
					>
						Panorama
					</button>
				</div>
			</dialog>
		</div>
	{/if}

	<div
		{id}
		bind:this={root}
		class="markdown-editor min-h-[28rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-input)]"
	></div>
</div>

<style>
	.markdown-editor :global(.milkdown) {
		min-height: 28rem;
	}

	.markdown-editor :global(.ProseMirror) {
		min-height: 28rem;
		padding: 1rem;
		outline: none;
	}

	.markdown-editor :global(.ProseMirror p.is-editor-empty:first-child::before) {
		color: var(--color-muted);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}

	.markdown-editor :global(img) {
		max-width: 100%;
		border-radius: 8px;
	}
</style>
