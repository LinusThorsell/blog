import { pb } from '$lib/server/pocketbase';
import { uploadImage } from '$lib/server/images';
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
		const contentType = request.headers.get('content-type');
		let postData: PostCreate;

		if (contentType?.includes('multipart/form-data')) {
			// Handle file upload with FormData
			const formData = await request.formData();

			postData = {
				title: formData.get('title') as string,
				slug: formData.get('slug') as string,
				excerpt: formData.get('excerpt') as string,
				content: formData.get('content') as string,
				published: formData.get('published') === 'true'
			};

			// Validate required fields
			if (!postData.title || !postData.slug || !postData.content) {
				throw error(400, 'Missing required fields: title, slug, content');
			}

			// Upload image if provided
			const coverImageFile = formData.get('cover_image');
			if (coverImageFile && coverImageFile instanceof File && coverImageFile.size > 0) {
				try {
					const imageUrl = await uploadImage(coverImageFile);
					postData.cover_image = imageUrl;
				} catch (uploadErr) {
					console.error('Image upload failed:', uploadErr);
					throw error(500, 'Failed to upload image');
				}
			}

			// Create the post with the image URL
			const post = await pb.collection('posts').create<Post>({
				...postData,
				published: postData.published ?? false
			});

			return json(post, { status: 201 });
		} else {
			// Handle JSON request (URL-based image)
			postData = await request.json();

			// Validate required fields
			if (!postData.title || !postData.slug || !postData.content) {
				throw error(400, 'Missing required fields: title, slug, content');
			}

			// Create slug if not provided
			if (!postData.slug) {
				postData.slug = postData.title
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/(^-|-$)/g, '');
			}

			const post = await pb.collection('posts').create<Post>({
				...postData,
				published: postData.published ?? false
			});

			return json(post, { status: 201 });
		}
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Failed to create post:', err);
		throw error(500, 'Failed to create post');
	}
};

