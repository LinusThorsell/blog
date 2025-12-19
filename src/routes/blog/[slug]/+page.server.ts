import { pb } from '$lib/server/pocketbase';
import type { Post } from '$lib/pocketbase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const post = await pb.collection('posts').getFirstListItem<Post>(
			`slug = "${params.slug}" && published = true`
		);
		return { post };
	} catch (err) {
		throw error(404, {
			message: 'Post not found'
		});
	}
};

