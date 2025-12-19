<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();

	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Login - The Blog</title>
</svelte:head>

<div class="min-h-[80vh] flex items-center justify-center px-6">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-display font-bold mb-2">Welcome Back</h1>
			<p class="text-[var(--color-muted)]">Sign in to manage your blog</p>
		</div>

		{#if form?.error}
			<div class="mb-6 p-4 rounded-lg border bg-[var(--color-error-bg)] text-[var(--color-error-text)] border-[var(--color-error-border)]">
				{form.error}
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
			class="space-y-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8"
		>
			<div>
				<label for="email" class="block text-sm font-medium mb-2">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					autocomplete="email"
					class="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
					placeholder="admin@example.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium mb-2">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					autocomplete="current-password"
					class="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-input)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
					placeholder="••••••••"
				/>
			</div>

			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full px-6 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] rounded-lg font-medium hover:bg-[var(--color-accent)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isSubmitting ? 'Signing in...' : 'Sign In'}
			</button>
		</form>

		<p class="text-center text-sm text-[var(--color-muted)] mt-6">
			<a href="/" class="hover:text-[var(--color-ink)] transition-colors">← Back to blog</a>
		</p>
	</div>
</div>

