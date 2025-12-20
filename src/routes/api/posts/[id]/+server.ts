import { pb } from '$lib/server/pocketbase';
import { uploadImage } from '$lib/server/images';
import type { Post, PostCreate } from '$lib/pocketbase';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET single post by ID
export const GET: RequestHandler = async ({ params }) => {
	try {
		const post = await pb.collection('posts').getOne<Post>(params.id);
		return json(post);
	} catch (err) {
		throw error(404, 'Post not found');
	}
};

// PATCH update a post
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	// Require authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const contentType = request.headers.get('content-type');

		if (contentType?.includes('multipart/form-data')) {
			// Handle file upload with FormData
			const formData = await request.formData();

			const postData: Partial<PostCreate> = {
				title: formData.get('title') as string,
				slug: formData.get('slug') as string,
				excerpt: formData.get('excerpt') as string,
				content: formData.get('content') as string,
				published: formData.get('published') === 'true'
			};

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

			// Update the post with the image URL
			const post = await pb.collection('posts').update<Post>(params.id, postData);

			return json(post);
		} else {
			// Handle JSON request (URL-based image)
			const body: Partial<PostCreate> = await request.json();
			const post = await pb.collection('posts').update<Post>(params.id, body);
			return json(post);
		}
	} catch (err: any) {
		if (err.status === 404) {
			throw error(404, 'Post not found');
		}
		console.error('Failed to update post:', err);
		throw error(500, 'Failed to update post');
	}
};

// DELETE a post
export const DELETE: RequestHandler = async ({ params, locals }) => {
	// Require authentication
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		await pb.collection('posts').delete(params.id);
		return new Response(null, { status: 204 });
	} catch (err: any) {
		if (err.status === 404) {
			throw error(404, 'Post not found');
		}
		console.error('Failed to delete post:', err);
		throw error(500, 'Failed to delete post');
	}
};

