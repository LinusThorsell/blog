import { pb } from '$lib/server/pocketbase';
import type { Post } from '$lib/pocketbase';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	try {
		// Fetch all posts (including drafts) for admin view
		const posts = await pb.collection('posts').getFullList<Post>({
			sort: '-created'
		});
		return { posts };
	} catch (error) {
		console.error('Failed to fetch posts:', error);
		return { posts: [] };
	}
};

