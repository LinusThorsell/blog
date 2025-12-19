import { pb } from '$lib/server/pocketbase';
import type { Post, PostCreate } from '$lib/pocketbase';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET all published posts
export const GET: RequestHandler = async ({ url }) => {
	try {
		const includeUnpublished = url.searchParams.get('all') === 'true';
		const filter = includeUnpublished ? '' : 'published = true';

		const posts = await pb.collection('posts').getFullList<Post>({
			filter,
			sort: '-created'
		});

		return json(posts);
	} catch (err) {
		console.error('Failed to fetch posts:', err);
		return json([]);
	}
};

// POST create a new post
export const POST: RequestHandler = async ({ request, locals }) => {
	// Require authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const body: PostCreate = await request.json();

		// Validate required fields
		if (!body.title || !body.slug || !body.content) {
			throw error(400, 'Missing required fields: title, slug, content');
		}

		// Create slug if not provided
		if (!body.slug) {
			body.slug = body.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');
		}

		const post = await pb.collection('posts').create<Post>({
			...body,
			published: body.published ?? false
		});

		return json(post, { status: 201 });
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Failed to create post:', err);
		throw error(500, 'Failed to create post');
	}
};

