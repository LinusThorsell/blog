import { pb } from './pocketbase';
import { env } from '$env/dynamic/public';

export interface ImageRecord {
	id: string;
	file: string;
	collectionId: string;
	is_panorama: boolean;
	created: string;
	updated: string;
}

export function getImageUrl(record: ImageRecord): string {
	return `${env.PUBLIC_POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.file}`;
}

export async function getPanoramaImageUrls(): Promise<string[]> {
	const images = await pb.collection('images').getFullList<ImageRecord>({
		filter: 'is_panorama = true'
	});

	return images.map(getImageUrl);
}

/**
 * Uploads an image file to PocketBase images collection
 * @param file The file to upload
 * @returns The public image URL
 */
export async function uploadImage(file: File, isPanorama = false): Promise<string> {
	try {
		// Create FormData for the upload
		const formData = new FormData();
		formData.append('file', file);
		formData.append('is_panorama', String(isPanorama));

		// Upload to images collection
		const record = await pb.collection('images').create<ImageRecord>(formData);

		return getImageUrl(record);
	} catch (error) {
		console.error('Failed to upload image:', error);
		throw new Error('Failed to upload image to server');
	}
}
