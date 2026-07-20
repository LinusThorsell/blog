import { pb } from '$lib/server/pocketbase';
import { getPanoramaImageUrls } from '$lib/server/images';
import type { Post } from '$lib/pocketbase';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Require authentication
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	try {
		const [post, panoramaImageUrls] = await Promise.all([
			pb.collection('posts').getOne<Post>(params.id),
			getPanoramaImageUrls()
		]);
		return { post, panoramaImageUrls };
	} catch (err) {
		throw error(404, {
			message: 'Post not found'
		});
	}
};
