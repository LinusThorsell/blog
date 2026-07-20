import { pb } from '$lib/server/pocketbase';
import { getPanoramaImageUrls } from '$lib/server/images';
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
		const [posts, panoramaImageUrls] = await Promise.all([
			pb.collection('posts').getFullList<Post>({ sort: '-created' }),
			getPanoramaImageUrls()
		]);
		return { posts, panoramaImageUrls };
	} catch (error) {
		console.error('Failed to fetch posts:', error);
		return { posts: [], panoramaImageUrls: [] };
	}
};
