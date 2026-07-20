import { pb } from '$lib/server/pocketbase';
import { getPanoramaImageUrls } from '$lib/server/images';
import type { Post } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const [post, panoramaImageUrls] = await Promise.all([
			pb.collection('posts').getFirstListItem<Post>(`slug = "${params.slug}" && published = true`),
			getPanoramaImageUrls()
		]);

		return { post, panoramaImageUrls };
	} catch (err) {
		throw error(404, {
			message: 'Post not found'
		});
	}
};
