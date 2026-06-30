<script lang="ts">
	import type { Post } from '$lib/pocketbase';
	import PostCard from '$lib/components/PostCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Linus Blog - Stories, Tech & Ideas</title>
	<meta name="description" content="A modern blog built with SvelteKit and PocketBase" />
</svelte:head>

<section class="max-w-4xl mx-auto px-6 py-16">
	<!-- Hero Section -->
	<div class="text-center mb-16">
		<h1 class="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">
			Sounds like a Linus <br/> story to me
		</h1>
		<p class="text-xl text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed">
			Exploring thoughts, going on adventures, sharing knowledge, <br/> and documenting the journey à la 2011 style.<br>
		</p>
	</div>

	<!-- Posts Grid -->
	{#if data.posts.length > 0}
		<div class="grid gap-8">
			{#each data.posts as post (post.id)}
				<PostCard {post} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-20 border border-dashed border-[var(--color-border)] rounded-lg">
			<h2 class="text-2xl font-display font-semibold mb-2">Coming soon</h2>
		</div>
	{/if}
</section>

