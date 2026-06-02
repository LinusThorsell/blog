import { pb } from './pocketbase';
import { env } from '$env/dynamic/public';

export interface ImageRecord {
	id: string;
	file: string;
	collectionId: string;
	created: string;
	updated: string;
}

/**
 * Uploads an image file to PocketBase images collection
 * @param file The file to upload
 * @returns The full URL to the uploaded image (using client-facing URL)
 */
export async function uploadImage(file: File): Promise<string> {
	try {
		// Create FormData for the upload
		const formData = new FormData();
		formData.append('file', file);

		// Upload to images collection
		const record = await pb.collection('images').create<ImageRecord>(formData);

		// Construct the file URL using the PUBLIC URL for client access
		// PocketBase file URL format: /api/files/{collectionId}/{recordId}/{filename}
		const fileUrl = `${env.PUBLIC_POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.file}`;

		return fileUrl;
	} catch (error) {
		console.error('Failed to upload image:', error);
		throw new Error('Failed to upload image to server');
	}
}

