import { uploadImage } from '$lib/server/images';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const files = formData.getAll('images').filter((file): file is File => file instanceof File);

	if (files.length === 0) {
		throw error(400, 'No image files provided');
	}

	try {
		const images = await Promise.all(
			files.map(async (file) => {
				if (!file.type.startsWith('image/')) {
					throw error(400, `${file.name || 'Uploaded file'} is not an image`);
				}

				const url = await uploadImage(file);
				return {
					url,
					alt: file.name.replace(/\.[^.]+$/, '')
				};
			})
		);

		return json({ images });
	} catch (err: any) {
		if (err.status) throw err;
		console.error('Failed to upload images:', err);
		throw error(500, 'Failed to upload images');
	}
};
