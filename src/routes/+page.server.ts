import { pb } from '$lib/server/pocketbase';
import type { Post } from '$lib/pocketbase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const posts = await pb.collection('posts').getFullList<Post>({
			filter: 'published = true',
			sort: '-created'
		});
		return { posts };
	} catch (error) {
		// If PocketBase is not set up yet, return empty array
		console.error('Failed to fetch posts:', error);
		return { posts: [] };
	}
};

